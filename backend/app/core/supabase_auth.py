from jose import jwt
import requests
from fastapi import HTTPException, status

SUPABASE_URL = "https://qbyyaupfhkcrdzzakrhl.supabase.co"
SUPABASE_JWKS_URL = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"

# fetch public keys once
jwks = requests.get(SUPABASE_JWKS_URL).json()


def verify_supabase_token(token: str):
    try:
        payload = jwt.decode(
            token,
            jwks,
            algorithms=["RS256"],
            audience="authenticated",
        )
        return payload
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Supabase token",
        )