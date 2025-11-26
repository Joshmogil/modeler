import json
import uuid

from app.data_models.persistent.week import WorkoutDay, WorkDone


def parse_workout_day(response: str) -> WorkoutDay:
    """Parse a single WorkoutDay JSON object and inject UUIDs."""
    day_data = json.loads(response)

    if not isinstance(day_data, dict):
        raise ValueError("Workout response must be a JSON object")

    day_data['id'] = str(uuid.uuid4())

    workout_entries = day_data.get('workout')
    if isinstance(workout_entries, list):
        for work_done_data in workout_entries:
            work_done_data['id'] = str(uuid.uuid4())

    return WorkoutDay(**day_data)


def midpoint(min_val, max_val):
        values = [v for v in (min_val, max_val) if isinstance(v, (int, float))]
        if not values:
            return None
        if len(values) == 1:
            return round(values[0])
        return round((values[0] + values[1]) / 2)

def set_workout_actual_measurements(workout_day: WorkoutDay) -> WorkoutDay:
    """Set actual amounts for each work done entry in the workout day."""



    for work_done in workout_day.workout:
        work_done: WorkDone
        work_done.actual_amount = midpoint(
            work_done.prescribed_amount.min_amount,
            work_done.prescribed_amount.max_amount
        )
        work_done.actual_intensity = midpoint(
            work_done.prescribed_intensity.min_amount,
            work_done.prescribed_intensity.max_amount
        )

    return workout_day

if __name__ == "__main__":
    print(midpoint(None, None))  # Should print: None
    print(midpoint(10, None))   # Should print: 10
    print(midpoint(None, 20))   # Should print: 20
    print(midpoint(70, 90))     # Should print: 15
    print(midpoint(15, 25))     # Should print: 20
    print(midpoint(0, 0))       # Should print: 0
    print(midpoint(7, 10))     # Should print: 8