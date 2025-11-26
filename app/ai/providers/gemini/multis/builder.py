from datetime import date, datetime, timezone
from typing import List
from app.utils.apple_dt import AppleDT
import json
import uuid
from app.config.logging_config import app_logger  # Import the logger

from app.ai.interface import AIInterface
from app.data_models.common import AmountRange
from app.data_models.custom_fields.untrusted_text import UntrustedText140, UntrustedText80
from app.data_models.persistent.week import WorkDone, WorkoutDay
from app.data_models.persistent.goal import Goal
from app.data_models.persistent.user import User

from app.ai.prompt_builders.exercise_suggestions import generate_exercise_suggestions
from app.ai.providers.gemini.parse_exercise_suggestions import parse_exercise_suggestions
from app.ai.providers.gemini.multis.models import ExerciseSuggestion

from pydantic import BaseModel

class TitleAndHeadlineResponse(BaseModel):
    title: UntrustedText80
    headline: UntrustedText140

async def step1_get_exercise_suggestions(ai: AIInterface, user: User, goals: List[Goal], existing_workouts: List[WorkoutDay]) -> list[ExerciseSuggestion]:
    start_time = datetime.now()
    prompt = generate_exercise_suggestions(user, goals, existing_workouts)
    resp = await ai.prompt(contents=prompt, schema=list[ExerciseSuggestion])
    end_time = datetime.now()
    app_logger.info(f"Step 1 completed in {(end_time - start_time).total_seconds()} seconds.")
    return await parse_exercise_suggestions(resp)
    # Parse and return the suggestions

async def step2_order_exercises(ai: AIInterface, exercise_suggestions: list[ExerciseSuggestion]) -> list[ExerciseSuggestion]:
    start_time = datetime.now()
    prompt = (
        "Order the following exercises into a logical sequence for a workout:\n"
        "Hardest to easiest based on intensity and muscle groups targeted.\n"
        "Heavy compound movements first, then isolation exercises, then light accessories and cardio.\n"
        f"{[suggestion.model_dump_json() for suggestion in exercise_suggestions]}\n"
    )
    resp = await ai.prompt(contents=prompt, schema=list[ExerciseSuggestion])
    end_time = datetime.now()
    app_logger.info(f"Step 2 completed in {(end_time - start_time).total_seconds()} seconds.")
    return await parse_exercise_suggestions(resp)

async def expand_workout(ai: AIInterface, ordered_exercises: list[ExerciseSuggestion]) -> List[WorkDone]:
    final_workout: List[WorkDone] = []
    index = 0
    for exercise in ordered_exercises:
        num_sets = exercise.number_of_sets
        int_low = exercise.prescribed_intensity.min_amount
        int_high = exercise.prescribed_intensity.max_amount
        amt_low = exercise.prescribed_amount.min_amount
        amt_high = exercise.prescribed_amount.max_amount
        amt_unit = exercise.prescribed_amount_unit
        int_unit = exercise.prescribed_intensity_unit

        int_step = (int_high - int_low) / max(num_sets - 1, 1)
        amt_step = (amt_high - amt_low) / max(num_sets - 1, 1)

        for set_idx in range(num_sets):
            set_intensity = await smart_round_amount(int_low + int_step * set_idx)
            set_amount = await smart_round_amount(amt_high - amt_step * set_idx)

            workdone_entry = WorkDone(
                id= uuid.uuid4(),
                exercise=exercise.name,
                actual_amount=set_amount,
                actual_intensity=set_intensity,
                prescribed_amount=AmountRange(min_amount=amt_low, max_amount=amt_high),
                amount_unit=amt_unit,
                prescribed_intensity=AmountRange(min_amount=int_low, max_amount=int_high),
                intensity_unit=int_unit,
                sort_index=index
            )
            final_workout.append(workdone_entry)
            index += 1

    return final_workout

async def add_title_and_headline(ai: AIInterface, workout: List[WorkDone], existing_workouts: List[WorkoutDay]) -> WorkoutDay:
    prompt = (
        "Generate a concise and catchy title and headline for the following workout:\n"
        f"{[entry.model_dump_json() for entry in workout]}\n"
        "Respond in JSON format with 'title' and 'headline' fields."
        "Title should be max 30 characters, headline max 70 characters. Headline should summarize the workout focus."
        f"TITLES YOU CANNOT REPEAT FROM PREVIOUS WORKOUTS: {[w.title for w in existing_workouts]}\n"
    )
    resp = await ai.prompt(contents=prompt, schema=TitleAndHeadlineResponse)
    resp =json.loads(resp)
    resp = TitleAndHeadlineResponse(**resp)
    return WorkoutDay(id=uuid.uuid4(), date=AppleDT.now(),workout=workout, title=resp.title, headline=resp.headline, done=False)


async def smart_round_amount(value: float) -> float:
    """Rounds the amount to a sensible number based on its size."""
    if value < 1:
        return round(value, 1)  # One decimal place for small numbers
    elif value < 30:
        return round(value)  # Nearest whole number for medium numbers
    elif value < 700:
        return round(value / 5) * 5  # Nearest 5 for larger numbers
    else:
        return round(value, -1)  # Nearest ten for large numbers


async def generate_workout_day_via_multistep(ai: AIInterface, user: User, goals: List[Goal], existing_workouts: List[WorkoutDay]) -> WorkoutDay:
    exercise_suggestions = await step1_get_exercise_suggestions(ai, user, goals, existing_workouts)
    #ordered_exercises = await step2_order_exercises(ai, exercise_suggestions)
    workdones = await expand_workout(ai, exercise_suggestions)
    workout_day = await add_title_and_headline(ai, workdones, existing_workouts)

    with open("./app/ai/examples/multistep_workout_day.json", "w+") as f:
        import json
        json.dump(workout_day.model_dump(mode='json'), f, indent=4)
    return workout_day