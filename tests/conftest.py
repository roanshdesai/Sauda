import os
from uuid import uuid4

import psycopg
import pytest
from psycopg import sql
from psycopg.conninfo import make_conninfo


@pytest.fixture
def postgres_url(monkeypatch):
    url = os.getenv("SAUDA_TEST_POSTGRES_URL")
    if not url:
        pytest.skip("Set SAUDA_TEST_POSTGRES_URL to a disposable PostgreSQL test database")
    schema = "sauda_test_" + uuid4().hex
    original_connect = psycopg.connect
    with original_connect(url, autocommit=True) as db:
        db.execute(sql.SQL("CREATE SCHEMA {}").format(sql.Identifier(schema)))

    def isolated_connect(conninfo, **kwargs):
        return original_connect(
            make_conninfo(conninfo, options=f"-c search_path={schema}"), **kwargs
        )

    monkeypatch.setattr(psycopg, "connect", isolated_connect)
    yield url
    with original_connect(url, autocommit=True) as db:
        db.execute(sql.SQL("DROP SCHEMA {} CASCADE").format(sql.Identifier(schema)))
