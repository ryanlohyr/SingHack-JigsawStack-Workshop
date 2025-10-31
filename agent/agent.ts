import 'dotenv/config';
import { ComplianceTask, AgentState, hasUncompletedTasks, hasCriticalIssues } from './utils';
import {
  makeDecision,
  processRegulatoryDocument,
  analyzeTransaction,
  calculateRiskScore,
  fetchRegulatoryUpdates,
  handleEscalation,
  generateFinalReport,
} from './methods';

/**
 * RegTech Compliance Agent with Agentic Loop
 * 
 * Simple autonomous agent that:
 * 1. Analyzes regulatory documents and transactions
 * 2. Makes decisions based on findings
 * 3. Loops until all compliance tasks are completed
 */

// ============================================================
// MAIN AGENTIC LOOP
// ============================================================

async function runAgenticLoop() {
  console.log('🤖 RegTech Compliance Agent Starting...\n');
  console.log('='.repeat(70));

  // Initialize state locally
  const state: AgentState = {
    tasks: [
      { id: 'task_1', type: 'regulatory_doc' as const, status: 'pending', priority: 'high' } as ComplianceTask,
      { id: 'task_2', type: 'transaction' as const, status: 'pending', priority: 'medium' } as ComplianceTask,
      { id: 'task_3', type: 'risk_assessment' as const, status: 'pending', priority: 'critical' } as ComplianceTask,
      { id: 'task_4', type: 'regulatory_updates' as const, status: 'pending', priority: 'medium' } as ComplianceTask,
    ],
    findings: [],
    conversationHistory: [
      {
        role: 'system',
        content: `You are an autonomous RegTech compliance agent for a financial institution.

Your role:
- Analyze regulatory documents, transactions, and compliance data
- Make autonomous decisions about which tasks to prioritize
- Identify critical issues and escalate when necessary
- Ensure all compliance obligations are met

Always respond with structured JSON using the provided schemas.`,
      },
    ],
  };

  let iteration = 0;
  const maxIterations = 10;

  // Main agentic loop
  while (hasUncompletedTasks(state) && iteration < maxIterations) {
    iteration++;
    console.log(`\n🔄 ITERATION ${iteration}`);
    console.log('-'.repeat(70));

    // Agent decides what to do next
    const decision = await makeDecision(state);
    console.log(`\n🧠 Agent Decision: ${decision.action}`);
    console.log(`   Reasoning: ${decision.reasoning}`);
    console.log(`   Task: ${decision.task_id}`);

    // Find the task
    const task = state.tasks.find((t) => t.id === decision.task_id);
    if (!task) {
      console.log('⚠️  Task not found, skipping...');
      continue;
    }

    task.status = 'processing';

    // Execute the action
    try {
      switch (decision.action) {
        case 'process_regulatory_doc':
          await processRegulatoryDocument(state, task.id);
          break;
        case 'analyze_transaction':
          await analyzeTransaction(state, task.id);
          break;
        case 'calculate_risk':
          await calculateRiskScore(state, task.id);
          break;
        case 'fetch_updates':
          await fetchRegulatoryUpdates(state, task.id);
          break;
        default:
          console.log('⚠️  Unknown action');
      }

      task.status = 'completed';
    } catch (error) {
      console.error(`❌ Error executing action: ${error}`);
      task.status = 'flagged';
    }

    // Check for critical issues - if found, escalate and exit loop
    if (hasCriticalIssues(state)) {
      console.log('\n⚠️  CRITICAL ISSUES DETECTED - STOPPING FURTHER PROCESSING');
      await handleEscalation(state);
      break; // Exit loop immediately
    }

    // Small delay for readability
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Generate final report
  await generateFinalReport(state);

  console.log('\n✅ AGENTIC COMPLIANCE LOOP COMPLETED\n');
}

// ============================================================
// RUN THE AGENT
// ============================================================

runAgenticLoop().catch(console.error);
