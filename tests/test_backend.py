import asyncio
import copy
import json
from concurrent.futures import ThreadPoolExecutor
from dataclasses import replace
from datetime import date, timedelta
from pathlib import Path
from uuid import uuid4

import httpx
import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from backend.app import Settings, create_app
from backend.bolna import BolnaClient, ProviderError
from backend.models import ShoppingRequest
from backend.quotes import assess_quote
from backend.store import Store

ROOT = Path(__file__).resolve().parents[1]
# Reserved fictional North American test numbers, never sent to a real provider.
PHONE = "+12025550123"
SECOND_PHONE = "+12025550124"
TOKEN = "test-operator-token-" + "x" * 32
HOOK = "test-webhook-token-" + "y" * 32
AUTH = {"Authorization": f"Bearer {TOKEN}"}


@pytest.fixture
def payload():
    return {
        "item": "Spider-Man watches",
        "variant": "Any working children's wristwatch",
        "quantity": 32,
        "currency": "INR",
        "budget": {"amount_inr": "844.00", "basis": "unit", "delivery": "additional"},
        "fulfilment": "delivery",
        "area": "Marine Drive, Mumbai",
        "required_by": (date.today() + timedelta(days=7)).isoformat(),
        "sellers": [{"name": "Fictional test shop", "phone": PHONE}],
    }


@pytest.fixture
def settings(tmp_path):
    return Settings(
        database=str(tmp_path / "sauda.sqlite3"),
        api_token=TOKEN,
        webhook_secret=HOOK,
        bolna_api_key="fake-test-key",
        live_calls_enabled=True,
        allowed_numbers=frozenset({PHONE, SECOND_PHONE}),
    )


class FakeBolna:
    def __init__(self):
        self.starts = []
        self.executions = {}
        self.reads = 0
        self.failure = None

    async def start(self, agent_id, phone, context, request_id, call_id):
        self.starts.append((agent_id, phone, context, request_id, call_id))
        if self.failure:
            raise self.failure
        execution_id = str(uuid4())
        self.executions[execution_id] = {
            "id": execution_id,
            "agent_id": agent_id,
            "status": "queued",
            "telephony_data": {"to_number": phone},
        }
        return {"execution_id": execution_id, "status": "queued"}

    async def execution(self, execution_id):
        self.reads += 1
        return self.executions[execution_id]


def create(client, payload, key="test-request-key"):
    response = client.post("/v1/requests", json=payload, headers={**AUTH, "Idempotency-Key": key})
    assert response.status_code in {200, 201}, response.text
    return response.json()


def start(client, request_id, agent="primary"):
    return client.post(f"/v1/requests/{request_id}/calls", headers=AUTH, json={"agent": agent})


def watch_evidence():
    return json.loads((ROOT / "reports/2026-10-28/watch-extraction.json").read_text())


def watch_transcript():
    return "\n".join("user: " + line for line in watch_evidence()["evidence_quotes"])


def test_create_preview_persist_and_auth(settings, payload):
    fake = FakeBolna()
    with TestClient(create_app(settings, fake)) as client:
        assert client.get("/health").status_code == 200
        assert client.post("/v1/requests", json=payload).status_code == 401
        record = create(client, payload)
        assert record["plan"]["private_quantity_limit_inr"] == "27008.00"
        assert [p["unit_inr"] for p in record["plan"]["nonbinding_proposals"]] == [
            "740.00",
            "790.00",
            "820.00",
        ]
        response = client.post(f"/v1/requests/{record['id']}/preview", json={}, headers=AUTH)
        assert response.status_code == 200
        assert response.json()["calls_placed"] == 0
        assert "request_context" in response.json()["contexts"][0]
        assert fake.starts == []
        assert create(client, payload)["id"] == record["id"]
        changed = {**payload, "quantity": 33}
        assert (
            client.post(
                "/v1/requests",
                json=changed,
                headers={**AUTH, "Idempotency-Key": "test-request-key"},
            ).status_code
            == 409
        )
    with TestClient(create_app(settings, fake)) as restarted:
        assert (
            restarted.get(f"/v1/requests/{record['id']}", headers=AUTH).json()["id"] == record["id"]
        )


@pytest.mark.parametrize(
    "field,value",
    [
        ("quantity", True),
        ("quantity", 0),
        ("item", " "),
        ("variant", "{{item}}"),
        ("area", "unknown"),
        ("currency", "USD"),
        ("required_by", "2000-01-01"),
        ("sellers", []),
        ("unexpected", "injected"),
    ],
)
def test_invalid_request_never_dials(settings, payload, field, value):
    fake = FakeBolna()
    payload[field] = value
    with TestClient(create_app(settings, fake)) as client:
        response = client.post(
            "/v1/requests", json=payload, headers={**AUTH, "Idempotency-Key": "invalid-request"}
        )
        assert response.status_code == 422
        assert PHONE not in response.text
        assert fake.starts == []


@pytest.mark.parametrize("amount", ["NaN", "Infinity", "-1", "0", "844.001", True])
def test_invalid_money(payload, amount):
    payload["budget"]["amount_inr"] = amount
    with pytest.raises(ValidationError):
        ShoppingRequest.model_validate(payload)


def test_total_budget_offers_and_strict_cap(payload):
    payload["quantity"] = 3
    payload["budget"] = {
        "amount_inr": "100.00",
        "basis": "total",
        "delivery": "included",
        "comparison": "under",
    }
    plan = ShoppingRequest.model_validate(payload).offer_plan()
    assert plan["private_quantity_limit_inr"] == "100.00"
    assert plan["private_unit_limit_inr"] == "33.33"
    assert plan["offer_basis"] == "total"
    assert all(float(p["total_inr"]) < 100 for p in plan["nonbinding_proposals"])


def test_duplicate_sellers_and_pickup_scope(payload):
    payload["sellers"] *= 2
    with pytest.raises(ValidationError):
        ShoppingRequest.model_validate(payload)
    payload["sellers"] = payload["sellers"][:1]
    payload["fulfilment"] = "pickup"
    with pytest.raises(ValidationError):
        ShoppingRequest.model_validate(payload)


def test_disabled_and_unapproved_calls(settings, payload):
    fake = FakeBolna()
    for config, expected in [
        (replace(settings, live_calls_enabled=False), 409),
        (replace(settings, bolna_api_key=""), 409),
        (replace(settings, allowed_numbers=frozenset()), 403),
    ]:
        with TestClient(create_app(config, fake)) as client:
            record = create(client, payload)
            assert start(client, record["id"]).status_code == expected
    assert fake.starts == []


def test_multiple_sellers_use_selected_agent_once(settings, payload):
    payload["sellers"].append({"name": "Second fictional shop", "phone": SECOND_PHONE})
    fake = FakeBolna()
    with TestClient(create_app(settings, fake)) as client:
        record = create(client, payload)
        first = start(client, record["id"], "backup")
        assert first.status_code == 200
        assert len(first.json()["calls"]) == 2
        assert len(fake.starts) == 2
        assert all(c[0] == "f7d6dccb-944e-42dc-80ef-69c786195c40" for c in fake.starts)
        assert "Fictional test shop" in fake.starts[0][2]
        assert "Second fictional shop" in fake.starts[1][2]
        assert start(client, record["id"], "backup").status_code == 200
        assert start(client, record["id"], "primary").status_code == 409
        assert len(fake.starts) == 2


@pytest.mark.parametrize("uncertain,status", [(True, "dispatch_unknown"), (False, "rejected")])
def test_failed_dispatch_not_retried_after_restart(settings, payload, uncertain, status):
    fake = FakeBolna()
    fake.failure = ProviderError(uncertain=uncertain)
    with TestClient(create_app(settings, fake)) as client:
        record = create(client, payload)
        assert start(client, record["id"]).json()["calls"][0]["status"] == status
    with TestClient(create_app(settings, fake)) as client:
        assert start(client, record["id"]).status_code == 200
        assert len(fake.starts) == 1


def test_atomic_reservation_across_connections(settings, payload):
    store = Store(settings.database)
    request_id, _ = store.create_request("race-test", payload)

    def reserve(_):
        return Store(settings.database).reserve_calls(request_id, 2, "agent")

    with ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(reserve, range(4)))
    assert sorted(map(len, results)) == [0, 0, 0, 2]
    assert len(store.calls(request_id)) == 2


def test_webhook_uses_authoritative_provider_not_body(settings, payload):
    fake = FakeBolna()
    with TestClient(create_app(settings, fake)) as client:
        request_id = create(client, payload)["id"]
        call = start(client, request_id).json()["calls"][0]
        execution = fake.executions[call["execution_id"]]
        forged = {
            "id": call["execution_id"],
            "status": "completed",
            "extracted_data": watch_evidence(),
        }
        assert client.post("/v1/webhooks/bolna", json=forged).status_code == 401
        assert fake.reads == 0
        headers = {"X-Sauda-Webhook-Secret": HOOK}
        assert client.post("/v1/webhooks/bolna", json=forged, headers=headers).status_code == 200
        assert (
            client.get(f"/v1/requests/{request_id}", headers=AUTH).json()["calls"][0]["status"]
            == "queued"
        )
        execution.update(
            {
                "status": "call-disconnected",
                "extracted_data": {"quote_evidence_json": watch_evidence()},
            }
        )
        response = client.post(f"/v1/calls/{call['id']}/refresh", headers=AUTH)
        assert response.status_code == 200
        assert "quote" not in response.json()["result"]
        execution.update(
            {
                "status": "completed",
                "transcript": watch_transcript(),
                "total_cost": 16,
                "extracted_data": {
                    "Custom": {"quote_evidence_json": {"subjective": json.dumps(watch_evidence())}}
                },
            }
        )
        client.post("/v1/webhooks/bolna", json=forged, headers=headers)
        completed = client.get(f"/v1/requests/{request_id}", headers=AUTH).json()
        quote = completed["quotes"][0]
        assert quote["quoted_amount_for_quantity_inr"] == "26560.00"
        assert quote["quoted_amount_plus_delivery_inr"] == "26640.00"
        assert quote["budget_status"] == "unknown"
        assert quote["verified_all_in_total_inr"] is None
        assert quote["eligible_for_recommendation"] is False
        assert completed["calls"][0]["result"]["provider_cost_cents"] == 16
        # The list is authenticated and omits full transcripts; opening a detail
        # still returns the saved conversation, without mutating stored evidence.
        assert client.get("/v1/requests").status_code == 401
        listing = client.get("/v1/requests?limit=1", headers=AUTH).json()["items"]
        assert len(listing) == 1
        assert "transcript" not in listing[0]["calls"][0]["result"]
        assert (
            client.get(f"/v1/requests/{request_id}", headers=AUTH).json()["calls"][0]["result"][
                "transcript"
            ]
            == watch_transcript()
        )
        assert client.get("/v1/requests?limit=0", headers=AUTH).status_code == 422
        assert client.get("/v1/requests?limit=101", headers=AUTH).status_code == 422
        client.post("/v1/webhooks/bolna", json=forged, headers=headers)
        again = client.get(f"/v1/requests/{request_id}", headers=AUTH).json()
        assert again == completed
        execution["status"] = "ringing"
        client.post("/v1/webhooks/bolna", json=forged, headers=headers)
        assert client.get(f"/v1/requests/{request_id}", headers=AUTH).json() == completed
        execution["agent_id"] = str(uuid4())
        assert client.post("/v1/webhooks/bolna", json=forged, headers=headers).status_code == 502
        assert (
            client.post(
                "/v1/webhooks/bolna", json={"id": str(uuid4())}, headers=headers
            ).status_code
            == 404
        )


def test_agent_recap_is_not_seller_evidence(payload):
    quote = watch_evidence()
    quote["evidence_quotes"] = ["830 each, all included"]
    result = assess_quote(
        ShoppingRequest.model_validate(payload),
        {"quote_evidence_json": quote},
        "assistant: 830 each, all included\nuser: thanks",
    )
    assert "missing_or_non_seller_evidence" in result["issues"]
    assert result["eligible_for_recommendation"] is False


def test_unknown_basis_and_model_totals_do_not_become_verified(payload):
    quote = watch_evidence()
    quote["final_quote_basis"] = "unknown"
    quote["final_all_in_total"] = 830
    result = assess_quote(
        ShoppingRequest.model_validate(payload), {"quote_evidence_json": quote}, watch_transcript()
    )
    assert result["quoted_amount_for_quantity_inr"] is None
    assert result["verified_all_in_total_inr"] is None
    assert result["savings_inr"] is None


def test_budget_violation_and_commitment_flagged(payload):
    quote = watch_evidence()
    quote["final_quote_amount"] = 900
    result = assess_quote(
        ShoppingRequest.model_validate(payload),
        {"quote_evidence_json": quote},
        watch_transcript() + "\nassistant: We will buy. Pack them.",
    )
    assert result["budget_status"] == "potentially_over_budget"
    assert "possible_purchase_commitment" in result["issues"]


@pytest.mark.parametrize(
    "mutation",
    [
        {"final_quote_amount": "830"},
        {"final_quote_amount": True},
        {"business": {"name": "shop"}},
        {"requested_quantity": True},
        {"commitment_made": "false"},
        {"other_mandatory_fees": -1},
    ],
)
def test_malformed_extraction_rejected(payload, mutation):
    quote = {**watch_evidence(), **mutation}
    result = assess_quote(
        ShoppingRequest.model_validate(payload), {"quote_evidence_json": quote}, watch_transcript()
    )
    assert result["issues"] == ["invalid_or_missing_extraction"]


def test_bolna_http_contract_and_no_post_retry():
    requests = []
    execution_id = str(uuid4())

    def handler(request):
        requests.append(request)
        assert request.headers["Authorization"] == "Bearer fake-key"
        if request.method == "POST":
            payload = json.loads(request.content)
            assert set(payload) == {"agent_id", "recipient_phone_number", "user_data"}
            assert payload["user_data"]["request_context"] == "complete context"
            return httpx.Response(200, json={"execution_id": execution_id, "status": "queued"})
        assert request.url.path == f"/executions/{execution_id}"
        return httpx.Response(200, json={"id": execution_id})

    client = BolnaClient("fake-key", transport=httpx.MockTransport(handler))
    result = asyncio.run(client.start("agent", PHONE, "complete context", "request", "call"))
    assert result["execution_id"] == execution_id
    asyncio.run(client.execution(execution_id))
    assert len(requests) == 2
    attempts = []

    def timeout(request):
        attempts.append(request)
        raise httpx.ReadTimeout("ambiguous response")

    client = BolnaClient("fake-key", transport=httpx.MockTransport(timeout))
    with pytest.raises(ProviderError) as exc:
        asyncio.run(client.start("agent", PHONE, "context", "request", "call"))
    assert exc.value.uncertain
    assert len(attempts) == 1


def test_body_limit_and_webhook_bad_payload(settings):
    with TestClient(create_app(settings, FakeBolna())) as client:
        response = client.post("/v1/webhooks/bolna", content=b"x" * 1_000_001)
        assert response.status_code == 413
        response = client.post(
            "/v1/webhooks/bolna", json=[], headers={"X-Sauda-Webhook-Secret": HOOK}
        )
        assert response.status_code == 422


def test_startup_rejects_missing_or_shared_secrets(settings):
    with pytest.raises(RuntimeError):
        create_app(replace(settings, api_token=""))
    with pytest.raises(RuntimeError):
        create_app(replace(settings, webhook_secret=TOKEN))


def test_expired_request_cannot_start_later(settings, payload):
    fake = FakeBolna()
    app = create_app(settings, fake)
    expired = copy.deepcopy(payload)
    expired["required_by"] = "2000-01-01"
    request_id, _ = app.state.store.create_request("old-saved-request", expired)
    with TestClient(app) as client:
        assert start(client, request_id).status_code == 422
    assert fake.starts == []


def test_partial_dispatch_failure_preserves_other_shop(settings, payload):
    payload["sellers"].append({"name": "Second fictional shop", "phone": SECOND_PHONE})

    class PartialFailure(FakeBolna):
        async def start(self, agent_id, phone, context, request_id, call_id):
            if phone == SECOND_PHONE:
                raise ProviderError(uncertain=False)
            return await super().start(agent_id, phone, context, request_id, call_id)

    fake = PartialFailure()
    with TestClient(create_app(settings, fake)) as client:
        request_id = create(client, payload)["id"]
        result = start(client, request_id).json()
        assert [c["status"] for c in result["calls"]] == ["queued", "rejected"]
        assert result["progress"]["finished"] == 1
        assert start(client, request_id).json()["calls"] == result["calls"]


def test_reconcile_uncertain_dispatch_checks_correlation(settings, payload):
    fake = FakeBolna()
    fake.failure = ProviderError()
    with TestClient(create_app(settings, fake)) as client:
        request_id = create(client, payload)["id"]
        call = start(client, request_id).json()["calls"][0]
        execution_id = str(uuid4())
        fake.executions[execution_id] = {
            "id": execution_id,
            "agent_id": call["agent_id"],
            "status": "ringing",
            "telephony_data": {"to_number": PHONE},
            "context_details": {"recipient_data": {"sauda_call_id": "wrong-call"}},
        }
        path = f"/v1/calls/{call['id']}/reconcile"
        assert (
            client.post(path, json={"execution_id": execution_id}, headers=AUTH).status_code == 409
        )
        fake.executions[execution_id]["context_details"]["recipient_data"]["sauda_call_id"] = call[
            "id"
        ]
        response = client.post(path, json={"execution_id": execution_id}, headers=AUTH)
        assert response.status_code == 200
        assert response.json()["status"] == "ringing"
        assert response.json()["execution_id"] == execution_id
        assert start(client, request_id).json()["calls"][0]["execution_id"] == execution_id
        assert len(fake.starts) == 1


def test_refresh_provider_failure_preserves_state_and_recipient_mismatch(settings, payload):
    class RefreshFailure(FakeBolna):
        unavailable = False

        async def execution(self, execution_id):
            if self.unavailable:
                raise ProviderError()
            return await super().execution(execution_id)

    fake = RefreshFailure()
    with TestClient(create_app(settings, fake)) as client:
        request_id = create(client, payload)["id"]
        record = start(client, request_id).json()
        call = record["calls"][0]
        path = f"/v1/calls/{call['id']}/refresh"
        fake.unavailable = True
        assert client.post(path, headers=AUTH).status_code == 502
        assert client.get(f"/v1/requests/{request_id}", headers=AUTH).json() == record
        fake.unavailable = False
        fake.executions[call["execution_id"]]["telephony_data"]["to_number"] = SECOND_PHONE
        assert client.post(path, headers=AUTH).status_code == 502


def test_ambiguous_extraction_wrappers_are_rejected(payload):
    result = assess_quote(
        ShoppingRequest.model_validate(payload),
        {
            "first": {"quote_evidence_json": watch_evidence()},
            "second": {"quote_evidence_json": watch_evidence()},
        },
        watch_transcript(),
    )
    assert result["issues"] == ["invalid_or_missing_extraction"]


@pytest.mark.parametrize("status", ["busy", "no-answer", "balance-low", "failed"])
def test_nonanswered_calls_have_no_quote(settings, payload, status):
    fake = FakeBolna()
    with TestClient(create_app(settings, fake)) as client:
        request_id = create(client, payload)["id"]
        call = start(client, request_id).json()["calls"][0]
        fake.executions[call["execution_id"]]["status"] = status
        result = client.post(f"/v1/calls/{call['id']}/refresh", headers=AUTH).json()
        assert result["status"] == status
        assert "quote" not in result["result"]
        assert client.get(f"/v1/requests/{request_id}", headers=AUTH).json()["quotes"] == []


def test_delivery_scope_controls_potential_overage(payload):
    quote = watch_evidence()
    quote["delivery_amount"] = 1000
    for delivery, expected in [("included", "potentially_over_budget"), ("additional", "unknown")]:
        payload["budget"]["delivery"] = delivery
        result = assess_quote(
            ShoppingRequest.model_validate(payload),
            {"quote_evidence_json": quote},
            watch_transcript(),
        )
        assert result["budget_status"] == expected
        assert result["verified_all_in_total_inr"] is None


def test_strict_ceiling_rejects_equality_in_assessment(payload):
    quote = watch_evidence()
    quote["final_quote_amount"] = 844
    payload["budget"]["comparison"] = "under"
    result = assess_quote(
        ShoppingRequest.model_validate(payload), {"quote_evidence_json": quote}, watch_transcript()
    )
    assert result["budget_status"] == "potentially_over_budget"


def test_seller_evidence_tolerates_transcription_spacing_only(payload):
    quote = watch_evidence()
    quote["evidence_quotes"] = ["it includes all tax and delivery is seventy six rupees"]
    transcript = "user: it includes  all tax and delivery is  seventy six rupees"
    result = assess_quote(
        ShoppingRequest.model_validate(payload), {"quote_evidence_json": quote}, transcript
    )
    assert "missing_or_non_seller_evidence" not in result["issues"]
    transcript = "assistant: it includes all tax and delivery is seventy six rupees\nuser: thanks"
    result = assess_quote(
        ShoppingRequest.model_validate(payload), {"quote_evidence_json": quote}, transcript
    )
    assert "missing_or_non_seller_evidence" in result["issues"]
    transcript = "user: it includes some tax and delivery is seventy six rupees"
    result = assess_quote(
        ShoppingRequest.model_validate(payload), {"quote_evidence_json": quote}, transcript
    )
    assert "missing_or_non_seller_evidence" in result["issues"]
