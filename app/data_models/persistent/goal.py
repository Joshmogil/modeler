from uuid import UUID
from typing import Optional, List
from datetime import datetime

from app.data_models.custom_fields.untrusted_text import UntrustedText140

from pydantic import BaseModel

class GoalDataPoint(BaseModel):
    date: datetime
    percent_estimate: float  # e.g., 0.75 for 75%
    semantic_description: Optional[UntrustedText140] = ""

class Goal(BaseModel):
    id: UUID

    created_at: datetime
    starting_date: datetime

    achieved: bool
    active: bool

    starting_point: UntrustedText140
    target: UntrustedText140
    target_date: Optional[datetime] = None  # Unix timestamp

    progress: Optional[List[GoalDataPoint]] = None
    user_id: UUID