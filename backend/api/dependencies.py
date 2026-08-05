from typing import Generator
from fastapi import Depends, Header, HTTPException, status
from database.session import SessionLocal
from core.security import decode_access_token, InvalidTokenError

def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

def get_current_user_id(authorization: str = Header(None)) -> int:
    """Extracts and verifies the bearer access token, returning the user id.
    Raises 401 if missing/invalid/expired."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid Authorization header.")

    token = authorization.removeprefix("Bearer ").strip()
    try:
        return decode_access_token(token)
    except InvalidTokenError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
