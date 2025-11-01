"""Agent methods: decision making, action executors, and reporting"""

import json
import os
import base64
from pathlib import Path
from typing import TypedDict, Literal
from pydantic import BaseModel, Field

from models import interfaze
from utils import (
    AgentState,
    get_pending_tasks,
    get_critical_tasks,
    add_finding,
)


# ============================================================
# PYDANTIC SCHEMAS (equivalent to Zod schemas)
# ============================================================

class Decision(BaseModel):
    action: Literal['process_regulatory_doc', 'analyze_transaction', 'calculate_risk', 'fetch_updates'] = Field(
        description='The action to take next'
    )
    reasoning: str = Field(description='Why this action was chosen')
    task_id: str = Field(description='Which task to process')
    escalate: bool = Field(description='Whether to escalate critical issues')


class RegulatoryAnalysis(BaseModel):
    obligations: list[str] = Field(description='Key reporting obligations')
    deadlines: list[str] = Field(description='Timeline constraints')
    entities: list[str] = Field(description='Entities involved')
    requirements: list[str] = Field(description='Critical compliance requirements')
    red_flags: list[str] = Field(description='Suspicious patterns or red flags')
    risk_level: Literal['low', 'medium', 'high', 'critical'] = Field(description='Overall risk assessment')


class TransactionAnalysis(BaseModel):
    total_amount: float = Field(description='Total transaction amount')
    tax_amount: float | None = Field(description='Tax amount if present, null otherwise')
    date: str | None = Field(description='Transaction date if present, null otherwise')
    merchant: str | None = Field(description='Merchant name if present, null otherwise')
    payment_method: str | None = Field(description='Payment method if present, null otherwise')
    red_flags: list[str] = Field(description='AML red flags identified')
    risk_level: Literal['low', 'medium', 'high', 'critical'] = Field(description='Risk assessment')


# ============================================================
# AGENT DECISION MAKING
# ============================================================

async def make_decision(state: AgentState) -> Decision:
    """Agent decides what action to take next"""
    pending_tasks = get_pending_tasks(state)
    critical_tasks = get_critical_tasks(state)
    
    state_prompt = f"""CURRENT STATE:
- Pending Tasks: {json.dumps(pending_tasks, indent=2)}
- Critical Tasks: {json.dumps(critical_tasks, indent=2)}
- Findings Count: {len(state['findings'])}

Decide the next action based on priority and risk."""
    
    # Only push user message with current state
    state['conversationHistory'].append({
        'role': 'user',
        'content': state_prompt,
    })
    
    response = interfaze.chat.completions.create(
        model='interfaze-beta',
        messages=state['conversationHistory'],
        response_format={
            'type': 'json_schema',
            'json_schema': {
                'name': 'decision',
                'strict': True,
                'schema': Decision.model_json_schema(),
            }
        },
    )
    
    decision_text = response.choices[0].message.content or ''
    state['conversationHistory'].append({'role': 'assistant', 'content': decision_text})
    
    decision = Decision.model_validate_json(decision_text)
    return decision


# ============================================================
# ACTION EXECUTORS
# ============================================================

async def process_regulatory_document(state: AgentState, task_id: str) -> None:
    """Process a regulatory document using vision/document extraction"""
    print('\n📄 Processing Regulatory Document...')
    
    # Read and encode PDF file to base64
    pdf_path = Path(__file__).parent.parent / 'agent' / 'sample_police_incident_report_training_only.pdf'
    with open(pdf_path, 'rb') as f:
        pdf_data = f.read()
    base64_data = base64.b64encode(pdf_data).decode('utf-8')
    
    response = interfaze.chat.completions.create(
        model='interfaze-beta',
        messages=[
            {
                'role': 'user',
                'content': [
                    {
                        'type': 'text',
                        'text': """Analyze this incident report as if it were a regulatory circular.

Extract key reporting obligations, deadlines, entities, compliance requirements, and red flags.
Assess the overall risk level.""",
                    },
                    {
                        'type': 'file',
                        'file': {
                            'filename': 'sample_police_incident_report_training_only.pdf',
                            'file_data': base64_data,
                        },
                    },
                ],
            },
        ],
        response_format={
            'type': 'json_schema',
            'json_schema': {
                'name': 'regulatory_analysis',
                'strict': True,
                'schema': RegulatoryAnalysis.model_json_schema(),
            }
        },
    )
    
    analysis_text = response.choices[0].message.content or ''
    analysis = RegulatoryAnalysis.model_validate_json(analysis_text)
    
    print('✅ Document Analysis Complete')
    print(f'   Risk Level: {analysis.risk_level.upper()}')
    print(f'   Red Flags: {len(analysis.red_flags)}')
    
    add_finding(state, task_id, 'regulatory_analysis', analysis.model_dump_json(indent=2))
    
    # Check for critical issues
    task = next((t for t in state['tasks'] if t['id'] == task_id), None)
    if task and analysis.risk_level in ['critical', 'high']:
        task['status'] = 'flagged'
        task['priority'] = 'critical'


async def analyze_transaction(state: AgentState, task_id: str) -> None:
    """Analyze a transaction receipt using vision"""
    print('\n💳 Analyzing Transaction Receipt...')
    
    response = interfaze.chat.completions.create(
        model='interfaze-beta',
        messages=[
            {
                'role': 'user',
                'content': [
                    {
                        'type': 'text',
                        'text': """Extract transaction details and identify AML red flags.
            
Flag if amount >$10,000 or shows structuring patterns.
Assess risk level (low, medium, high, critical).""",
                    },
                    {
                        'type': 'image_url',
                        'image_url': {
                            'url': 'https://media.istockphoto.com/id/1420767944/vector/register-sale-receipt-isolated-on-white-background-cash-receipt-printed.jpg?s=612x612&w=0&k=20&c=eV7CDJK0DZgKo7KVlGTDJeVMN_2xybqIPvt1ATl_kkM=',
                        },
                    },
                ],
            },
        ],
        response_format={
            'type': 'json_schema',
            'json_schema': {
                'name': 'transaction_analysis',
                'strict': True,
                'schema': TransactionAnalysis.model_json_schema(),
            }
        },
    )
    
    analysis_text = response.choices[0].message.content or ''
    analysis = TransactionAnalysis.model_validate_json(analysis_text)
    
    print('✅ Transaction Analysis Complete')
    print(f'   Amount: ${analysis.total_amount}')
    if analysis.tax_amount is not None:
        print(f'   Tax: ${analysis.tax_amount}')
    if analysis.merchant is not None:
        print(f'   Merchant: {analysis.merchant}')
    if analysis.payment_method is not None:
        print(f'   Payment: {analysis.payment_method}')
    print(f'   Risk Level: {analysis.risk_level.upper()}')
    print(f'   Red Flags: {len(analysis.red_flags)}')
    
    add_finding(state, task_id, 'transaction_analysis', analysis.model_dump_json(indent=2))
    
    # Flag high-risk transactions
    task = next((t for t in state['tasks'] if t['id'] == task_id), None)
    if task and analysis.risk_level in ['critical', 'high']:
        task['status'] = 'flagged'
        task['priority'] = 'critical'


async def calculate_risk_score(state: AgentState, task_id: str) -> None:
    """Calculate compliance risk scores using code execution"""
    print('\n🧮 Calculating Compliance Risk Scores...')
    
    python_code = """
import json

# Sample transactions based on our findings
transactions = [
    {"id": "TXN001", "amount": 15000, "type": "cash", "country_risk": 4, "customer": "high_risk", "frequency": 3},
    {"id": "TXN002", "amount": 3500, "type": "wire_transfer", "country_risk": 2, "customer": "standard", "frequency": 1},
    {"id": "TXN003", "amount": 9800, "type": "cash", "country_risk": 5, "customer": "PEP", "frequency": 5}
]

def calculate_risk_score(txn):
    score = 0
    flags = []
    
    # Amount risk
    if txn["amount"] > 10000:
        score += 30
        flags.append("Large amount (>$10k)")
    elif txn["amount"] > 5000:
        score += 15
    
    # Structuring detection
    if 9000 <= txn["amount"] < 10000:
        score += 25
        flags.append("POSSIBLE STRUCTURING - amount just below threshold")
    
    # Transaction type
    if txn["type"] == "cash":
        score += 25
        flags.append("High-risk: Cash transaction")
    elif txn["type"] == "wire_transfer":
        score += 15
    
    # Country risk (1-5)
    score += txn["country_risk"] * 5
    if txn["country_risk"] >= 4:
        flags.append("High-risk jurisdiction (risk level: " + str(txn['country_risk']) + ")")
    
    # Customer profile
    profiles = {"PEP": 30, "high_risk": 20, "standard": 5}
    score += profiles.get(txn["customer"], 10)
    if txn["customer"] in ["PEP", "high_risk"]:
        flags.append("High-risk customer: " + txn['customer'])
    
    # Frequency
    if txn["frequency"] > 3:
        score += 20
        flags.append("High frequency: " + str(txn['frequency']) + " transactions in 24h")
    
    # Determine action
    if score >= 70:
        action = "BLOCK - Immediate investigation required"
        risk = "CRITICAL"
    elif score >= 50:
        action = "HOLD - Enhanced due diligence"
        risk = "HIGH"
    elif score >= 30:
        action = "REVIEW - Standard monitoring"
        risk = "MEDIUM"
    else:
        action = "APPROVE - Low risk"
        risk = "LOW"
    
    return {"id": txn["id"], "amount": txn["amount"], "risk_score": score, "risk_level": risk, "action": action, "flags": flags}

print("=" * 70)
print("AML RISK ASSESSMENT REPORT")
print("=" * 70)

critical_count = 0
high_risk_count = 0

for txn in transactions:
    result = calculate_risk_score(txn)
    print("\\nTransaction:", result['id'], "| $" + str(result['amount']))
    print("  Risk Score:", str(result['risk_score']) + "/100")
    print("  Risk Level:", result['risk_level'])
    print("  Action:", result['action'])
    if result['flags']:
        print("  Flags:")
        for flag in result['flags']:
            print("    - " + flag)
    
    if result['risk_level'] == 'CRITICAL':
        critical_count += 1
    elif result['risk_level'] == 'HIGH':
        high_risk_count += 1

print("\\n" + "=" * 70)
print("SUMMARY:")
print("  - " + str(critical_count) + " CRITICAL transactions require IMMEDIATE action")
print("  - " + str(high_risk_count) + " HIGH-RISK transactions need enhanced due diligence")
print("=" * 70)
"""
    
    response = interfaze.chat.completions.create(
        model='interfaze-beta',
        messages=[
            {
                'role': 'user',
                'content': f'Run this Python code to calculate AML risk scores:\n\n{python_code}',
            },
        ],
    )
    
    calculation = response.choices[0].message.content or ''
    print('✅ Risk Calculation Complete\n')
    print(calculation)
    
    add_finding(state, task_id, 'risk_assessment', calculation)
    
    # Mark task as flagged if critical risks found
    task = next((t for t in state['tasks'] if t['id'] == task_id), None)
    if task and ('CRITICAL' in calculation or 'BLOCK' in calculation):
        task['status'] = 'flagged'
        task['priority'] = 'critical'


async def fetch_regulatory_updates(state: AgentState, task_id: str) -> None:
    """Fetch real-time regulatory updates using web search"""
    print('\n🌐 Fetching Real-Time Regulatory Updates...')
    
    query = """Search for latest (October 2025) information on:
1. MAS (Monetary Authority of Singapore) AML/CFT updates or circulars
2. FATF high-risk jurisdictions list
3. Recent banking transaction monitoring requirements
4. RegTech compliance trends

Provide actionable intelligence for compliance teams."""
    
    response = interfaze.chat.completions.create(
        model='interfaze-beta',
        messages=[
            {
                'role': 'user',
                'content': query,
            },
        ],
    )
    
    updates = response.choices[0].message.content or ''
    print('✅ Regulatory Updates Fetched')
    
    add_finding(state, task_id, 'regulatory_updates', updates)


# ============================================================
# ESCALATION & REPORTING
# ============================================================

async def handle_escalation(state: AgentState) -> None:
    """Handle critical issue escalation"""
    print('\n🚨 CRITICAL ISSUES DETECTED - ESCALATING')
    print('=' * 70)
    
    escalation_prompt = f"""CRITICAL COMPLIANCE ISSUES DETECTED

Findings: {json.dumps(state['findings'], indent=2)}

Generate escalation alert with:
1. Executive summary
2. Severity level
3. Immediate actions required
4. Regulatory impact
5. Recommended next steps"""
    
    response = interfaze.chat.completions.create(
        model='interfaze-beta',
        messages=[
            {
                'role': 'system',
                'content': 'Generate urgent escalation alert for compliance leadership.',
            },
            {
                'role': 'user',
                'content': escalation_prompt,
            },
        ],
    )
    
    alert = response.choices[0].message.content or ''
    print(alert)
    print('=' * 70)


async def generate_final_report(state: AgentState) -> None:
    """Generate final compliance report"""
    print('\n\n📊 GENERATING FINAL COMPLIANCE REPORT')
    print('=' * 70)
    
    report_prompt = f"""Generate comprehensive compliance report based on:

{json.dumps(state['findings'], indent=2)}

Include:
1. Executive Summary
2. Key Findings (by severity)
3. Regulatory Obligations
4. Transaction Risk Analysis  
5. Compliance Gaps
6. Recommended Actions (prioritized)
7. Implementation Timeline

Make it actionable for C-suite."""
    
    response = interfaze.chat.completions.create(
        model='interfaze-beta',
        messages=[
            {
                'role': 'system',
                'content': 'You are a senior RegTech compliance analyst creating an executive report.',
            },
            {
                'role': 'user',
                'content': report_prompt,
            },
        ],
    )
    
    report = response.choices[0].message.content or ''
    print(report)
    print('\n' + '=' * 70)

