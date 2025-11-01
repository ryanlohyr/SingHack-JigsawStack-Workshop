"""
RegTech Compliance Agent with Agentic Loop

Simple autonomous agent that:
1. Analyzes regulatory documents and transactions
2. Makes decisions based on findings
3. Loops until all compliance tasks are completed
"""

import asyncio
from utils import AgentState, ComplianceTask, has_uncompleted_tasks, has_critical_issues
from methods import (
    make_decision,
    process_regulatory_document,
    analyze_transaction,
    calculate_risk_score,
    fetch_regulatory_updates,
    handle_escalation,
    generate_final_report,
)


# ============================================================
# MAIN AGENTIC LOOP
# ============================================================

async def run_agentic_loop() -> None:
    """Main agentic loop for compliance agent"""
    print('🤖 RegTech Compliance Agent Starting...\n')
    print('=' * 70)
    
    # Initialize state
    state: AgentState = {
        'tasks': [
            ComplianceTask(id='task_1', type='regulatory_doc', status='pending', priority='high'),
            ComplianceTask(id='task_2', type='transaction', status='pending', priority='medium'),
            ComplianceTask(id='task_3', type='risk_assessment', status='pending', priority='critical'),
            ComplianceTask(id='task_4', type='regulatory_updates', status='pending', priority='medium'),
        ],
        'findings': [],
        'conversationHistory': [
            {
                'role': 'system',
                'content': """You are an autonomous RegTech compliance agent for a financial institution.

Your role:
- Analyze regulatory documents, transactions, and compliance data
- Make autonomous decisions about which tasks to prioritize
- Identify critical issues and escalate when necessary
- Ensure all compliance obligations are met

Always respond with structured JSON using the provided schemas.""",
            },
        ],
    }
    
    iteration = 0
    max_iterations = 10
    
    # Main agentic loop
    while has_uncompleted_tasks(state) and iteration < max_iterations:
        iteration += 1
        print(f'\n🔄 ITERATION {iteration}')
        print('-' * 70)
        
        # Agent decides what to do next
        decision = await make_decision(state)
        print(f'\n🧠 Agent Decision: {decision.action}')
        print(f'   Reasoning: {decision.reasoning}')
        print(f'   Task: {decision.task_id}')
        
        # Find the task
        task = next((t for t in state['tasks'] if t['id'] == decision.task_id), None)
        if not task:
            print('⚠️  Task not found, skipping...')
            continue
        
        task['status'] = 'processing'
        
        # Execute the action
        try:
            if decision.action == 'process_regulatory_doc':
                await process_regulatory_document(state, task['id'])
            elif decision.action == 'analyze_transaction':
                await analyze_transaction(state, task['id'])
            elif decision.action == 'calculate_risk':
                await calculate_risk_score(state, task['id'])
            elif decision.action == 'fetch_updates':
                await fetch_regulatory_updates(state, task['id'])
            else:
                print('⚠️  Unknown action')
            
            task['status'] = 'completed'
        except Exception as error:
            print(f'❌ Error executing action: {error}')
            task['status'] = 'flagged'
        
        # Check for critical issues - if found, escalate and exit loop
        if has_critical_issues(state):
            print('\n⚠️  CRITICAL ISSUES DETECTED - STOPPING FURTHER PROCESSING')
            await handle_escalation(state)
            break  # Exit loop immediately
        
        # Small delay for readability
        await asyncio.sleep(0.5)
    
    # Generate final report
    await generate_final_report(state)
    
    print('\n✅ AGENTIC COMPLIANCE LOOP COMPLETED\n')


# ============================================================
# RUN THE AGENT
# ============================================================

if __name__ == '__main__':
    asyncio.run(run_agentic_loop())

