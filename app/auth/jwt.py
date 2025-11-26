from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

from app.config.settings import dev_settings, settings

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel


# --- Pydantic Models ---
class TokenData(BaseModel):
    email: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str


# --- OAuth2 Scheme ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")


# --- Token Creation ---
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


# --- Token Verification (for your own tokens) ---

if dev_settings.AUTH_ENABLED:

    async def get_user_id(token: str = Depends(oauth2_scheme)) -> UUID:
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        try:
            payload = jwt.decode(
                token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
            )
            user_id_str: str = payload.get("sub")
            if user_id_str is None:
                raise credentials_exception
            user_id = UUID(user_id_str)

        except (JWTError, ValueError):
            raise credentials_exception
        # For simple login, we don't need to fetch from DB
        return user_id

else:
    # --- AUTHENTICATION OFF ---
    # This is a dummy dependency that runs when auth is disabled.
    # It returns a fixed, predictable UUID for testing and development.
    async def get_user_id() -> UUID:
        # Return a hardcoded UUID for a "test" user.
        return UUID("00000000-0000-0000-0000-000000000000")
