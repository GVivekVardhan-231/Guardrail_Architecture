"""
GuardWall ASGI Middleware for FastAPI and Starlette applications.
Intercepts incoming HTTP requests, extracts prompt payloads, and blocks malicious requests at the gateway.
"""

import json
from typing import Optional, List
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from guardwall.core import GuardWall
from guardwall.types import PolicyAction


class GuardWallMiddleware(BaseHTTPMiddleware):
    """
    FastAPI / Starlette Middleware that places a GuardWall in front of LLM endpoints.
    
    Usage:
        >>> from fastapi import FastAPI
        >>> from guardwall.middleware import GuardWallMiddleware
        >>> app = FastAPI()
        >>> app.add_middleware(GuardWallMiddleware, paths=["/api/v1/chat", "/generate"])
    """

    def __init__(
        self,
        app,
        wall: Optional[GuardWall] = None,
        paths: Optional[List[str]] = None,
        prompt_field: str = "prompt"
    ):
        super().__init__(app)
        self.wall = wall or GuardWall()
        self.guarded_paths = paths or ["/api/chat", "/api/generate", "/v1/chat/completions"]
        self.prompt_field = prompt_field

    async def dispatch(self, request: Request, call_next) -> Response:
        # Check if path is guarded and request is POST
        if request.method == "POST" and any(request.url.path.startswith(p) for p in self.guarded_paths):
            try:
                body_bytes = await request.body()
                if body_bytes:
                    data = json.loads(body_bytes.decode("utf-8"))
                    prompt = None

                    # Extract prompt from single field or OpenAI messages array
                    if self.prompt_field in data:
                        prompt = data[self.prompt_field]
                    elif "messages" in data and isinstance(data["messages"], list):
                        for m in reversed(data["messages"]):
                            if m.get("role") == "user":
                                prompt = m.get("content", "")
                                break

                    if prompt and isinstance(prompt, str):
                        decision = self.wall.inspect(prompt)
                        if decision.action == PolicyAction.BLOCK:
                            return JSONResponse(
                                status_code=403,
                                content={
                                    "error": "GuardWall Blocked",
                                    "policy_action": "BLOCK",
                                    "risk_score": decision.risk_score,
                                    "risk_level": decision.risk_level,
                                    "reason": decision.policy_reason,
                                    "timing_ms": decision.timing.total_latency_ms
                                },
                                headers={
                                    "X-GuardWall-Action": "BLOCK",
                                    "X-GuardWall-Risk": str(decision.risk_score)
                                }
                            )

                        # If sanitized or rewritten, re-inject into request
                        if decision.is_sanitized:
                            if self.prompt_field in data:
                                data[self.prompt_field] = decision.effective_prompt
                            elif "messages" in data and isinstance(data["messages"], list):
                                for m in reversed(data["messages"]):
                                    if m.get("role") == "user":
                                        m["content"] = decision.effective_prompt
                                        break
                            # Replace body
                            request._body = json.dumps(data).encode("utf-8")
            except Exception:
                # On parsing error or non-JSON, continue safely
                pass

        response = await call_next(request)
        return response
