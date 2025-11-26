from typing import List


from app.ai.prompt_builders.generate_single_workout_prompt import __existing_workouts_to_string
from app.data_models.persistent.user import User
from app.data_models.persistent.goal import Goal
from app.data_models.persistent.week import WorkoutDay
from app.ai.prompt_builders.common.workout import __number_of_workouts_adjuster

from app.ai.prompt_builders.common.user import (
    __interests_to_string,
    __variety_preference_to_string,
    __activity_level_to_string,
)
from app.ai.prompt_builders.common.goal import __goals_to_string
from app.ai.prompt_builders.common.measurements import (
    __meas_amount_unit_examples,
    __meas_intensity_unit_examples,
)



def generate_exercise_suggestions(
    user: User, goals: List[Goal], existing_workouts: List[WorkoutDay]
) -> str:
    interests = __interests_to_string(user.interests)
    goals = __goals_to_string(goals)
    previous_workouts = __existing_workouts_to_string(existing_workouts)

    profile = (
        f"User Profile:\n"
        f"Name: {user.display_name}\n"
        f"Number of workouts to create: 1\n"
        f"Age: {user.age}\n"
        f"Interests:\n{interests}\n"
        f"Goals:\n{goals}\n"
        f"Measurement System: {user.measurement_system}\n"
        f"About user:\n"
        f"{__activity_level_to_string(user.activity_level)}\n"
        f"{__variety_preference_to_string(user.variety_preference)}\n"
        f"{__number_of_workouts_adjuster(len(existing_workouts), user.desired_workouts_per_week)}\n"
    )

    instructions = (
            "INSTRUCTIONS:\n"
            "- You are generating exercise suggestions for ONE workout session within the current training week.\n"
            "- Do NOT plan the entire week; only this single session.\n\n"
            "- Pay close attention to the user's interests and goals when selecting exercises;  DO NOT provide vanilla workouts.\n"

            "SESSION SIZE AND STRUCTURE:\n"
            "- Target 4-8 DISTINCT exercises for this session; never generate more than 10 distinct exercises.\n"
            "- Choose a realistic number_of_sets for each exercise:\n"
            "    - Compound exercises: usually 3-5 sets.\n"
            "    - Isolation exercises: usually 2-4 sets.\n"
            "    - Cardio or conditioning: usually 1-2 sets/weeks.\n"
            "- Use the week context above (workout number and remaining workouts) to modulate total volume and intensity:\n"
            "    - If there are several workouts left, avoid maxing out volume and intensity.\n"
            "    - If this is the last workout in the week, a slightly higher volume or intensity is acceptable.\n\n"

            "FAVORITES, VARIETY, AND PREVIOUS WORKOUTS:\n"
            "- Use the user's favorite exercises as TIE-BREAKERS only, not mandatory picks.\n"
            "- Do NOT fill the session mostly or entirely with favorite exercises.\n"
            "- Include a mix of appropriate movements that match the user's goals and current week, even if they are not favorites.\n"
            "- Consider the previous workouts in this week:\n"
            "    - Avoid repeating the exact same exercise across many workouts unless it is clearly central to the user's goals.\n"
            "    - Prefer related variations or complementary movements when repetition would hurt variety or recovery.\n\n"

            "BALANCE AND FOCUS:\n"
            "- Design this as a coherent session (e.g., full-body, upper, lower, push, pull) rather than trying to hit every muscle equally.\n"
            "- Within the chosen focus, keep a sensible balance across the primary muscle groups involved.\n\n"

            "OUTPUT REQUIREMENTS (PER EXERCISE):\n"
            "- For EACH exercise suggestion in this single session, provide:\n"
            "    - name\n"
            "    - number_of_sets\n"
            "    - prescribed_amount (min and max)\n"
            "    - prescribed_amount_unit\n"
            "    - prescribed_intensity (min and max)\n"
            "    - prescribed_intensity_unit\n\n"
            "MEASUREMENT UNIT EXAMPLES:\n"
            f"- Amount Units: {__meas_amount_unit_examples(user.measurement_system)}\n"
            f"- Intensity Units: {__meas_intensity_unit_examples(user.measurement_system)}\n"
            "- Units you use MUST follow these patterns; do not invent new unit types.\n"
        )

    return f"{profile}\n{previous_workouts}{instructions}"