from uuid import UUID
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException

from app.auth.jwt import (
    get_user_id
)

from app.data_models.persistent.user import User
from app.data_models.persistent.goal import Goal
from app.data_models.persistent.week import WorkoutDay

from app.ai.interface import AIInterface
from app.dependencies import get_ai



router = APIRouter(prefix="/ai/week", tags=["ai/week"])

@router.post("/generate_workout", response_model=WorkoutDay)
async def generate_workout(user: User, goals: List[Goal], existing_workouts: List[WorkoutDay], user_id: UUID = Depends(get_user_id), ai: AIInterface = Depends(get_ai)):
    """Generate a workout day using the AI interface."""
    if user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to generate workout for this user")
    workout_day = await ai.generate_workout(user, goals, existing_workouts)
    return workout_day

@router.post("/one_shot_generate_workout_week", response_model=List[WorkoutDay])
async def one_shot_generate_workout_week(user: User, goals: List[Goal], user_id: UUID = Depends(get_user_id), ai: AIInterface = Depends(get_ai)):
    """One-shot generate a workout week using the AI interface."""
    if user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to generate workout week for this user")
    workout_week = await ai.one_shot_generate_workout_week(user, goals)
    return workout_week