from fastapi import Request

from app.storage.firestore.interface import StorageInterface
from app.ai.interface import AIInterface


def get_storage(request: Request) -> StorageInterface:
    return request.app.state.storage_interface


def get_ai(request: Request) -> AIInterface:
    return request.app.state.ai_interface

