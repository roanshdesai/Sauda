"""SQLite transactions reserve calls before dialing, including across process restarts."""

import json
import sqlite3
from contextlib import contextmanager
from datetime import UTC, datetime
from pathlib import Path
from uuid import uuid4

TERMINAL = {
    "completed",
    "no-answer",
    "busy",
    "failed",
    "canceled",
    "stopped",
    "error",
    "balance-low",
}
PROGRESS = {
    "dispatching": -1,
    "dispatch_unknown": -1,
    "scheduled": 0,
    "rescheduled": 0,
    "queued": 1,
    "initiated": 2,
    "ringing": 3,
    "in-progress": 4,
    "call-disconnected": 5,
}


def now():
    return datetime.now(UTC).isoformat()


class Conflict(Exception):
    pass


class Store:
    def __init__(self, path):
        self.path = str(path)
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        with self.connect() as db:
            db.execute("PRAGMA journal_mode=WAL")
            db.executescript("""
                CREATE TABLE IF NOT EXISTS requests (
                    id TEXT PRIMARY KEY, idempotency_key TEXT UNIQUE NOT NULL,
                    payload TEXT NOT NULL, created_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS calls (
                    id TEXT PRIMARY KEY, request_id TEXT NOT NULL REFERENCES requests(id),
                    seller_index INTEGER NOT NULL, agent_id TEXT NOT NULL,
                    execution_id TEXT UNIQUE, status TEXT NOT NULL,
                    created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
                    result TEXT, UNIQUE(request_id, seller_index)
                );
            """)
        Path(path).chmod(0o600)

    @contextmanager
    def connect(self):
        db = sqlite3.connect(self.path, timeout=10)
        db.row_factory = sqlite3.Row
        db.execute("PRAGMA foreign_keys=ON")
        try:
            with db:
                yield db
        finally:
            db.close()

    def create_request(self, key, payload):
        encoded = json.dumps(payload, sort_keys=True)
        with self.connect() as db:
            db.execute("BEGIN IMMEDIATE")
            existing = db.execute(
                "SELECT * FROM requests WHERE idempotency_key=?", (key,)
            ).fetchone()
            if existing:
                if existing["payload"] != encoded:
                    raise Conflict("Idempotency key was already used for different input")
                return existing["id"], False
            request_id = str(uuid4())
            db.execute(
                "INSERT INTO requests VALUES (?, ?, ?, ?)", (request_id, key, encoded, now())
            )
            return request_id, True

    def request(self, request_id):
        with self.connect() as db:
            row = db.execute("SELECT * FROM requests WHERE id=?", (request_id,)).fetchone()
        if row is None:
            return None
        return {
            "id": row["id"],
            "created_at": row["created_at"],
            "request": json.loads(row["payload"]),
        }

    def calls(self, request_id):
        with self.connect() as db:
            rows = db.execute(
                "SELECT * FROM calls WHERE request_id=? ORDER BY seller_index", (request_id,)
            ).fetchall()
        return [self.decode(row) for row in rows]

    @staticmethod
    def decode(row):
        if row is None:
            return None
        data = dict(row)
        data["result"] = json.loads(data["result"]) if data["result"] else None
        return data

    def call(self, call_id=None, execution_id=None):
        with self.connect() as db:
            if call_id:
                row = db.execute("SELECT * FROM calls WHERE id=?", (call_id,)).fetchone()
            else:
                row = db.execute(
                    "SELECT * FROM calls WHERE execution_id=?", (execution_id,)
                ).fetchone()
        return self.decode(row)

    def reserve_calls(self, request_id, seller_count, agent_id):
        with self.connect() as db:
            db.execute("BEGIN IMMEDIATE")
            rows = db.execute("SELECT * FROM calls WHERE request_id=?", (request_id,)).fetchall()
            if rows:
                if any(row["agent_id"] != agent_id for row in rows):
                    raise Conflict("This request already has calls with a different agent")
                return []
            ids = []
            timestamp = now()
            for index in range(seller_count):
                call_id = str(uuid4())
                db.execute(
                    "INSERT INTO calls VALUES (?, ?, ?, ?, NULL, 'dispatching', ?, ?, NULL)",
                    (call_id, request_id, index, agent_id, timestamp, timestamp),
                )
                ids.append(call_id)
        return [self.call(call_id=i) for i in ids]

    def dispatched(self, call_id, execution_id):
        with self.connect() as db:
            db.execute(
                "UPDATE calls SET execution_id=?, status='queued', updated_at=? WHERE id=? "
                "AND status='dispatching'",
                (execution_id, now(), call_id),
            )

    def reconcile(self, call_id, execution_id):
        with self.connect() as db:
            db.execute("BEGIN IMMEDIATE")
            old = db.execute("SELECT * FROM calls WHERE id=?", (call_id,)).fetchone()
            if old["execution_id"] == execution_id:
                return
            if old["execution_id"] or old["status"] not in {"dispatching", "dispatch_unknown"}:
                raise Conflict("Only unresolved dispatches can be reconciled")
            try:
                db.execute(
                    "UPDATE calls SET execution_id=?, updated_at=? WHERE id=?",
                    (execution_id, now(), call_id),
                )
            except sqlite3.IntegrityError as exc:
                raise Conflict("Execution is already attached to another call") from exc

    def dispatch_failed(self, call_id, uncertain):
        with self.connect() as db:
            db.execute(
                "UPDATE calls SET status=?, updated_at=? WHERE id=? AND status='dispatching'",
                ("dispatch_unknown" if uncertain else "rejected", now(), call_id),
            )

    def update_execution(self, call_id, status, result):
        if status not in TERMINAL | PROGRESS.keys():
            raise ValueError("Unsupported Bolna status")
        with self.connect() as db:
            db.execute("BEGIN IMMEDIATE")
            old = db.execute("SELECT * FROM calls WHERE id=?", (call_id,)).fetchone()
            # Final outcomes are sticky; late ringing/disconnected events cannot erase them.
            if old["status"] in TERMINAL and old["status"] != status:
                return
            if status not in TERMINAL and PROGRESS.get(status, -1) < PROGRESS.get(
                old["status"], -1
            ):
                return
            encoded = json.dumps(result, sort_keys=True)
            if old["status"] == status and old["result"] == encoded:
                return
            db.execute(
                "UPDATE calls SET status=?, result=?, updated_at=? WHERE id=?",
                (status, encoded, now(), call_id),
            )
