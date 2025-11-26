# --- Configuration ---
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SECRET_KEY: str = "a_very_secret_key_that_should_be_in_a_env_file"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 360  # 6 hours
    APP_PORT: int = 8000
    GOOGLE_CLIENT_ID: str = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
    APPLE_BUNDLE_ID: str = "groove-fitness.groove"  # e.g., com.yourcompany.yourapp
    APPLE_CLIENT_ID: str = "YOUR_APPLE_CLIENT_ID"
    APPLE_CLIENT_SECRET: str = "generate_your_apple_client_secret_here"
    APPLE_REDIRECT_URI: str = "https://yourapp.com/auth/apple/callback"
    GEMINI_API_KEY: str = "top_secret-api_key"
    TEST_USER_PASS: str = "super-duper-secret"
    FIRESTORE_SERVICE_ACCOUNT_INFO: str
    FIRESTORE_DATABASE_ID: str = "groove-docs"
    USE_DEV_SETTINGS: bool = False

    class Config:
        env_file = ".env"

class DevSettings(BaseSettings):
    DEBUG_MODE: bool = True
    AUTH_ENABLED: bool = True  # Enable auth in dev for easier testing
    MOCK_AI_RESPONSES: bool = True  # Use mock AI responses in dev

    class Config:
        env_file = ".dev.env"

dev_settings = DevSettings()
settings = Settings()
