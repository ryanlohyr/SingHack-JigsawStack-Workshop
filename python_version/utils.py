"""Utility functions and state management for RegTech Compliance Agent"""

from typing import Literal, TypedDict, Any
from datetime import datetime
import json


# ============================================================
# TYPES & INTERFACES
# ============================================================

class ComplianceTask(TypedDict):
    id: str
    type: Literal['regulatory_doc', 'transaction', 'risk_assessment', 'regulatory_updates']
    status: Literal['pending', 'processing', 'completed', 'flagged']
    priority: Literal['low', 'medium', 'high', 'critical']


class AgentState(TypedDict):
    tasks: list[ComplianceTask]
    findings: list[dict[str, Any]]
    conversationHistory: list[dict[str, str]]


# ============================================================
# UTILITY FUNCTIONS
# ============================================================

def get_pending_tasks(state: AgentState) -> list[ComplianceTask]:
    """Get all pending tasks"""
    return [t for t in state['tasks'] if t['status'] == 'pending']


def get_critical_tasks(state: AgentState) -> list[ComplianceTask]:
    """Get all critical or flagged tasks"""
    return [t for t in state['tasks'] if t['status'] == 'flagged' or t['priority'] == 'critical']


def has_uncompleted_tasks(state: AgentState) -> bool:
    """Check if there are any uncompleted tasks"""
    return any(t['status'] != 'completed' for t in state['tasks'])


def add_finding(state: AgentState, task_id: str, finding_type: str, content: str) -> None:
    """Add a finding to the state"""
    state['findings'].append({
        'task_id': task_id,
        'type': finding_type,
        'content': content,
        'timestamp': datetime.now().isoformat(),
    })


def has_critical_issues(state: AgentState) -> bool:
    """Check if any findings contain critical issues"""
    print('Checking for critical issues...')
    print(state['findings'])
    
    for finding in state['findings']:
        content_str = str(finding.get('content', '')).lower()
        
        # Try to parse as structured JSON
        try:
            parsed = json.loads(finding['content'])
            # Check structured risk_level field
            if parsed.get('risk_level') in ['critical', 'high']:
                return True
        except (json.JSONDecodeError, TypeError):
            # Not JSON, fall back to text search
            pass
        
        # Fallback to text-based detection
        if any(keyword in content_str for keyword in ['critical', 'suspicious', 'block']):
            return True
    
    return False

