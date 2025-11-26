from typing import List

from app.data_models.persistent.user import User
from app.data_models.persistent.goal import Goal

from app.ai.prompt_builders.common.user import __interests_to_string, __variety_preference_to_string, __activity_level_to_string
from app.ai.prompt_builders.common.goal import __goals_to_string


def one_shot_generate_workout_week_prompt(user: User, goals: List[Goal]) -> str:

    interests = __interests_to_string(user.interests)
    goals = __goals_to_string(goals)



    profile = (
        f"User Profile:\n"
        f"Name: {user.display_name}\n"
        f"Number of workouts to create {user.desired_workouts_per_week}\n"
        f"Age: {user.age}\n"
        f"Interests:\n{interests}\n"
        f"Goals:\n{goals}\n"
        f"About user:\n"
        f"{__activity_level_to_string(user.activity_level)}\n"
        f"{__variety_preference_to_string(user.variety_preference)}\n"

    )

    instructions = (
        f"!INSTRUCTION:\n"
        f"The workout week should consist of exactly {user.desired_workouts_per_week} workouts.\n"
        #f"Create a detailed workout week that includes detailed plans for each of the {user.desired_workouts_per_week} workouts including warm-up, main workout, and cool-down sections for each day.\n"
        f"Create {user.desired_workouts_per_week} highly detailed and well balanced workouts aligned to the user's profile and goals, each and every set must detailed in full.\n"
        f"IMPORTANT: Amount units should be things like 'reps', 'yards', 'meters', 'miles', 'km', 'minutes', 'seconds'\n"
        f"IMPORTANT: Intensity units should be things like 'min', 'kg', 'bpm', 'rpm', 'seconds'\n"
        f"IMPORTANT: Ensure that each workout is varied and targets different muscle groups while considering the user's preferences and goals.\n"
        f"IMPORTANT: Repeat exercises multiple times for things that have multiple sets, ensuring that the prescribed amount and intensity are followed for each set.\n"
        f"Workout title limit: 40 characters, headline limit: 80 characters, exercise name limit: 30 characters.\n"
        #f"Each entry in a workout is a single unit of exercise, you must prescribe an amount and intensity for each unit of exercise in a workout\n"
    

        #f"Each exercise should have multiple sets with varying reps and intensities as appropriate within a workout.\n"
        #f"ensuring that the workouts are balanced, effective, and aligned with the user's goals.\n"
    )

    return f"{profile}\n{instructions}"
