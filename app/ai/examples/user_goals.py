import json
from app.data_models.persistent.goal import Goal

def get_sample_user_goals() -> list[Goal]:
    with open("app/ai/examples/user_goals.json", "r") as f:
        user_goals_data = json.load(f)
    return [Goal(**ex) for ex in user_goals_data]

