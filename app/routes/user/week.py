from uuid import UUID, uuid4

from fastapi import APIRouter, Depends

from app.data_models.persistent.week import Week
#from app.logging_config import app_logger


from app.auth.jwt import (
    get_user_id
)

from app.storage.storage_interface import StorageInterface
from app.dependencies import get_storage

from app.routes.responses.common import IdResponse


router = APIRouter(prefix="/user/week", tags=["week"])

@router.post("/", response_model=IdResponse)
async def create(week: Week, user_id: UUID = Depends(get_user_id), storage: StorageInterface = Depends(get_storage)):
    """Create a new week."""
    week.id = uuid4()
    await storage.create_week(user_id, week)
    return IdResponse(id=week.id)

@router.get("/{week_id}", response_model=Week)
async def get(week_id: UUID, user_id: UUID = Depends(get_user_id), storage: StorageInterface = Depends(get_storage)):
    """Retrieve a week by its ID."""
    week = await storage.get_week(user_id, week_id)
    return week

@router.delete("/{week_id}", response_model=IdResponse)
async def delete(week_id: UUID, user_id: UUID = Depends(get_user_id), storage: StorageInterface = Depends(get_storage)):
    """Delete a week by its ID."""
    await storage.delete_week(user_id, week_id)
    return IdResponse(id=week_id)
