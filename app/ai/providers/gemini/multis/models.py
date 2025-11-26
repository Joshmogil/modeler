from pydantic import BaseModel
from app.data_models.custom_fields.untrusted_text import UntrustedText20
from app.data_models.common import AmountRange

class ExerciseSuggestion(BaseModel):
    name: str
    number_of_sets: int
    prescribed_amount: AmountRange
    prescribed_amount_unit: UntrustedText20
    prescribed_intensity: AmountRange
    prescribed_intensity_unit: UntrustedText20

class PlanDay(BaseModel):
    exercise_suggestions: list[ExerciseSuggestion]
    guidance: str

class PlanWeek(BaseModel):
    theme: str
    days: list[PlanDay]
    guidance: str

class Plan(BaseModel):
    name: str
    weeks: list[PlanWeek]

