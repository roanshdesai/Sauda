from uuid import UUID

import httpx


class ProviderError(Exception):
    """Redacted provider error; uncertain POSTs must never be retried automatically."""

    def __init__(self, uncertain=True):
        self.uncertain = uncertain
        super().__init__("Bolna request failed; inspect call state before any retry")


class BolnaClient:
    def __init__(self, api_key: str, transport=None):
        self.api_key = api_key
        self.transport = transport

    async def _request(self, method, path, payload=None):
        if not self.api_key:
            raise ProviderError(uncertain=False)
        try:
            async with httpx.AsyncClient(
                base_url="https://api.bolna.ai",
                timeout=25,
                transport=self.transport,
                follow_redirects=False,
                headers={"Authorization": f"Bearer {self.api_key}"},
            ) as client:
                response = await client.request(method, path, json=payload)
                if response.status_code >= 400:
                    # Explicit client rejection didn't accept a call; 5xx may have.
                    raise ProviderError(uncertain=response.status_code >= 500)
                if not 200 <= response.status_code < 300:
                    raise ProviderError()
                value = response.json()
                if not isinstance(value, dict):
                    raise ProviderError()
                return value
        except (httpx.HTTPError, ValueError) as exc:
            raise ProviderError() from exc

    async def start(self, agent_id, phone, context, request_id, call_id):
        result = await self._request(
            "POST",
            "/call",
            {
                "agent_id": agent_id,
                "recipient_phone_number": phone,
                "user_data": {
                    "request_context": context,
                    "sauda_request_id": request_id,
                    "sauda_call_id": call_id,
                },
            },
        )
        try:
            result["execution_id"] = str(UUID(result["execution_id"]))
        except (KeyError, ValueError, TypeError, AttributeError) as exc:
            raise ProviderError() from exc
        return result

    async def execution(self, execution_id):
        return await self._request("GET", f"/executions/{UUID(execution_id)}")
