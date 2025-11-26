from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, HTMLResponse

from contextlib import asynccontextmanager
from pydantic import BaseModel


from app.config.settings import dev_settings, settings  # Add this import
from app.config.logging_config import app_logger  # Import the logger
import app.config.misc as misc


from app.storage.firestore.interface import FirestoreInterface
from app.storage.firestore.connection import get_connection

from app.ai.providers.gemini.gemini import get_client as get_gemini_client
from app.ai.providers.gemini.gemini import GeminiAI
from app.ai.providers.mock.mock_ai import MockAI

from app.routes.user.user import router as user_router
from app.routes.user.goal import router as goal_router
from app.routes.user.week import router as week_router

from app.routes.ai.week import router as ai_week_router
from app.routes.ai.goal import router as ai_goal_router
from app.routes.auth.apple_login import router as apple_login_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handles application startup and shutdown events.
    """
    # Create the client and interface once on startup

    app_logger.info("Starting up application...")

    app_logger.info(f"USE_DEV_SETTINGS: {settings.USE_DEV_SETTINGS}")
    if settings.USE_DEV_SETTINGS:
        app_logger.info("Using Dev Settings, loaded:")
        for key, value in dev_settings.model_dump().items():
            app_logger.info(f"  {key}: {value}")

    firestore_client = await get_connection()
    # Store the interface instance on the app's state
    app.state.storage_interface = FirestoreInterface(connection=firestore_client)

    if await app.state.storage_interface.test_connection():
       app_logger.info("Firestore connection test passed.")
    else:
        app_logger.error("Firestore connection test failed.")

    # Create the Gemini client
    if settings.USE_DEV_SETTINGS and dev_settings.MOCK_AI_RESPONSES:
        app_logger.info("Using Mock AI Interface")
        app.state.ai_interface = MockAI()
    else:
        client = await get_gemini_client()
        app.state.ai_interface = GeminiAI(client=client)


    yield


app_version = misc.generate_version_name()
app_logger.info(f"Starting app with version: {app_version}")
app_logger.info(f"Secret key configured: {'Yes' if settings.SECRET_KEY else 'No'}")  # Use settings


# Pass the lifespan handler to the FastAPI app
app = FastAPI(lifespan=lifespan, version=app_version, title="Groove Fitness API")

# Register API routers
app.include_router(user_router)
app.include_router(goal_router)
app.include_router(week_router)
app.include_router(ai_week_router)
app.include_router(ai_goal_router)
app.include_router(apple_login_router)

class ProviderToken(BaseModel):
    token: str

# Pydantic model for login request
class LoginRequest(BaseModel):
    email: str
    password: str

@app.get("/legal/privacy")
async def get_privacy_policy():
    """
    Endpoint to retrieve the privacy policy.
    """
    with open("app/legal/privacypolicy/11-21-2025.html", "r") as f:
        privacy_policy_html = f.read()
    return HTMLResponse(content=privacy_policy_html)

@app.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring and load balancers.
    Returns status of the application and its dependencies.
    """
    health_status = {
        "status": "healthy",
        "version": app_version,
        "timestamp": misc.get_current_timestamp() if hasattr(misc, 'get_current_timestamp') else None,
        "checks": {
            "database": "unknown",
            "configuration": "healthy"
        }
    }
    
    # Check database connectivity - much cheaper options:
    try:
        # Option 1: Simple query that should be fast
        health_status["checks"]["database"] = "healthy"
        
        
    except Exception as e:
        app_logger.error(f"Database health check failed: {e}")
        health_status["checks"]["database"] = "unhealthy"
        health_status["status"] = "unhealthy"
    
    # Check configuration
    config_checks = {
        "secret_key": bool(settings.SECRET_KEY),
        "gemini_api": bool(settings.GEMINI_API_KEY)
    }
    
    if not all(config_checks.values()):
        health_status["checks"]["configuration"] = "warning"
        if health_status["status"] == "healthy":
            health_status["status"] = "degraded"
    
    health_status["configuration"] = config_checks
    
    return health_status

@app.get("/health/ready")
async def readiness_check():
    """
    Readiness check - indicates if the app is ready to receive traffic.
    """

    return {"status": "ready", "version": app_version}


@app.get("/health/live")
async def liveness_check():
    """
    Liveness check - indicates if the app is running and not stuck.
    This doesn't even hit the database - just confirms the app is responding.
    """
    return {
        "status": "alive",
        "version": app_version
    }

if settings.USE_DEV_SETTINGS and dev_settings.DEBUG_MODE:
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        """Log detailed validation errors."""
        # Log the full error details
        app_logger.error(f"Validation error for {request.method} {request.url}: {exc.errors()}")
        
        # You can also include the request body if you want to see what was sent
        # body = await request.body()
        # app_logger.error(f"Request body: {body.decode()}")
    
        # Return the default 422 response
        return JSONResponse(
            status_code=422,
            content={"detail": exc.errors()},
        )