
from typing import Optional
import requests
import hashlib
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from jose import jwt
from uuid import UUID

from app.storage.storage_interface import StorageInterface
from app.auth.jwt import create_access_token
#from app.db.user import get_user_by_apple_id, create_user_via_apple # Modified DB function
from app.config.settings import settings
from app.dependencies import get_storage

router = APIRouter(prefix="/auth", tags=["authentication"])

class AppleLoginRequest(BaseModel):
    idToken: str
    authCode: str
    rawNonce: str # 1. Receive the raw nonce from the client
    fullName: Optional[dict] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    #refresh_token: Optional[str] = None
    user_id: Optional[UUID] = None
    email: Optional[str] = None

def verify_apple_identity_token(token: str, raw_nonce: str) -> dict:
        """Verify the identity token from Sign in with Apple."""
    #try:
        # Get Apple's public key to verify the signature
        apple_public_keys_url = "https://appleid.apple.com/auth/keys"
        jwks = requests.get(apple_public_keys_url).json()
        
        unverified_header = jwt.get_unverified_header(token)
        rsa_key = {}
        for key in jwks["keys"]:
            if key["kid"] == unverified_header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "alg": key["alg"],
                    "n": key["n"],
                    "e": key["e"],
                }
        
        # 2. Use jwt.decode for simpler, safer validation
        claims = jwt.decode(
            token,
            rsa_key,
            algorithms=["RS256"],
            issuer="https://appleid.apple.com",
            audience=settings.APPLE_BUNDLE_ID,
        )

        # 3. Verify the nonce to prevent replay attacks
        nonce_hash = hashlib.sha256(raw_nonce.encode()).hexdigest()
        if claims.get("nonce") != nonce_hash:
            raise HTTPException(status_code=401, detail="Invalid nonce")

        return claims
        
    #except JWTError as e:
    #    raise HTTPException(status_code=401, detail=f"Invalid Apple token: {str(e)}")
    #except Exception as e:
    #    raise HTTPException(status_code=500, detail=f"Token verification error: {str(e)}")

# ... (get_refresh_token function remains the same) ...
async def get_refresh_token(auth_code: str) -> Optional[str]:
    """Exchange authorization code for refresh token."""
    try:
        # Prepare the request to Apple's token endpoint
        token_request_data = {
            "client_id": settings.APPLE_CLIENT_ID,
            "client_secret": settings.APPLE_CLIENT_SECRET,
            "code": auth_code,
            "grant_type": "authorization_code",
            "redirect_uri": settings.APPLE_REDIRECT_URI
        }
        
        response = requests.post(
            "https://appleid.apple.com/auth/token",
            data=token_request_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        if response.status_code == 200:
            token_data = response.json()
            return token_data.get("refresh_token")
        return None
    except Exception:
        return None

@router.post("/login/apple", response_model=TokenResponse)
async def login_with_apple(request: AppleLoginRequest, storage: StorageInterface = Depends(get_storage)):
    """Authenticate user with Apple Sign In."""
    # Verify the identity token and the nonce
    #print("Received idToken:", request.idToken)  # Debugging line
    id_token_claims = verify_apple_identity_token(request.idToken, request.rawNonce)
    
    # Extract user information
    apple_user_id = id_token_claims.get("sub")  # Apple's unique user ID
    email = id_token_claims.get("email")
    
    if not apple_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Apple token: missing user ID"
        )
    
    # 4. Check if user exists by Apple ID, create if not
    user = await storage.get_user_by_apple_id(apple_user_id)
    #print(request.model_dump_json())
    #print(request.fullName)
    if not user:
        # First time sign in - create user
        from uuid import uuid4
        from app.data_models.persistent.user import User
        
        # Create display name from available information
        first_name = request.fullName.get("givenName") if request.fullName else None
        last_name = request.fullName.get("familyName") if request.fullName else None
        
        if first_name and last_name:
            display_name = f"{first_name} {last_name}"
        elif first_name:
            display_name = first_name
        elif last_name:
            display_name = last_name
        else:
            # Use email prefix as fallback
            display_name = None
        
        user_obj = User(
            id=uuid4(),
            email=email,
            apple_user_id=apple_user_id,
            provider="apple",
            first_name=first_name,
            last_name=last_name,
            display_name=display_name
        )
        
        user_id = await storage.create_user(user_obj)
    else:
        user_id = user.id

    # Get and potentially store the refresh token
    #refresh_token = await get_refresh_token(request.authCode)
    #if refresh_token and hasattr(user, 'id'):
    #    # TODO: Securely save the refresh_token to the user's record in your database
    #    pass
    
    # Create an access token for your own API
    access_token = create_access_token(data={"sub": str(user_id)})
    #print("Generated access token:", access_token)  # Debugging line
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        #"refresh_token": refresh_token, # Be mindful of sending this to the client
        "user_id": user_id,
    }