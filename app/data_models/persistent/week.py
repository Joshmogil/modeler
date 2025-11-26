from uuid import UUID
from datetime import datetime
from typing import Optional , Literal

from app.data_models.custom_fields.untrusted_text import UntrustedText80, UntrustedText140, UntrustedText20
from app.data_models.common import AmountRange

from pydantic import BaseModel

PercievedExertion = Literal["Easy", "Medium", "Hard"]




class WorkDone(BaseModel):
    id: UUID
    sort_index: int
    exercise: UntrustedText80
    prescribed_amount: AmountRange
    actual_amount: float
    amount_unit: UntrustedText20
    prescribed_intensity: AmountRange
    actual_intensity: float
    intensity_unit: UntrustedText20
    perceived_exertion: Optional[PercievedExertion] = 'Medium'
    done: Optional[bool] = False

class WorkoutDay(BaseModel):
    id: UUID

    title: UntrustedText80
    headline: Optional[UntrustedText140] = None
    date: Optional[datetime] = None
    workout: list[WorkDone]
    done: Optional[bool] = False

class Week(BaseModel):
    id: UUID
    
    user_id: UUID

    created_at: datetime
    completed_at: Optional[datetime] = None

    start_date: datetime

    workouts : list[WorkoutDay]
    #status: str


