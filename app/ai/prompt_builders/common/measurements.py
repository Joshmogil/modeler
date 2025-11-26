from app.data_models.persistent.user import MeasurementSystem


def __meas_amount_unit_examples(system: MeasurementSystem) -> str:
    if system == "Imperial":
        return "'reps', 'inches', 'feet', 'miles', 'minutes', 'seconds'"
    elif system == "Metric":
        return "'reps', 'centimeters', 'meters', 'kilometers', 'minutes', 'seconds'"
    else:
        raise ValueError(f"Unknown measurement system: {system}")
    
def __meas_intensity_unit_examples(system: MeasurementSystem) -> str:
    if system == "Imperial":
        return "'min', 'lbs', 'bpm', 'rpm', 'seconds'"
    elif system == "Metric":
        return "'min', 'kg', 'bpm', 'rpm', 'seconds'"
    else:
        raise ValueError(f"Unknown measurement system: {system}")