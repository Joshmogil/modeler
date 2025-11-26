
from app.ai.examples.workout_week import get_sample_week
from app.ai.examples.user_goals import get_sample_user_goals
from app.ai.prompt_builders.analyze_goal_progress import analyze_goal_progress_prompt


def test_analyze_goal_progress_prompt():
    workout = get_sample_week().workouts[0]
    goals = get_sample_user_goals()[0]
    prompt = analyze_goal_progress_prompt(goals, workout)
    print(prompt)
    assert True



if __name__ == "__main__":
    test_analyze_goal_progress_prompt()