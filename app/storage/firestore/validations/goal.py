from app.data_models.persistent.goal import Goal

def validate_progress_length(goal: Goal):
    """
    Validate that the total length of semantic descriptions in the goal's progress entries
    """
    MAX_TOTAL_LENGTH = 1460  # Example limit for total length of semantic descriptions

    if len(goal.progress) > MAX_TOTAL_LENGTH:
        raise ValueError(f"Total length of progress entries exceeds the limit of {MAX_TOTAL_LENGTH} progress entries.")
