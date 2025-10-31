import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import { interfaze } from '../models';
import { AgentState, getPendingTasks, getCriticalTasks, addFinding } from './utils';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Agent methods: decision making, action executors, and reporting
 */

// ============================================================
// ZOD SCHEMAS
// ============================================================

const decisionSchema = z.object({
  action: z.enum(['process_regulatory_doc', 'analyze_transaction', 'calculate_risk', 'fetch_updates']).describe('The action to take next'),
  reasoning: z.string().describe('Why this action was chosen'),
  task_id: z.string().describe('Which task to process'),
  escalate: z.boolean().describe('Whether to escalate critical issues'),
});

const regulatoryAnalysisSchema = z.object({
  obligations: z.array(z.string()).describe('Key reporting obligations'),
  deadlines: z.array(z.string()).describe('Timeline constraints'),
  entities: z.array(z.string()).describe('Entities involved'),
  requirements: z.array(z.string()).describe('Critical compliance requirements'),
  red_flags: z.array(z.string()).describe('Suspicious patterns or red flags'),
  risk_level: z.enum(['low', 'medium', 'high', 'critical']).describe('Overall risk assessment'),
});

const transactionAnalysisSchema = z.object({
  total_amount: z.number().describe('Total transaction amount'),
  tax_amount: z.number().nullable().describe('Tax amount if present, null otherwise'),
  date: z.string().nullable().describe('Transaction date if present, null otherwise'),
  merchant: z.string().nullable().describe('Merchant name if present, null otherwise'),
  payment_method: z.string().nullable().describe('Payment method if present, null otherwise'),
  red_flags: z.array(z.string()).describe('AML red flags identified'),
  risk_level: z.enum(['low', 'medium', 'high', 'critical']).describe('Risk assessment'),
});

// ============================================================
// TYPES
// ============================================================

export type Decision = z.infer<typeof decisionSchema>;
export type RegulatoryAnalysis = z.infer<typeof regulatoryAnalysisSchema>;
export type TransactionAnalysis = z.infer<typeof transactionAnalysisSchema>;

// ============================================================
// AGENT DECISION MAKING
// ============================================================

export async function makeDecision(state: AgentState): Promise<Decision> {
  const pendingTasks = getPendingTasks(state);
  const criticalTasks = getCriticalTasks(state);

  const statePrompt = `CURRENT STATE:
- Pending Tasks: ${JSON.stringify(pendingTasks, null, 2)}
- Critical Tasks: ${JSON.stringify(criticalTasks, null, 2)}
- Findings Count: ${state.findings.length}

Decide the next action based on priority and risk.`;

  // Only push user message with current state
  state.conversationHistory.push({
    role: 'user',
    content: statePrompt,
  });

  const response = await interfaze.chat.completions.create({
    model: 'interfaze-beta',
    messages: state.conversationHistory,
    response_format: zodResponseFormat(decisionSchema, 'decision'),
  });

  const decisionText = response.choices[0]?.message?.content || '';
  state.conversationHistory.push({ role: 'assistant', content: decisionText });

  const decision: Decision = JSON.parse(decisionText);
  return decision;
}

// ============================================================
// ACTION EXECUTORS
// ============================================================

export async function processRegulatoryDocument(state: AgentState, taskId: string) {
  console.log('\n📄 Processing Regulatory Document...');

  // Read and encode PDF file to base64
  const pdfPath = path.join(__dirname, 'sample_police_incident_report_training_only.pdf');
  const pdfData = fs.readFileSync(pdfPath);
  const base64Data = pdfData.toString('base64');

  const response = await interfaze.chat.completions.create({
    model: 'interfaze-beta',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze this incident report as if it were a regulatory circular.

Extract key reporting obligations, deadlines, entities, compliance requirements, and red flags.
Assess the overall risk level.`,
          },
          {
            type: 'file',
            file: {
              filename: 'sample_police_incident_report_training_only.pdf',
              file_data: base64Data,
            },
          },
        ],
      },
    ],
    response_format: zodResponseFormat(regulatoryAnalysisSchema, 'regulatory_analysis'),
  });

  const analysisText = response.choices[0]?.message?.content || '';
  const analysis: RegulatoryAnalysis = JSON.parse(analysisText);
  
  console.log('✅ Document Analysis Complete');
  console.log(`   Risk Level: ${analysis.risk_level.toUpperCase()}`);
  console.log(`   Red Flags: ${analysis.red_flags.length}`);

  addFinding(state, taskId, 'regulatory_analysis', JSON.stringify(analysis, null, 2));

  // Check for critical issues
  const task = state.tasks.find((t) => t.id === taskId);
  if (task && (analysis.risk_level === 'critical' || analysis.risk_level === 'high')) {
    task.status = 'flagged';
    task.priority = 'critical';
  }
}

export async function analyzeTransaction(state: AgentState, taskId: string) {
  console.log('\n💳 Analyzing Transaction Receipt...');

  const response = await interfaze.chat.completions.create({
    model: 'interfaze-beta',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Extract transaction details and identify AML red flags.
            
Flag if amount >$10,000 or shows structuring patterns.
Assess risk level (low, medium, high, critical).`,
          },
          {
            type: 'image_url',
            image_url: {
              url: 'https://media.istockphoto.com/id/1420767944/vector/register-sale-receipt-isolated-on-white-background-cash-receipt-printed.jpg?s=612x612&w=0&k=20&c=eV7CDJK0DZgKo7KVlGTDJeVMN_2xybqIPvt1ATl_kkM=',
            },
          },
        ],
      },
    ],
    response_format: zodResponseFormat(transactionAnalysisSchema, 'transaction_analysis'),
  });

  const analysisText = response.choices[0]?.message?.content || '';
  const analysis: TransactionAnalysis = JSON.parse(analysisText);
  
  console.log('✅ Transaction Analysis Complete');
  console.log(`   Amount: $${analysis.total_amount}`);
  if (analysis.tax_amount !== null) {
    console.log(`   Tax: $${analysis.tax_amount}`);
  }
  if (analysis.merchant !== null) {
    console.log(`   Merchant: ${analysis.merchant}`);
  }
  if (analysis.payment_method !== null) {
    console.log(`   Payment: ${analysis.payment_method}`);
  }
  console.log(`   Risk Level: ${analysis.risk_level.toUpperCase()}`);
  console.log(`   Red Flags: ${analysis.red_flags.length}`);

  addFinding(state, taskId, 'transaction_analysis', JSON.stringify(analysis, null, 2));
  
  // Flag high-risk transactions
  const task = state.tasks.find((t) => t.id === taskId);
  if (task && (analysis.risk_level === 'critical' || analysis.risk_level === 'high')) {
    task.status = 'flagged';
    task.priority = 'critical';
  }
}

export async function calculateRiskScore(state: AgentState, taskId: string) {
  console.log('\n🧮 Calculating Compliance Risk Scores...');

  const pythonCode = `
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
`;

  const response = await interfaze.chat.completions.create({
    model: 'interfaze-beta',
    messages: [
      {
        role: 'user',
        content: `Run this Python code to calculate AML risk scores:\n\n${pythonCode}`,
      },
    ],
  });

  const calculation = response.choices[0]?.message?.content || '';
  console.log('✅ Risk Calculation Complete\n');
  console.log(calculation);

  addFinding(state, taskId, 'risk_assessment', calculation);

  // Mark task as flagged if critical risks found
  const task = state.tasks.find((t) => t.id === taskId);
  if (task && (calculation.includes('CRITICAL') || calculation.includes('BLOCK'))) {
    task.status = 'flagged';
    task.priority = 'critical';
  }
}

export async function fetchRegulatoryUpdates(state: AgentState, taskId: string) {
  console.log('\n🌐 Fetching Real-Time Regulatory Updates...');

  const query = `Search for latest (October 2025) information on:
1. MAS (Monetary Authority of Singapore) AML/CFT updates or circulars
2. FATF high-risk jurisdictions list
3. Recent banking transaction monitoring requirements
4. RegTech compliance trends

Provide actionable intelligence for compliance teams.`;

  const response = await interfaze.chat.completions.create({
    model: 'interfaze-beta',
    messages: [
      {
        role: 'user',
        content: query,
      },
    ],
  });

  const updates = response.choices[0]?.message?.content || '';
  console.log('✅ Regulatory Updates Fetched');

  addFinding(state, taskId, 'regulatory_updates', updates);
}

// ============================================================
// ESCALATION & REPORTING
// ============================================================

export async function handleEscalation(state: AgentState) {
  console.log('\n🚨 CRITICAL ISSUES DETECTED - ESCALATING');
  console.log('='.repeat(70));

  const escalationPrompt = `CRITICAL COMPLIANCE ISSUES DETECTED

Findings: ${JSON.stringify(state.findings, null, 2)}

Generate escalation alert with:
1. Executive summary
2. Severity level
3. Immediate actions required
4. Regulatory impact
5. Recommended next steps`;

  const response = await interfaze.chat.completions.create({
    model: 'interfaze-beta',
    messages: [
      {
        role: 'system',
        content: 'Generate urgent escalation alert for compliance leadership.',
      },
      {
        role: 'user',
        content: escalationPrompt,
      },
    ],
  });

  const alert = response.choices[0]?.message?.content || '';
  console.log(alert);
  console.log('='.repeat(70));
}

export async function generateFinalReport(state: AgentState) {
  console.log('\n\n📊 GENERATING FINAL COMPLIANCE REPORT');
  console.log('='.repeat(70));

  const reportPrompt = `Generate comprehensive compliance report based on:

${JSON.stringify(state.findings, null, 2)}

Include:
1. Executive Summary
2. Key Findings (by severity)
3. Regulatory Obligations
4. Transaction Risk Analysis  
5. Compliance Gaps
6. Recommended Actions (prioritized)
7. Implementation Timeline

Make it actionable for C-suite.`;

  const response = await interfaze.chat.completions.create({
    model: 'interfaze-beta',
    messages: [
      {
        role: 'system',
        content: 'You are a senior RegTech compliance analyst creating an executive report.',
      },
      {
        role: 'user',
        content: reportPrompt,
      },
    ],
  });

  const report = response.choices[0]?.message?.content || '';
  console.log(report);
  console.log('\n' + '='.repeat(70));
}

