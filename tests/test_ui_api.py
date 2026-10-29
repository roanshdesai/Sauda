import time

from fastapi.testclient import TestClient

from backend.app import Settings, create_app
from backend.ui import COOKIE, issue_session, valid_session

TOKEN = "operator-test-token-" + "x" * 32
SECRET = "webhook-test-token-" + "y" * 32
ORIGIN = {"Origin": "http://testserver"}


def test_cookie_login_csrf_logout_and_no_token_exposure(tmp_path):
    app = create_app(Settings(str(tmp_path / "ui.sqlite3"), TOKEN, SECRET))
    with TestClient(app) as client:
        assert client.get("/v1/requests").status_code == 401
        assert client.post("/v1/session", json={"access_code": TOKEN}).status_code == 403
        assert (
            client.post(
                "/v1/session",
                json={"access_code": TOKEN},
                headers={"Origin": "https://testserver"},
            ).status_code
            == 403
        )
        assert (
            client.post(
                "/v1/session",
                json={"access_code": TOKEN},
                headers={"Origin": "https://attacker.example"},
            ).status_code
            == 403
        )
        response = client.post("/v1/session", json={"access_code": TOKEN}, headers=ORIGIN)
        assert response.status_code == 200
        assert TOKEN not in response.text and TOKEN not in response.headers["set-cookie"]
        assert "HttpOnly" in response.headers["set-cookie"]
        assert "SameSite=strict" in response.headers["set-cookie"]
        assert client.get("/v1/requests").json() == {"items": []}
        assert client.get("/v1/config").headers["cache-control"] == "no-store"
        assert client.delete("/v1/session").status_code == 403
        assert client.delete("/v1/session", headers=ORIGIN).status_code == 200
        assert client.get("/v1/config").status_code == 401


def test_cookie_tampering_and_expiry():
    cookie = issue_session(TOKEN)
    assert valid_session(cookie, TOKEN)
    assert not valid_session(cookie, "another-secret")
    assert not valid_session(cookie + "x", TOKEN)
    assert not valid_session(str(int(time.time()) - 1) + cookie[cookie.index(".") :], TOKEN)
    assert not valid_session(None, TOKEN)


def test_secure_cookie_on_https_and_bearer_still_works(tmp_path):
    app = create_app(Settings(str(tmp_path / "https.sqlite3"), TOKEN, SECRET))
    with TestClient(app, base_url="https://sauda.example") as client:
        response = client.post(
            "/v1/session", json={"access_code": TOKEN}, headers={"Origin": "https://sauda.example"}
        )
        assert "Secure" in response.headers["set-cookie"]
        client.cookies.set(COOKIE, "invalid")
        assert (
            client.get("/v1/config", headers={"Authorization": "Bearer " + TOKEN}).status_code
            == 200
        )


def test_workspace_serves_only_compiled_public_files(tmp_path, monkeypatch):
    import backend.app as module

    build = tmp_path / "frontend/dist"
    (build / "assets").mkdir(parents=True)
    (build / "index.html").write_text("<html><title>Sauda</title></html>")
    (build / "assets/app.js").write_text("console.log('public asset')")
    (tmp_path / ".env").write_text("PRIVATE_VALUE=must-not-be-served")
    monkeypatch.setattr(module, "ROOT", tmp_path)
    with TestClient(
        create_app(Settings(str(tmp_path / "private/data.sqlite3"), TOKEN, SECRET))
    ) as client:
        assert client.get("/").status_code == 200
        assert client.get("/assets/app.js").status_code == 200
        for path in ["/.env", "/private/data.sqlite3", "/frontend/src/App.tsx"]:
            assert client.get(path).status_code == 404
        assert client.get("/v1/requests").status_code == 401
