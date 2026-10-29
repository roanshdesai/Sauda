import asyncio
import hmac
import json
import os
import sqlite3
from dataclasses import dataclass
from pathlib import Path
from typing import Annotated
from uuid import UUID

from fastapi import Depends, FastAPI, Header, HTTPException, Query, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import FileResponse, JSONResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.staticfiles import StaticFiles

from backend.bolna import BolnaClient, ProviderError
from backend.models import ReconcileCall, SessionLogin, ShoppingRequest, StartCalls, request_context
from backend.quotes import assess_quote
from backend.store import TERMINAL, Conflict, Store
from backend.ui import COOKIE, SESSION_SECONDS, issue_session, require_same_origin, valid_session

ROOT = Path(__file__).resolve().parents[1]
AGENTS = json.loads((ROOT / "agents/configuration.json").read_text())


@dataclass(frozen=True)
class Settings:
    database: str
    api_token: str
    webhook_secret: str
    bolna_api_key: str = ""
    live_calls_enabled: bool = False
    allowed_numbers: frozenset[str] = frozenset()
    dispatch_concurrency: int = 2

    @classmethod
    def from_env(cls):
        return cls(
            database=os.getenv("SAUDA_DATABASE", str(ROOT / "private/sauda.sqlite3")),
            api_token=os.getenv("SAUDA_API_TOKEN", ""),
            webhook_secret=os.getenv("SAUDA_WEBHOOK_SECRET", ""),
            bolna_api_key=os.getenv("BOLNA_API_KEY", ""),
            live_calls_enabled=os.getenv("SAUDA_LIVE_CALLS_ENABLED", "false").lower() == "true",
            allowed_numbers=frozenset(
                filter(None, (n.strip() for n in os.getenv("SAUDA_ALLOWED_NUMBERS", "").split(",")))
            ),
            dispatch_concurrency=int(os.getenv("SAUDA_DISPATCH_CONCURRENCY", "2")),
        )


class BodyLimit:
    """Bound streamed/chunked bodies too; do not reflect request secrets in errors."""

    def __init__(self, app, limit=1_000_000):
        self.app, self.limit = app, limit

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)
        chunks, size = [], 0
        while True:
            message = await receive()
            if message["type"] == "http.disconnect":
                return
            size += len(message.get("body", b""))
            if size > self.limit:
                return await JSONResponse({"detail": "Request too large"}, 413)(
                    scope, receive, send
                )
            chunks.append(message.get("body", b""))
            if not message.get("more_body", False):
                break
        consumed = False

        async def replay():
            nonlocal consumed
            if consumed:
                return await receive()
            consumed = True
            return {"type": "http.request", "body": b"".join(chunks), "more_body": False}

        await self.app(scope, replay, send)


def create_app(settings: Settings | None = None, provider=None):
    settings = settings or Settings.from_env()
    if len(settings.api_token) < 32 or len(settings.webhook_secret) < 32:
        raise RuntimeError("Set separate SAUDA_API_TOKEN and SAUDA_WEBHOOK_SECRET (32+ characters)")
    if settings.api_token == settings.webhook_secret:
        raise RuntimeError("API and webhook credentials must differ")
    if not 1 <= settings.dispatch_concurrency <= 5:
        raise RuntimeError("SAUDA_DISPATCH_CONCURRENCY must be between 1 and 5")
    store = Store(settings.database)
    bolna = provider or BolnaClient(settings.bolna_api_key)
    dispatch_slots = asyncio.Semaphore(settings.dispatch_concurrency)
    app = FastAPI(
        title="Sauda Backend",
        version="0.1.0",
        description=(
            "Single-operator quote-only API. Live calls are disabled by default. "
            "Quote assessments require human review."
        ),
    )
    app.add_middleware(BodyLimit)
    app.state.store = store
    security = HTTPBearer(auto_error=False)

    async def operator(
        request: Request,
        credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
    ):
        if credentials is not None:
            if hmac.compare_digest(credentials.credentials.encode(), settings.api_token.encode()):
                return
            raise HTTPException(401, "Valid operator bearer token required")
        if not valid_session(request.cookies.get(COOKIE), settings.api_token):
            raise HTTPException(401, "Sign in to your workspace")
        if request.method not in {"GET", "HEAD", "OPTIONS"}:
            require_same_origin(request)

    @app.middleware("http")
    async def privacy_headers(request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "same-origin"
        response.headers["X-Frame-Options"] = "DENY"
        if request.url.path.startswith("/v1/"):
            response.headers["Cache-Control"] = "no-store"
        return response

    @app.post("/v1/session")
    def login(body: SessionLogin, request: Request):
        require_same_origin(request)
        if not hmac.compare_digest(body.access_code.encode(), settings.api_token.encode()):
            raise HTTPException(401, "That workspace access code is not correct")
        response = JSONResponse({"authenticated": True})
        response.set_cookie(
            COOKIE,
            issue_session(settings.api_token),
            max_age=SESSION_SECONDS,
            httponly=True,
            secure=request.url.scheme == "https",
            samesite="strict",
        )
        return response

    @app.delete("/v1/session", dependencies=[Depends(operator)])
    def logout():
        response = JSONResponse({"authenticated": False})
        response.delete_cookie(COOKIE)
        return response

    @app.exception_handler(RequestValidationError)
    async def validation_error(_request, exc):
        # FastAPI's default includes input values, which may contain phone numbers.
        return JSONResponse(
            status_code=422,
            content={
                "detail": [
                    {"loc": e["loc"], "type": e["type"], "msg": e["msg"]} for e in exc.errors()
                ]
            },
        )

    @app.exception_handler(Conflict)
    async def conflict(_request, exc):
        return JSONResponse({"detail": str(exc)}, 409)

    def lookup(request_id):
        record = store.request(str(request_id))
        if record is None:
            raise HTTPException(404, "Request not found")
        return record, ShoppingRequest.model_validate(record["request"])

    def view(request_id):
        record, shopping = lookup(request_id)
        calls = store.calls(str(request_id))
        return {
            **record,
            "plan": shopping.offer_plan(),
            "calls": calls,
            "progress": {
                "total_sellers": len(shopping.sellers),
                "attempted": len(calls),
                "finished": sum(c["status"] in TERMINAL | {"rejected"} for c in calls),
                "needs_reconciliation": sum(
                    c["status"] in {"dispatch_unknown", "dispatching"} for c in calls
                ),
            },
            "quotes": [
                {
                    "call_id": c["id"],
                    "seller": shopping.sellers[c["seller_index"]].name,
                    **c["result"]["quote"],
                }
                for c in calls
                if c["result"] and c["result"].get("quote")
            ],
        }

    async def refresh(call, execution=None):
        if execution is None:
            try:
                execution = await bolna.execution(call["execution_id"])
            except ProviderError:
                raise HTTPException(502, "Could not refresh Bolna execution; saved state retained")
        if (
            execution.get("id") != call["execution_id"]
            or execution.get("agent_id") != call["agent_id"]
        ):
            raise HTTPException(502, "Bolna execution identity mismatch")
        _, shopping = lookup(call["request_id"])
        phone = shopping.sellers[call["seller_index"]].phone
        to_number = (execution.get("telephony_data") or {}).get("to_number")
        if to_number and to_number != phone:
            raise HTTPException(502, "Bolna recipient mismatch")
        status = execution.get("status")
        if not isinstance(status, str):
            raise HTTPException(502, "Missing or invalid Bolna execution status")
        result = {"termination_reason": execution.get("termination_reason")}
        if status in TERMINAL:
            # Keep only needed data. Do not persist recording URLs, injected secrets or raw logs.
            result["provider_cost_cents"] = execution.get("total_cost")
            result["duration_seconds"] = execution.get("conversation_duration")
        if status == "completed":
            transcript = execution.get("transcript")
            if not isinstance(transcript, str):
                transcript = ""
            result["transcript"] = transcript
            result["quote"] = assess_quote(shopping, execution.get("extracted_data"), transcript)
        try:
            store.update_execution(call["id"], status, result)
        except ValueError:
            raise HTTPException(502, "Unsupported Bolna execution status")
        return store.call(call_id=call["id"])

    @app.get("/health")
    def health():
        return {"status": "ok", "service": "sauda-backend"}

    @app.get("/v1/config", dependencies=[Depends(operator)])
    def config():
        return {
            "live_calls_enabled": settings.live_calls_enabled,
            "provider_configured": bool(settings.bolna_api_key),
            "allowed_recipient_count": len(settings.allowed_numbers),
            "agents": {name: AGENTS[name]["id"] for name in ("primary", "backup")},
            "mode": "consented_roleplay",
            "purchase_authorized": False,
        }

    @app.post("/v1/requests", dependencies=[Depends(operator)], status_code=201)
    def create_request(
        shopping: ShoppingRequest,
        idempotency_key: Annotated[str, Header(min_length=8, max_length=128)],
    ):
        try:
            shopping.check_deadline()
        except ValueError as exc:
            raise HTTPException(422, str(exc))
        request_id, created = store.create_request(
            idempotency_key, shopping.model_dump(mode="json")
        )
        return JSONResponse(view(request_id), status_code=201 if created else 200)

    @app.get("/v1/requests/{request_id}", dependencies=[Depends(operator)])
    def get_request(request_id: UUID):
        return view(str(request_id))

    @app.get("/v1/requests", dependencies=[Depends(operator)])
    def list_requests(limit: Annotated[int, Query(ge=1, le=100)] = 50):
        items = []
        for request_id in store.request_ids(limit):
            item = view(request_id)
            # Transcripts are loaded only when a specific request is opened.
            for call in item["calls"]:
                if call.get("result"):
                    call["result"].pop("transcript", None)
            items.append(item)
        return {"items": items}

    @app.post("/v1/requests/{request_id}/preview", dependencies=[Depends(operator)])
    def preview(request_id: UUID, body: StartCalls):
        _, shopping = lookup(request_id)
        return {
            "calls_placed": 0,
            "agent_id": AGENTS[body.agent]["id"],
            "plan": shopping.offer_plan(),
            "contexts": [
                {"seller": s.name, "request_context": request_context(shopping, s)}
                for s in shopping.sellers
            ],
        }

    @app.post("/v1/requests/{request_id}/calls", dependencies=[Depends(operator)])
    async def start_calls(request_id: UUID, body: StartCalls):
        _, shopping = lookup(request_id)
        if not settings.live_calls_enabled or not settings.bolna_api_key:
            raise HTTPException(409, "Live calls disabled or Bolna key missing; use /preview")
        if any(s.phone not in settings.allowed_numbers for s in shopping.sellers):
            raise HTTPException(403, "Every recipient must be on the consented test allowlist")
        try:
            shopping.check_deadline()
        except ValueError as exc:
            raise HTTPException(422, str(exc))
        reserved = store.reserve_calls(
            str(request_id), len(shopping.sellers), AGENTS[body.agent]["id"]
        )

        async def dial(call):
            async with dispatch_slots:
                seller = shopping.sellers[call["seller_index"]]
                try:
                    response = await bolna.start(
                        call["agent_id"],
                        seller.phone,
                        request_context(shopping, seller),
                        str(request_id),
                        call["id"],
                    )
                    store.dispatched(call["id"], response["execution_id"])
                except ProviderError as exc:
                    store.dispatch_failed(call["id"], exc.uncertain)
                except (sqlite3.Error, KeyError, TypeError):
                    # DB failure after provider acceptance also must never redial blindly.
                    store.dispatch_failed(call["id"], True)

        await asyncio.gather(*(dial(call) for call in reserved))
        return view(str(request_id))

    @app.post("/v1/calls/{call_id}/refresh", dependencies=[Depends(operator)])
    async def refresh_call(call_id: UUID):
        call = store.call(call_id=str(call_id))
        if not call:
            raise HTTPException(404, "Call not found")
        if not call["execution_id"]:
            raise HTTPException(409, "No execution ID; reconcile in Bolna before any retry")
        return await refresh(call)

    @app.post("/v1/calls/{call_id}/reconcile", dependencies=[Depends(operator)])
    async def reconcile_call(call_id: UUID, body: ReconcileCall):
        call = store.call(call_id=str(call_id))
        if not call:
            raise HTTPException(404, "Call not found")
        if call["execution_id"] or call["status"] not in {"dispatching", "dispatch_unknown"}:
            raise HTTPException(409, "Only unresolved dispatches can be reconciled")
        try:
            execution = await bolna.execution(str(body.execution_id))
        except ProviderError:
            raise HTTPException(502, "Could not retrieve execution for reconciliation")
        _, shopping = lookup(call["request_id"])
        context = execution.get("context_details") or {}
        recipient_data = context.get("recipient_data") or context
        if (
            execution.get("id") != str(body.execution_id)
            or execution.get("agent_id") != call["agent_id"]
            or (execution.get("telephony_data") or {}).get("to_number")
            != shopping.sellers[call["seller_index"]].phone
            or recipient_data.get("sauda_call_id") != call["id"]
        ):
            raise HTTPException(409, "Execution must match agent, recipient and sauda_call_id")
        store.reconcile(call["id"], str(body.execution_id))
        return await refresh(store.call(call_id=call["id"]), execution)

    @app.post("/v1/webhooks/bolna")
    async def webhook(
        request: Request, x_sauda_webhook_secret: Annotated[str | None, Header()] = None
    ):
        if x_sauda_webhook_secret is None or not hmac.compare_digest(
            x_sauda_webhook_secret.encode(), settings.webhook_secret.encode()
        ):
            raise HTTPException(401, "Invalid webhook secret")
        try:
            payload = await request.json()
            execution_id = str(UUID(payload["id"]))
        except (ValueError, TypeError, KeyError, AttributeError):
            raise HTTPException(422, "Webhook must contain a valid execution id")
        call = store.call(execution_id=execution_id)
        if not call:
            # Never adopt unknown executions or launch calls from webhook data.
            raise HTTPException(404, "Execution not tracked; retry after dispatch is recorded")
        await refresh(call)  # Webhook body is only a notification, not quote/status authority.
        return {"accepted": True}

    frontend = ROOT / "frontend/dist"
    if frontend.is_dir():
        app.mount("/assets", StaticFiles(directory=frontend / "assets"), name="assets")

        @app.get("/", include_in_schema=False)
        def workspace():
            return FileResponse(frontend / "index.html", headers={"Cache-Control": "no-cache"})

    return app
