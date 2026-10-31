"""Opt-in integration tests against disposable schemas in a real PostgreSQL database."""

from concurrent.futures import ThreadPoolExecutor

import psycopg
import pytest

from backend.app import Settings
from backend.store import Conflict, Store


def test_concurrent_idempotency_and_reservations_survive_reconnect(postgres_url):
    def create(_):
        return Store(postgres_url).create_request("same-key", {"item": "shirts"})

    with ThreadPoolExecutor(max_workers=8) as executor:
        created = list(executor.map(create, range(8)))
    assert len({item[0] for item in created}) == 1
    assert sum(item[1] for item in created) == 1
    request_id = created[0][0]
    store = Store(postgres_url)
    with pytest.raises(Conflict):
        store.create_request("same-key", {"item": "watches"})

    def reserve(_):
        return Store(postgres_url).reserve_calls(request_id, 3, "primary")

    with ThreadPoolExecutor(max_workers=8) as executor:
        batches = list(executor.map(reserve, range(8)))
    assert sorted(map(len, batches)) == [0] * 7 + [3]
    assert len(Store(postgres_url).calls(request_id)) == 3
    assert Store(postgres_url).request(request_id)["request"] == {"item": "shirts"}
    assert store.request_ids() == [request_id]
    with pytest.raises(Conflict):
        store.reserve_calls(request_id, 3, "backup")


def test_reconciliation_uniqueness_and_terminal_status(postgres_url):
    store = Store(postgres_url)
    request_id, _ = store.create_request("one", {})
    first, second = store.reserve_calls(request_id, 2, "primary")
    store.dispatch_failed(first["id"], uncertain=True)
    store.reconcile(first["id"], "execution-one")
    store.reconcile(first["id"], "execution-one")
    with pytest.raises(Conflict):
        store.reconcile(second["id"], "execution-one")
    assert store.call(call_id=second["id"])["execution_id"] is None
    store.dispatched(second["id"], "execution-two")
    assert store.call(execution_id="execution-two")["status"] == "queued"
    store.update_execution(first["id"], "completed", {"transcript": "finished"})
    store.update_execution(first["id"], "ringing", {})
    assert Store(postgres_url).call(call_id=first["id"])["result"] == {"transcript": "finished"}


def test_transaction_rolls_back_all_reservations(postgres_url):
    store = Store(postgres_url)
    request_id, _ = store.create_request("one", {})
    with pytest.raises(psycopg.IntegrityError):
        with store.connect() as db:
            db.execute("BEGIN IMMEDIATE")
            db.execute(
                "INSERT INTO calls VALUES (?, ?, 0, 'primary', NULL, 'dispatching', '', '', NULL)",
                ("one", request_id),
            )
            db.execute(
                "INSERT INTO calls VALUES (?, ?, 0, 'primary', NULL, 'dispatching', '', '', NULL)",
                ("two", request_id),
            )
    assert store.calls(request_id) == []
    assert len(store.reserve_calls(request_id, 1, "primary")) == 1


def test_database_url_overrides_local_path(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "postgresql://example.invalid/sauda")
    monkeypatch.setenv("SAUDA_DATABASE", "private/local.sqlite3")
    assert Settings.from_env().database == "postgresql://example.invalid/sauda"


def test_render_refuses_ephemeral_sqlite(monkeypatch):
    monkeypatch.setenv("RENDER", "true")
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.setenv("SAUDA_DATABASE", "private/local.sqlite3")
    with pytest.raises(RuntimeError, match="Render requires DATABASE_URL"):
        Settings.from_env()
