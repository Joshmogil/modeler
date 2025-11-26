import json
import uuid
from typing import List

from app.data_models.persistent.week import WorkoutDay



def parse_workout_week(response: str) -> List[WorkoutDay]:
    """
    Parses the AI response to extract a list of WorkoutDay objects,
    injecting valid UUIDs for all 'id' fields before validation.
    """
    workout_days_data = json.loads(response)

    for day_data in workout_days_data:
        day_data['id'] = str(uuid.uuid4())

        if 'workout' in day_data and isinstance(day_data['workout'], list):
            for work_done_data in day_data['workout']:
                work_done_data['id'] = str(uuid.uuid4())

    return [WorkoutDay(**day) for day in workout_days_data]