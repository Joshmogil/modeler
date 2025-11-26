
from uuid import UUID
from typing import Literal, Optional, List
from datetime import datetime

from app.data_models.custom_fields.untrusted_text import UntrustedText80

from pydantic import BaseModel, EmailStr, Field

Skill = Literal["New","Novice","Intermediate", "Advanced"]

ActivityLevel = Literal["Sedentary", "Lightly Active","Active", "Moderately Active", "Very Active"]

MuscleReportOption = Literal["Not enough", "Just right", "Too much"]

FocusLevel = Literal["Primary", "Secondary", "Minor"]

VarietyPreference = Literal["Low", "Medium", "High"]

MeasurementSystem = Literal["Imperial", "Metric"]


class Interest(BaseModel):
    #model_config = ConfigDict(extra='forbid')
    name: UntrustedText80
    skill: Skill
    focus: FocusLevel
    active: bool = False
    favorite_exercises: Optional[List[UntrustedText80]] = []

class User(BaseModel):
    id: UUID
    is_active: bool = True
    is_premium: bool = False
    email: Optional[EmailStr] = None
    measurement_system: Optional[MeasurementSystem] = None
    variety_preference: VarietyPreference = "Medium"
    activity_level: Optional[ActivityLevel] = None
    interests: Optional[List[Interest]] = None
    apple_user_id: Optional[str] = None
    provider: Optional[str] = None  # e.g., 'apple' or 'google'
    refresh_token: Optional[str] = None  # Store refresh token if needed
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    display_name: Optional[UntrustedText80] = None
    age: Optional[int] = None

    desired_workouts_per_week: int = Field(default=3, ge=1, le=14)
    birthday: Optional[datetime] = None