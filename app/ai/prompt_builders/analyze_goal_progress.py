from app.ai.prompt_builders.common.goal import __goal_to_string
from app.ai.prompt_builders.common.workout import __completed_workout_to_string
from app.data_models.persistent.week import WorkoutDay
from app.data_models.persistent.goal import Goal


def analyze_goal_progress_prompt(goal: Goal, workout: WorkoutDay) -> str:
    prompt = (
        "Analyze the user's progress towards their goals based on the provided workout data."
        "Provide 0-5 key data points, each with a brief description of what the user did and a numerical value indicating on a 0-100 how close they are to achieving their goal."
        "Reference explicitly what the user did to support each datapoint, avoiding unnecessary details. At most 100 characters."
        f"\n\nUser Goal:\n{__goal_to_string(goal)}"
        f"\n\nWorkout Data:\n{__completed_workout_to_string(workout)}"
    )
    return prompt