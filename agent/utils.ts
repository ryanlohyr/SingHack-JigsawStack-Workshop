/**
 * Utility functions and state management for RegTech Compliance Agent
 */

// ============================================================
// TYPES & INTERFACES
// ============================================================

export interface ComplianceTask {
  id: string;
  type: 'regulatory_doc' | 'transaction' | 'risk_assessment' | 'regulatory_updates';
  status: 'pending' | 'processing' | 'completed' | 'flagged';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

// ============================================================
// STATE TYPE
// ============================================================

export interface AgentState {
  tasks: ComplianceTask[];
  findings: any[];
  conversationHistory: any[];
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

export function getPendingTasks(state: AgentState) {
  return state.tasks.filter((t) => t.status === 'pending');
}

export function getCriticalTasks(state: AgentState) {
  return state.tasks.filter((t) => t.status === 'flagged' || t.priority === 'critical');
}

export function hasUncompletedTasks(state: AgentState) {
  return state.tasks.some((t) => t.status !== 'completed');
}

export function addFinding(state: AgentState, taskId: string, type: string, content: string) {
  state.findings.push({
    task_id: taskId,
    type,
    content,
    timestamp: new Date().toISOString(),
  });
}

export function hasCriticalIssues(state: AgentState) {
  console.log('Checking for critical issues...');
  console.log(state.findings);
  return state.findings.some((f) => {
    // Check if finding content includes critical keywords
    const contentStr = f.content?.toLowerCase() || '';
    
    // Try to parse as structured JSON
    try {
      const parsed = JSON.parse(f.content);
      // Check structured risk_level field
      if (parsed.risk_level === 'critical' || parsed.risk_level === 'high') {
        return true;
      }
    } catch {
      // Not JSON, fall back to text search
    }
    
    // Fallback to text-based detection
    return (
      contentStr.includes('critical') ||
      contentStr.includes('suspicious') ||
      contentStr.includes('block')
    );
  });
}

