from typing import List
from app.data_models.persistent.goal import Goal

def __goal_to_string(goal: Goal) -> str:
    """Converts a single goal into a formatted string for AI prompts."""
    target_str = f"Goal: {goal.target}"
    if goal.target_date:
        target_str += f" by {goal.target_date.strftime('%Y-%m-%d')}"
    
    start_str = f" (Starting from: {goal.starting_point})"
    
    status = "Achieved" if goal.achieved else "Active" if goal.active else "Inactive"
    
    return f"- {target_str}{start_str} [Status: {status}]"

def __goals_to_string(goals: List[Goal]) -> str:
    """Converts a list of goals into a formatted string for AI prompts."""
    if not goals:
        return "No goals set."

    return "\n".join([__goal_to_string(goal) for goal in goals])