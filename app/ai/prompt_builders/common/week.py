from typing import List

from app.data_models.internal.week import AmountRange
from app.data_models.internal.week import InternalProtoWorkdone

from app.ai.providers.gemini.multis.models import ExerciseSuggestion

def __range_to_natural_string(range_obj: AmountRange, unit: str) -> str:
    """Converts an AmountRange object to a natural language string."""
    min_val = range_obj.min_amount
    max_val = range_obj.max_amount

    # Use integer display if the numbers are whole
    min_display = int(min_val) if min_val == int(min_val) else min_val
    max_display = int(max_val) if max_val == int(max_val) else max_val

    if min_display == max_display:
        # Handle pluralization of units
        plural_unit = unit if str(unit).endswith('s') else f"{unit}s"
        unit_str = unit if min_display == 1 else plural_unit
        return f"{max_display} {unit_str}"
    else:
        return f"{min_display} to {max_display} {unit}"

def __exercises_to_string(exercises: List[InternalProtoWorkdone]) -> str:
    """
    Converts a list of InternalProtoWorkdone objects into a nicely formatted,
    natural language string for a prompt.
    """
    if not exercises:
        return "No base exercises provided."

    prompt_parts = []
    for exercise in exercises:
        reps_str = __range_to_natural_string(exercise.prescribed_amount, exercise.prescribed_amount_unit)
        intensity_str = __range_to_natural_string(exercise.prescribed_intensity, exercise.prescribed_intensity_unit)
        sets_str = __range_to_natural_string(exercise.set_range, "sets")
        frequency_str = __range_to_natural_string(exercise.times_per_week, "times per week")

        part = (
            f"- For {exercise.exercise}, the user should perform {sets_str} of {reps_str}, "
            f"using an intensity of {intensity_str}. This should be done {frequency_str}."
        )
        prompt_parts.append(part)
    
    return "\n".join(prompt_parts)

