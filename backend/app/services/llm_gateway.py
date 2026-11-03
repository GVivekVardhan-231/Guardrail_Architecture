"""
LLM Gateway Service with Strict Guardrail Interception.
Ensures blocked prompts are NEVER transmitted to the LLM.
Supports Local Demo Mode and OpenAI-Compatible API integration.
"""

import httpx
from typing import Dict, Any, Optional
from app.config import settings

class LLMGateway:
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0)

    async def forward(self, effective_prompt: str, action: str) -> Dict[str, Any]:
        """
        Forwards only sanctioned prompts to the LLM backend.
        Never calls LLM if action is BLOCK.
        """
        if action == "BLOCK" or not effective_prompt:
            return {
                "status": "BLOCKED",
                "provider": "GUARDRAIL_INTERCEPTOR",
                "response": (
                    "Request blocked by security guardrail: the request cannot be fulfilled as requested "
                    "because its evaluated risk score meets or exceeds the safety threshold (>= 10.0). "
                    "Safe alternative: Please reframe your inquiry around defensive security measures, "
                    "theoretical vulnerability concepts, or mitigation best practices."
                )
            }

        # Check configured provider
        has_api_key = bool(settings.LLM_API_KEY and len(settings.LLM_API_KEY.strip()) > 5)
        use_real_api = settings.LLM_PROVIDER == "openai" and has_api_key

        if use_real_api:
            return await self._call_openai_compatible(effective_prompt)
        else:
            return self._call_demo_provider(effective_prompt, action)

    async def _call_openai_compatible(self, prompt: str) -> Dict[str, Any]:
        """Calls external OpenAI-compatible chat completion endpoint."""
        try:
            headers = {
                "Authorization": f"Bearer {settings.LLM_API_KEY}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": settings.LLM_MODEL,
                "messages": [
                    {"role": "system", "content": "You are a helpful, secure, and professional AI assistant."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 800
            }

            url = f"{settings.LLM_BASE_URL.rstrip('/')}/chat/completions"
            resp = await self.client.post(url, headers=headers, json=payload)

            if resp.status_code == 200:
                data = resp.json()
                content = data["choices"][0]["message"]["content"]
                return {
                    "status": "SUCCESS",
                    "provider": f"OpenAI Compatible ({settings.LLM_MODEL})",
                    "response": content
                }
            else:
                return {
                    "status": "FAILED",
                    "provider": "OpenAI Compatible",
                    "response": f"External LLM API returned status {resp.status_code}: {resp.text[:200]}"
                }
        except Exception as e:
            # Graceful fallback to demo provider if API fails
            demo_resp = self._call_demo_provider(prompt, "FALLBACK")
            demo_resp["response"] += f"\n\n*(Note: Real LLM API request failed: {str(e)[:100]}. Fallback demo response served.)*"
            return demo_resp

    def _call_demo_provider(self, prompt: str, action: str) -> Dict[str, Any]:
        """
        Local Demo LLM Provider providing authentic responses without requiring third-party API keys.
        """
        p_lower = prompt.lower()
        prefix = ""
        if action in ["SANITIZE", "REWRITE"]:
            prefix = f"*[Guardrail Action Applied: {action}. Safe Prompt Received: \"{prompt}\"]*\n\n"

        # Contextual response generation
        if "binary search" in p_lower:
            body = (
                "**Binary Search Explanation & Implementation:**\n\n"
                "Binary search is an efficient search algorithm that finds the position of a target value within a sorted array. "
                "It works by repeatedly dividing the search interval in half.\n\n"
                "**Time Complexity:** O(log n)\n"
                "**Space Complexity:** O(1) iterative, O(log n) recursive.\n\n"
                "```cpp\n"
                "int binarySearch(const std::vector<int>& arr, int target) {\n"
                "    int left = 0, right = arr.size() - 1;\n"
                "    while (left <= right) {\n"
                "        int mid = left + (right - left) / 2;\n"
                "        if (arr[mid] == target) return mid;\n"
                "        if (arr[mid] < target) left = mid + 1;\n"
                "        else right = mid - 1;\n"
                "    }\n"
                "    return -1;\n"
                "}\n"
                "```"
            )
        elif "recursion" in p_lower:
            body = (
                "**Understanding Recursion in C++:**\n\n"
                "Recursion occurs when a function calls itself directly or indirectly to solve a smaller instance of the same problem.\n\n"
                "**Two Essential Elements:**\n"
                "1. **Base Case:** Stops recursion from continuing infinitely and overflowing the call stack.\n"
                "2. **Recursive Step:** Moves the state closer towards the base case.\n\n"
                "```cpp\n"
                "// Example: Factorial Calculation\n"
                "long long factorial(int n) {\n"
                "    if (n <= 1) return 1; // Base case\n"
                "    return n * factorial(n - 1); // Recursive call\n"
                "}\n"
                "```"
            )
        elif "supervised" in p_lower and "unsupervised" in p_lower:
            body = (
                "**Supervised vs. Unsupervised Learning:**\n\n"
                "| Feature | Supervised Learning | Unsupervised Learning |\n"
                "| :--- | :--- | :--- |\n"
                "| **Training Data** | Labeled dataset (input pairs (x, y)) | Unlabeled data (inputs x only) |\n"
                "| **Objective** | Predict output/target labels for new inputs | Discover latent patterns, clusters, or representations |\n"
                "| **Key Tasks** | Classification, Regression | Clustering (K-Means), Dimensionality Reduction (PCA) |\n"
                "| **Feedback** | Direct error metric vs ground truth | Internal evaluation (e.g. silhouette score, variance explained) |"
            )
        elif "linked list" in p_lower:
            body = (
                "**Reversing a Singly Linked List in Python:**\n\n"
                "```python\n"
                "class ListNode:\n"
                "    def __init__(self, val=0, next=None):\n"
                "        self.val = val\n"
                "        self.next = next\n\n"
                "def reverseList(head: ListNode) -> ListNode:\n"
                "    prev = None\n"
                "    curr = head\n"
                "    while curr:\n"
                "        next_node = curr.next\n"
                "        curr.next = prev\n"
                "        prev = curr\n"
                "        curr = next_node\n"
                "    return prev\n"
                "```\n\n"
                "**Complexity:** O(N) time, O(1) additional space."
            )
        else:
            body = (
                f"Thank you for your prompt: *\"{prompt}\"*.\n\n"
                "This request was verified as safe by the prompt injection guardrail architecture "
                "and processed through the local demonstration LLM engine. "
                "The guardrail validated that your input contains legitimate intent with zero malicious exploit signatures."
            )

        return {
            "status": "SUCCESS",
            "provider": "Local Safe Demo Provider",
            "response": prefix + body
        }

llm_gateway = LLMGateway()
