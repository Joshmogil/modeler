import json
import uuid

from app.utils.uuid_rr import replace_uuids_recursively
from app.data_models.persistent.week import Week, WorkoutDay

def get_sample_week() -> Week:
    with open("app/ai/examples/workout_week.json", "r") as f:
        workout_weeks_data = json.load(f)

    workout_weeks_data = replace_uuids_recursively(workout_weeks_data)

    # Adding missing fields to match the Week model

    new_week = Week(
        id=uuid.uuid4(),
        user_id="00000000-0000-0000-0000-000000000000",
        created_at="2025-10-28T10:02:00Z",
        start_date="2025-10-28T10:02:00Z",
        workouts=[],
    )

    workouts = [WorkoutDay(**ex) for ex in workout_weeks_data]

    new_week.workouts = workouts
    return new_week

