from pydantic import BaseModel

class AmountRange(BaseModel):
    min_amount: float
    max_amount: float