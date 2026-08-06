from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database.session import get_db
from api.dependencies import get_current_user_id
from models.user import User
from core.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])


class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str | None = None


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    email: str
    name: str | None = None
    role: str = "user"
    developer_mode_enabled: bool = False


class UserResponse(BaseModel):
    id: int
    email: str
    name: str | None = None
    role: str = "user"
    developer_mode_enabled: bool = False


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    if len(body.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")

    existing = db.query(User).filter(User.email == body.email.lower()).first()
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    user = User(email=body.email.lower(), hashed_password=hash_password(body.password), name=body.name)
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user_id=user.id, email=user.email, name=user.name, role=user.role, developer_mode_enabled=user.developer_mode_enabled)


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email.lower()).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This account has been deactivated.")

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user_id=user.id, email=user.email, name=user.name, role=user.role, developer_mode_enabled=user.developer_mode_enabled)


@router.get("/me", response_model=UserResponse)
def get_me(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return UserResponse(id=user.id, email=user.email, name=user.name, role=user.role, developer_mode_enabled=user.developer_mode_enabled)


class DevModeRequest(BaseModel):
    enabled: bool

@router.post("/dev-mode")
def toggle_dev_mode(body: DevModeRequest, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    user.developer_mode_enabled = body.enabled
    db.commit()
    return {"status": "ok", "enabled": user.developer_mode_enabled}
