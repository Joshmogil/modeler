import json
from typing import List

from app.data_models.persistent.goal import GoalDataPoint

def parse_goal_data_points(response: str) -> List[GoalDataPoint]:
    """
    Parses the AI response to extract a list of GoalDataPoint objects.
    """
    data_points_data = json.loads(response)
    goal_data_points_list = []
    for data_point in data_points_data:
        goal_data_point = GoalDataPoint(**data_point)
        goal_data_points_list.append(goal_data_point)
    return goal_data_points_list