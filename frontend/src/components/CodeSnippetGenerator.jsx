import React, { useState } from 'react';
import { Copy, Check, Terminal, Code2, Server, Cpu } from 'lucide-react';

export const CodeSnippetGenerator = ({ prompt = "Explain recursion in C++" }) => {
  const [activeTab, setActiveTab] = useState('sdk');
  const [copied, setCopied] = useState(false);

  const cleanPrompt = (prompt || "Explain binary search").replace(/"/g, '\\"');

  const snippets = {
    sdk: `from guardwall import GuardWall, PolicyAction

# Initialize the GuardWall security framework
wall = GuardWall()

# Intercept prompt before calling any LLM
decision = wall.inspect("${cleanPrompt}")

if decision.is_blocked:
    print(f"🛑 Dropped at Wall: {decision.policy_reason}")
    print(f"Risk Score: {decision.risk_score}/100")
else:
    # Pass safe effective_prompt (which might be sanitized or rewritten) to LLM
    print(f"✅ Sanctioned: Forwarding to LLM: '{decision.effective_prompt}'")
    # response = llm.generate(decision.effective_prompt)
`,
    decorator: `from guardwall import GuardWall

wall = GuardWall()

# Decorator automatically wraps LLM function and enforces the wall
@wall.guard(fallback_response="[GUARDWALL BLOCKED] Adversarial injection attempt rejected.")
def query_llm(prompt: str) -> str:
    # This code only runs if prompt passes the security wall!
    return client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}]
    ).choices[0].message.content

# Execute query through the wall
result = query_llm(prompt="${cleanPrompt}")
`,
    openai: `from openai import OpenAI

# GuardWall provides a drop-in OpenAI-compatible reverse proxy gateway!
# Simply point base_url to GuardWall:
client = OpenAI(
    base_url="http://localhost:8000/v1",
    api_key="sk-guardwall-local"
)

# Every prompt is intercepted across 5 defensive techniques before reaching upstream
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "user", "content": "${cleanPrompt}"}
    ]
)

print(response.choices[0].message.content)
`,
    curl: `curl -X POST http://localhost:8000/api/analyze \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "${cleanPrompt}",
    "session_id": "cli_session"
  }'
`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#10182b] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      <div className="flex flex-wrap items-center justify-between p-3 bg-[#0a0f1d] border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Code2 className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Integrate GuardWall into Your Application
          </span>
          <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
            Python Framework SDK & Proxy
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center space-x-1.5 px-3 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-mono"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
          <span>{copied ? 'Copied!' : 'Copy Code'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800/80 bg-[#0c1222] px-3 gap-2">
        <button
          onClick={() => setActiveTab('sdk')}
          className={`py-2 px-3 text-xs font-medium border-b-2 transition ${
            activeTab === 'sdk'
              ? 'border-cyan-400 text-cyan-300 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Python SDK (Direct Wall)
        </button>
        <button
          onClick={() => setActiveTab('decorator')}
          className={`py-2 px-3 text-xs font-medium border-b-2 transition ${
            activeTab === 'decorator'
              ? 'border-cyan-400 text-cyan-300 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          @wall.guard() Decorator
        </button>
        <button
          onClick={() => setActiveTab('openai')}
          className={`py-2 px-3 text-xs font-medium border-b-2 transition ${
            activeTab === 'openai'
              ? 'border-cyan-400 text-cyan-300 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Drop-in OpenAI Proxy
        </button>
        <button
          onClick={() => setActiveTab('curl')}
          className={`py-2 px-3 text-xs font-medium border-b-2 transition ${
            activeTab === 'curl'
              ? 'border-cyan-400 text-cyan-300 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          cURL REST API
        </button>
      </div>

      {/* Code body */}
      <pre className="p-4 text-xs font-mono text-cyan-300 bg-[#060a14] overflow-x-auto whitespace-pre leading-relaxed">
        {snippets[activeTab]}
      </pre>
    </div>
  );
};

export default CodeSnippetGenerator;
