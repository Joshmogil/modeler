from uuid import UUID, uuid4

from fastapi import APIRouter, Depends

from app.data_models.persistent.goal import Goal
#from app.logging_config import app_logger


from app.auth.jwt import (
    get_user_id
)

from app.storage.storage_interface import StorageInterface
from app.dependencies import get_storage

from app.routes.responses.common import IdResponse


router = APIRouter(prefix="/user/goal", tags=["goal"])

@router.post("/", response_model=IdResponse)
async def create(goal: Goal, user_id: UUID = Depends(get_user_id), storage: StorageInterface = Depends(get_storage)):
    """Create a new goal."""
    goal.id = uuid4()
    await storage.create_goal(user_id, goal)
    return IdResponse(id=goal.id)

@router.get("/{goal_id}", response_model=Goal)
async def get(goal_id: UUID, user_id: UUID = Depends(get_user_id), storage: StorageInterface = Depends(get_storage)):
    """Retrieve a goal by its ID."""
    goal = await storage.get_goal(user_id, goal_id)
    return goal

@router.delete("/{goal_id}", response_model=IdResponse)
async def delete(goal_id: UUID, user_id: UUID = Depends(get_user_id), storage: StorageInterface = Depends(get_storage)):
    """Delete a goal by its ID."""
    await storage.delete_goal(user_id, goal_id)
    return IdResponse(id=goal_id)