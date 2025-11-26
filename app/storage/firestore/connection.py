import json
from google.cloud import firestore
from google.oauth2 import service_account
from app.config.settings import settings

async def get_connection() -> firestore.AsyncClient:
    """
    Establishes an async connection to Firestore with robust error handling
    for service account credentials.
    """
    service_account_info_str = settings.FIRESTORE_SERVICE_ACCOUNT_INFO

    # 1. Check if the environment variable is missing or empty.
    if not service_account_info_str:
        raise ValueError(
            "The FIRESTORE_SERVICE_ACCOUNT_INFO environment variable is not set or is empty. "
            "Please provide the service account JSON content as an environment variable."
        )

    # 2. Try to parse the JSON, providing a helpful error if it fails.
    try:
        # This handles cases where the JSON might be "double-encoded" as a string within a string.
        service_account_info = json.loads(service_account_info_str)
        while isinstance(service_account_info, str):
            service_account_info = json.loads(service_account_info)

    except json.JSONDecodeError as e:
        raise ValueError(
            "Failed to parse FIRESTORE_SERVICE_ACCOUNT_INFO. "
            "The environment variable likely contains malformed JSON. "
            f"Please check its value. Original error: {e}"
        ) from e

    # Ensure we ended up with a dictionary
    if not isinstance(service_account_info, dict):
        raise TypeError(f"Expected service account info to be a dictionary, but got {type(service_account_info).__name__}.")


    credentials = service_account.Credentials.from_service_account_info(
        service_account_info
    )
    
    # Create the client with the loaded credentials and database ID
    return firestore.AsyncClient(
        credentials=credentials, 
        database=settings.FIRESTORE_DATABASE_ID
    )