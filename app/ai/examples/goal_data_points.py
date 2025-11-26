import json
from app.data_models.persistent.goal import GoalDataPoint


def get_sample_goal_data_points() -> list[GoalDataPoint]:
    with open("app/ai/examples/goal_data_points.json", "r") as f:
        goal_data_points = json.load(f)
    return [GoalDataPoint(**ex) for ex in goal_data_points]
