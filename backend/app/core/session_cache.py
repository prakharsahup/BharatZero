# Simple in-memory cache for calculation sessions (fallback when DB is unavailable)
_cache: dict = {}


def store(session_id: str, data: dict) -> None:
    _cache[session_id] = data


def get(session_id: str) -> dict | None:
    return _cache.get(session_id)


def list_by_user(user_id: str) -> list:
    """Return all cached calculations for a given user, newest first."""
    results = [v for v in _cache.values() if v.get("user_id") == user_id]
    # Sort by session_id (UUID) as a proxy for insertion order — stable enough for demo
    return list(reversed(results))
