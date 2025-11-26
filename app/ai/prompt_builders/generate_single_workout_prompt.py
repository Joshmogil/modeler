from typing import List

from app.ai.prompt_builders.common.workout import __number_of_workouts_adjuster
from app.data_models.persistent.user import User
from app.data_models.persistent.goal import Goal
from app.data_models.persistent.week import WorkoutDay, WorkDone


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

def __workout_entry_to_string(entry: WorkDone) -> str:
    amount = f"{entry.prescribed_amount.min_amount}-{entry.prescribed_amount.max_amount} {entry.amount_unit}"
    intensity = (
        f"{entry.prescribed_intensity.min_amount}-{entry.prescribed_intensity.max_amount} {entry.intensity_unit}"
    )
    return f"- {entry.exercise}: {amount} @ {intensity}"


def __existing_workouts_to_string(existing_workouts: List[WorkoutDay]) -> str:
    if not existing_workouts:
        return ""

    workout_sections = []
    for idx, day in enumerate(existing_workouts, start=1):
        exercises = "\n".join(__workout_entry_to_string(entry) for entry in day.workout)
        headline = f"{day.headline}" if day.headline else ""
        workout_sections.append(
            f"Workout {idx}: {day.title}\n{headline}\nExercises:\n{exercises}"
        )

    return "Previous Workouts:\n" + "\n\n".join(workout_sections) + "\n"


def generate_single_workout_prompt(
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
    )


    min_workdone_objs = max(12, len(interests)*5+2)
    max_workdone_objs = max(30, len(interests)*9+10)

    instructions = (
        "!INSTRUCTIONS:\n"
        "You generate ONE workout. Output ONLY a single JSON `WorkoutDay` object. No arrays, no commentary.\n\n"

        "INTERPRETATION RULES:\n"
        "- `WorkoutDay` = one full session.\n"
        "- `workout` = list of `WorkDone` objects.\n"
        "- Each `WorkDone` = ONE SET of ONE exercise.\n"
        "- A valid session MUST contain MANY sets.\n"
        f"- Target {min_workdone_objs}-{max_workdone_objs} total `WorkDone` objects.\n"
        f"- Never produce fewer than {min_workdone_objs} unless the profile clearly requires a very short session.\n\n"

        "STRUCTURE RULES:\n"
        "- Distinct exercises: typically 4-10.\n"
        "- Compounds: 3-5 sets each.\n"
        "- Isolation: 2-4 sets each.\n"
        "- Cardio: 1-2 sets.\n"
        "- All sets of the SAME exercise must be CONSECUTIVE.\n"
        "- INTERLEAVING exercises is INVALID.\n"
        "    INVALID: bench, squat, row, bench, squat\n"
        "    VALID:   bench, bench, bench, squat, squat, row, row\n\n"

        "WORKOUT LOGIC:\n"
        "- This is ONE day in a multi-day week.\n"
        "- Do NOT cover every muscle group. Choose a logical session focus.\n"
        "- Balance muscles within the focus (e.g., push, legs, pull, full-body).\n"
        "- Avoid exercises already used in this training week unless required for progression.\n"
        "- User interests/favorites are OPTIONAL; use them only if they fit the focus.\n"
        "- Order exercises strictly:\n"
        "    1) Compound\n"
        "    2) Isolation\n"
        "    3) Cardio (if any)\n\n"

        "SET DETAILS:\n"
        "- Each `WorkDone` MUST include: prescribed_amount, actual_amount, amount_unit,\n"
        "  prescribed_intensity, actual_intensity, intensity_unit.\n"
        "- Each set must progress from easier → harder (amount or intensity).\n\n"

        "UNIT RULES:\n"
        f"- Amount units MUST follow examples: {__meas_amount_unit_examples(user.measurement_system)}\n"
        f"- Intensity units MUST follow examples: {__meas_intensity_unit_examples(user.measurement_system)}\n"
        "- No invented units.\n\n"

        "TEXT LIMITS:\n"
        "- Title ≤ 40 chars.\n"
        "- Headline ≤ 80 chars.\n"
        "- Exercise name ≤ 30 chars.\n"
    )

    return f"{profile}\n{previous_workouts}{instructions}"
