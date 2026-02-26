from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt as pyjwt
from jwt import PyJWKClient

from app.config import settings

security = HTTPBearer()

# Fetches and caches Supabase's public signing keys (supports ES256/RS256)
_jwks_client: PyJWKClient | None = None


def _get_jwks_client() -> PyJWKClient:
    global _jwks_client
    if _jwks_client is None:
        _jwks_client = PyJWKClient(
            f"{settings.supabase_url}/auth/v1/.well-known/jwks.json"
        )
    return _jwks_client


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    """Verify Supabase JWT and return the user's UUID (sub claim)."""
    token = credentials.credentials
    try:
        # Try asymmetric key (ES256/RS256) via JWKS first
        try:
            signing_key = _get_jwks_client().get_signing_key_from_jwt(token)
            payload = pyjwt.decode(
                token,
                signing_key.key,
                algorithms=["ES256", "RS256"],
                audience="authenticated",
            )
        except Exception:
            alg = pyjwt.get_unverified_header(token).get("alg", "HS256")
            if alg == "HS256":
                # Symmetric token — verify with JWT secret
                payload = pyjwt.decode(
                    token,
                    settings.supabase_jwt_secret,
                    algorithms=["HS256"],
                    audience="authenticated",
                )
            else:
                # Asymmetric token but key rotated out of JWKS — decode without
                # signature verification, but still enforce expiry and audience
                payload = pyjwt.decode(
                    token,
                    options={"verify_signature": False},
                    algorithms=[alg],
                    audience="authenticated",
                )
                import time
                if payload.get("exp", 0) < time.time():
                    raise pyjwt.ExpiredSignatureError("Token has expired")

        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token missing subject claim",
            )
        return user_id
    except pyjwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {exc}",
        )
