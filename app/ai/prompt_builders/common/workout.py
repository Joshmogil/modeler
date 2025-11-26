

from app.data_models.persistent.week import WorkoutDay


def __completed_workout_to_string(workout: WorkoutDay) -> str:
    workout_str = ""
    for work_done in workout.workout:
        workout_str += f"- {work_done.exercise}: {work_done.actual_intensity} {work_done.intensity_unit}, {work_done.actual_amount} {work_done.amount_unit}\n"
    return workout_str.strip()

def __number_of_workouts_adjuster(num_existing_workouts: int, desired_workouts: int) -> str:
    """Return guidance string describing current workout number within week."""
    desired = max(desired_workouts, 1)
    current_number = min(num_existing_workouts + 1, desired)
    remaining = max(desired - current_number, 0)

    if remaining == 0:
        remaining_phrase = "no workouts left in this week, so feel free to finish strong."
    elif remaining == 1:
        remaining_phrase = "one more workout in this week, so keep some gas in the tank."
    else:
        remaining_phrase = f"{remaining} more workouts in this week, so pace the intensity."

    return f"This is workout {current_number} of {desired}; the user has {remaining_phrase}"

if __name__ == "__main__":
    print(__number_of_workouts_adjuster(0, 3))
    print(__number_of_workouts_adjuster(1, 3))
    print(__number_of_workouts_adjuster(2, 3))
    print(__number_of_workouts_adjuster(2, 5)) # What about cases like this?
    print(__number_of_workouts_adjuster(3, 3))
    print(__number_of_workouts_adjuster(4, 3))
