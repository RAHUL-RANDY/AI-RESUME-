import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from backend.database.mongo import get_db
from backend.models.schemas import UserRegister, UserLogin, UserResponse, Token, UserRole, GoogleLoginRequest
from backend.services.auth_service import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserRegister, db = Depends(get_db)):
    existing_user = await db["users"].find_one({"email": user_in.email.lower()})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    user_id = str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()
    hashed_pwd = hash_password(user_in.password)

    user_doc = {
        "_id": user_id,
        "name": user_in.name,
        "email": user_in.email.lower(),
        "password_hash": hashed_pwd,
        "role": user_in.role.value,
        "created_at": now_iso
    }

    await db["users"].insert_one(user_doc)

    return UserResponse(
        id=user_id,
        name=user_in.name,
        email=user_in.email.lower(),
        role=user_in.role,
        created_at=now_iso
    )

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db = Depends(get_db)):
    user = await db["users"].find_one({"email": credentials.email.lower()})
    if not user or not verify_password(credentials.password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    user_id = str(user["_id"])
    token_data = {
        "sub": user_id,
        "email": user["email"],
        "role": user["role"]
    }
    access_token = create_access_token(token_data)

    user_resp = UserResponse(
        id=user_id,
        name=user["name"],
        email=user["email"],
        role=UserRole(user["role"]),
        created_at=user.get("created_at")
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user_resp
    )

@router.post("/google", response_model=Token)
async def google_login(google_in: GoogleLoginRequest, db = Depends(get_db)):
    email = None
    name = google_in.name or "Google User"

    # If raw credential JWT passed from Google Identity Services
    if google_in.credential:
        try:
            import json
            import base64
            parts = google_in.credential.split(".")
            if len(parts) >= 2:
                padded = parts[1] + "=" * ((4 - len(parts[1]) % 4) % 4)
                claims = json.loads(base64.urlsafe_b64decode(padded.encode()))
                email = claims.get("email")
                if claims.get("name"):
                    name = claims.get("name")
        except Exception:
            pass

    if not email and google_in.email:
        email = str(google_in.email).lower()

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google sign-in error: Email address could not be verified."
        )

    email = email.lower()
    user = await db["users"].find_one({"email": email})

    if not user:
        user_id = str(uuid.uuid4())
        now_iso = datetime.now(timezone.utc).isoformat()
        role = (google_in.role or UserRole.CANDIDATE).value

        user_doc = {
            "_id": user_id,
            "name": name,
            "email": email,
            "password_hash": "oauth_google",
            "role": role,
            "created_at": now_iso
        }
        await db["users"].insert_one(user_doc)
        user = user_doc

    user_id = str(user["_id"])
    token_data = {
        "sub": user_id,
        "email": user["email"],
        "role": user["role"]
    }
    access_token = create_access_token(token_data)

    user_resp = UserResponse(
        id=user_id,
        name=user["name"],
        email=user["email"],
        role=UserRole(user["role"]),
        created_at=user.get("created_at")
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user_resp
    )

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user["_id"]),
        name=current_user["name"],
        email=current_user["email"],
        role=UserRole(current_user["role"]),
        created_at=current_user.get("created_at")
    )
