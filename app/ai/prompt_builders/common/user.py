from typing import List


from app.data_models.persistent.user import Interest, VarietyPreference, ActivityLevel


def __interests_to_string(interests: List[Interest]) -> str:
    """
    Converts a list of user interests into a nicely formatted string for a prompt.
    """
    if not interests:
        return "No specific fitness interests provided."

    prompt_parts = []
    for interest in interests:
        part = f"- {interest.name}"
        if interest.focus:
            part += f" (with a focus on {interest.focus})"
        if interest.favorite_exercises:
            exercises = ", ".join(interest.favorite_exercises)
            part += f". Favorite exercises include: {exercises}."
        else:
            part += "."
        prompt_parts.append(part)
    
    return "\n".join(prompt_parts)

def __variety_preference_to_string(variety_preference: VarietyPreference) -> str:
    """
    Converts the user's variety preference into a descriptive string for a prompt.
    """
    mapping = {
        "low": "Stick to a few familiar exercises, close attention to the user's favorite exercises.",
        "medium": "Mix familiar and new exercises to keep the workouts engaging.",
        "high": "Introduce a wide variety of interesting and diverse exercises to maintain high engagement."
    }
    return mapping.get(variety_preference.lower(), "The user's variety preference is unspecified.")

def __activity_level_to_string(activity_level: ActivityLevel) -> str:
    """
    Converts the user's activity level into a descriptive string for a prompt.
    """
    mapping = {
        "sedentary": "The user has a sedentary lifestyle with minimal physical activity.",
        "lightly active": "The user is lightly active, engaging in light exercise or sports 1-3 days a week.",
        "active": "The user is active, participating in moderate exercise or sports 3-5 days a week.",
        "moderately active": "The user is moderately active, engaging in intense exercise or sports 6-7 days a week.",
        "very active": "The user is very active, with a physically demanding job or training twice a day."
    }
    return mapping.get(activity_level.lower(), "The user's activity level is unspecified.")