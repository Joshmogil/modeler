

from app.ai.examples.user import get_sample_user
from app.ai.examples.user_goals import get_sample_user_goals

from app.ai.prompt_builders.one_shot_generate_workout_week_prompt import one_shot_generate_workout_week_prompt



def test_one_shot_generate_workout_week_prompt():
    user = get_sample_user()
    goals = get_sample_user_goals()
    prompt = one_shot_generate_workout_week_prompt(user, goals)
    print(prompt)
    assert True

if __name__ == "__main__":
    test_one_shot_generate_workout_week_prompt()