from app.ai.providers.gemini.multis.models import ExerciseSuggestion
from pydantic import BaseModel
import json



async def parse_exercise_suggestions(response_text: str) -> list[ExerciseSuggestion]:
    """Parse a list of ExerciseSuggestions from the given response text."""
    # Implement parsing logic here, e.g., using Pydantic or manual parsing
    # For demonstration, we'll assume response_text is a JSON string
    data = json.loads(response_text)
    return [ExerciseSuggestion(**suggestion) for suggestion in data]
