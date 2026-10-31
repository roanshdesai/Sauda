"""Same-origin operator session for the UI; never ship the API token to the browser."""

import hashlib
import hmac
import secrets
import time
from urllib.parse import urlsplit

from fastapi import HTTPException, Request

COOKIE = "sauda_session"
SESSION_SECONDS = 8 * 60 * 60


def require_same_origin(request: Request):
    origin = request.headers.get("origin")
    parsed = urlsplit(origin or "")
    if not origin or (parsed.scheme, parsed.netloc) != (request.url.scheme, request.url.netloc):
        raise HTTPException(403, "Open this workspace directly before making changes")
    if request.headers.get("sec-fetch-site") == "cross-site":
        raise HTTPException(403, "Cross-site requests are not permitted")


def issue_session(secret: str) -> str:
    payload = f"{int(time.time()) + SESSION_SECONDS}.{secrets.token_hex(16)}"
    signature = hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()
    return f"{payload}.{signature}"


def valid_session(value: str | None, secret: str) -> bool:
    if not value:
        return False
    try:
        expiry, nonce, signature = value.split(".")
        payload = f"{expiry}.{nonce}"
        expected = hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()
        return int(time.time()) < int(expiry) <= int(
            time.time()
        ) + SESSION_SECONDS and hmac.compare_digest(signature, expected)
    except (ValueError, TypeError):
        return False
