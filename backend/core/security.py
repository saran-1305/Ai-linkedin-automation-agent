"""
Password hashing and access-token signing for the app's own login system.

Implemented with stdlib only (hashlib/hmac) rather than pulling in passlib/PyJWT:
- Password hashing: PBKDF2-HMAC-SHA256 with a random salt (the same primitive
  passlib's pbkdf2_sha256 handler uses under the hood).
- Access tokens: a minimal HS256-signed token (header.payload.signature,
  base64url-encoded, HMAC-SHA256 signature) - functionally equivalent to a JWT
  for this single-service use case, without adding a new dependency.
"""
import base64
import hashlib
import hmac
import json
import logging
import secrets
import time
from typing import Optional

from config.settings import settings

logger = logging.getLogger(__name__)

PBKDF2_ITERATIONS = 260_000
ACCESS_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7  # 7 days


def _get_secret_key() -> bytes:
    key = settings.JWT_SECRET_KEY
    if not key:
        # Dev-only fallback so the app doesn't crash when unconfigured; this key
        # is regenerated on every restart, so it invalidates all existing
        # sessions. Set JWT_SECRET_KEY in the environment for real deployments.
        logger.warning("JWT_SECRET_KEY is not set - using an ephemeral dev key. Set JWT_SECRET_KEY in .env for production.")
        key = _get_secret_key._dev_fallback = getattr(_get_secret_key, "_dev_fallback", secrets.token_hex(32))
    return key.encode("utf-8")


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), PBKDF2_ITERATIONS)
    return f"{salt}${digest.hex()}"


def verify_password(password: str, hashed: str) -> bool:
    try:
        salt, hex_digest = hashed.split("$", 1)
    except ValueError:
        return False
    expected = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), PBKDF2_ITERATIONS)
    return hmac.compare_digest(expected.hex(), hex_digest)


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64url_decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def create_access_token(user_id: int, ttl_seconds: int = ACCESS_TOKEN_TTL_SECONDS) -> str:
    header = {"alg": "HS256", "typ": "AT"}
    payload = {"sub": str(user_id), "iat": int(time.time()), "exp": int(time.time()) + ttl_seconds}

    header_b64 = _b64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_b64 = _b64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signing_input = f"{header_b64}.{payload_b64}".encode("ascii")

    signature = hmac.new(_get_secret_key(), signing_input, hashlib.sha256).digest()
    signature_b64 = _b64url_encode(signature)

    return f"{header_b64}.{payload_b64}.{signature_b64}"


class InvalidTokenError(Exception):
    pass


def decode_access_token(token: str) -> int:
    """Verify signature and expiry, returning the user id encoded in the token."""
    try:
        header_b64, payload_b64, signature_b64 = token.split(".")
    except ValueError:
        raise InvalidTokenError("Malformed token.")

    signing_input = f"{header_b64}.{payload_b64}".encode("ascii")
    expected_signature = hmac.new(_get_secret_key(), signing_input, hashlib.sha256).digest()

    try:
        actual_signature = _b64url_decode(signature_b64)
    except Exception:
        raise InvalidTokenError("Malformed token signature.")

    if not hmac.compare_digest(expected_signature, actual_signature):
        raise InvalidTokenError("Invalid token signature.")

    try:
        payload = json.loads(_b64url_decode(payload_b64))
    except Exception:
        raise InvalidTokenError("Malformed token payload.")

    if payload.get("exp", 0) < time.time():
        raise InvalidTokenError("Token has expired.")

    try:
        return int(payload["sub"])
    except (KeyError, ValueError, TypeError):
        raise InvalidTokenError("Token missing subject.")
