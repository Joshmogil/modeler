import json
from app.data_models.persistent.user import User

def get_sample_user(num="") -> User:
    with open(f"app/ai/examples/user{num}.json", "r") as f:
        user_data = json.load(f)
    user = User.model_validate(user_data)


    return user