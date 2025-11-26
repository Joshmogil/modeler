import uuid

from fastapi import APIRouter, Depends, HTTPException



from app.data_models.persistent.user import User
#from app.logging_config import app_logger


from app.auth.jwt import (
    get_user_id
)

from app.storage.storage_interface import StorageInterface
from app.dependencies import get_storage
from app.config.settings import settings

from app.routes.responses.common import IdResponse


router = APIRouter(prefix="/user", tags=["user"])


@router.post("/", response_model=IdResponse)
async def create_user(user: User, storage: StorageInterface = Depends(get_storage)):
    """Create a new user."""
    if user.id != "00000000-0000-0000-0000-000000000000" and not settings.AUTH_ENABLED:
        user.id = uuid.uuid4()

    await storage.create_user(user)
    return IdResponse(id=user.id)


@router.get("/", response_model=User)
async def get_user(uid: dict = Depends(get_user_id), storage: StorageInterface = Depends(get_storage)):
    """Retrieve user information."""
    try:
        user = await storage.get_user(uid)
        return user
    except ValueError as e:
        # Handle exceptions (e.g., user not found)
        raise HTTPException(status_code=404, detail=str(e))

