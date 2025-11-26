from typing import Optional

from app.data_models.custom_fields.untrusted_text import UntrustedText80, UntrustedText140, UntrustedText20
from app.data_models.common import AmountRange

from pydantic import BaseModel

class InternalProtoWorkdone(BaseModel):
    exercise: UntrustedText80
    prescribed_amount: AmountRange
    prescribed_amount_unit: UntrustedText20
    prescribed_intensity: AmountRange
    prescribed_intensity_unit: UntrustedText20
    set_range: AmountRange
    times_per_week: AmountRange

class InternalProtoWorkoutDay(BaseModel):
    title: UntrustedText80
    headline: Optional[UntrustedText140] = None
    
