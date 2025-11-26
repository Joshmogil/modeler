from uuid import UUID
from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.auth.jwt import (
    get_user_id
)
from app.data_models.persistent.goal import Goal, GoalDataPoint
from app.data_models.persistent.week import WorkoutDay

from app.ai.interface import AIInterface
from app.dependencies import get_ai



router = APIRouter(prefix="/ai/goal", tags=["ai/goal"])

@router.post("/analyze_progress", response_model=List[GoalDataPoint])
async def analyze_goal_progress(goal: Goal, workout: WorkoutDay, user_id: UUID = Depends(get_user_id), ai: AIInterface = Depends(get_ai)):
    """Analyze goal progress using the AI interface."""
    if goal.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to analyze progress for this goal")
    progress_data = await ai.analyze_goal_progress(goal, workout)
    return progress_data