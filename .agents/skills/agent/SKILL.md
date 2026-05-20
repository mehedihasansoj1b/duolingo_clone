---
name: Agent
description: Use when building voice agents, video agents, or real-time AI applications. Reach for this skill when you need to create conversational AI that listens, understands, and responds in real time—whether for customer support, phone bots, video analysis, or interactive experiences. Use it to configure LLM/STT/TTS pipelines, deploy agents to production, integrate with external tools, or add video processing.
metadata:
    mintlify-proj: agent
    version: "1.0"
---

# Vision Agents Skill

## Product Summary

Vision Agents is a Python framework for building low-latency voice and video AI agents. It provides a modular architecture where you compose an `Agent` from pluggable components: an LLM (language model), STT (speech-to-text), TTS (text-to-speech), and optional video processors. The framework ships with 30+ integrations for providers like OpenAI, Gemini, Deepgram, ElevenLabs, and others—swap any component in one line. Deploy agents to production via Docker/Kubernetes with built-in HTTP server, metrics, and session management. Requires Python 3.12+ and a Stream account for real-time transport.

**Key files and commands:**
- `main.py` — Agent entry point with `create_agent()` and `join_call()` functions
- `.env` — API keys for LLM, STT, TTS, and other providers (auto-loaded)
- `uv run main.py run` — Console mode (development)
- `uv run main.py serve` — HTTP server mode (production)
- `Agent` class — Central orchestrator for all components
- `Runner` and `AgentLauncher` — Manage agent lifecycle and sessions

**Primary docs:** https://visionagents.ai

## When to Use

Reach for this skill when:

- **Building voice agents** — Customer support bots, phone assistants, voice-controlled applications
- **Creating video agents** — Real-time video analysis, pose detection, object recognition, surveillance
- **Integrating with external tools** — Function calling, MCP servers, knowledge bases (RAG)
- **Deploying to production** — Docker, Kubernetes, horizontal scaling, monitoring
- **Swapping AI providers** — Testing different LLMs, STT, or TTS without rewriting code
- **Adding real-time capabilities** — Low-latency audio/video processing on Stream's edge network
- **Testing agent behavior** — Unit testing tool calls, responses, and intents without live infrastructure

Do not use this skill for: static chatbots, batch processing, or applications that don't require real-time interaction.

## Quick Reference

### Agent Constructor

```python
from vision_agents.core import Agent, User
from vision_agents.plugins import getstream, gemini, deepgram, elevenlabs

agent = Agent(
    edge=getstream.Edge(),                    # Transport layer
    agent_user=User(name="Assistant", id="agent"),
    instructions="You're a helpful voice assistant.",
    llm=gemini.LLM("gemini-2.5-flash-lite"),  # Language model
    stt=deepgram.STT(eager_turn_detection=True),  # Speech-to-text
    tts=elevenlabs.TTS(),                     # Text-to-speech
    processors=[],                            # Optional: video processors
    mcp_servers=[],                           # Optional: external tools
)
```

### Core Methods

| Method | Purpose |
|--------|---------|
| `agent.join(call)` | Join a video call (async context manager) |
| `agent.simple_response(text)` | Send text to LLM, speak response via TTS |
| `agent.say(text)` | Speak text directly (bypass LLM) |
| `agent.finish()` | Wait for call to end |
| `agent.close()` | Clean up resources |

### Running Agents

| Mode | Command | Use Case |
|------|---------|----------|
| Console | `uv run main.py run` | Development, testing, single agent |
| HTTP Server | `uv run main.py serve --host 0.0.0.0 --port 8000` | Production, multi-session |

### HTTP Server Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/calls/{call_id}/sessions` | Start agent session |
| DELETE | `/calls/{call_id}/sessions/{session_id}` | Close session |
| GET | `/calls/{call_id}/sessions/{session_id}/metrics` | Get performance metrics |
| GET | `/health` | Liveness check |
| GET | `/ready` | Readiness check |

### Environment Variables

```bash
# LLM providers
GOOGLE_API_KEY=...
OPENAI_API_KEY=...

# Speech services
DEEPGRAM_API_KEY=...
ELEVENLABS_API_KEY=...

# Stream (required)
STREAM_API_KEY=...
STREAM_API_SECRET=...
```

### Function Calling

```python
@llm.register_function(description="Get weather for a location")
async def get_weather(location: str) -> dict:
    return {"temp": "22C", "condition": "Sunny"}

# LLM calls this automatically when relevant
response = await llm.simple_response("What's the weather in London?")
```

### Testing

```python
from vision_agents.testing import TestSession, LLMJudge

async def test_greeting():
    llm = gemini.LLM("gemini-2.0-flash")
    judge = LLMJudge(gemini.LLM("gemini-2.0-flash"))
    
    async with TestSession(llm=llm, instructions="Be friendly") as session:
        response = await session.simple_response("Hello")
        response.assert_function_called("get_weather")
        verdict = await judge.evaluate(response.chat_messages[0], intent="Friendly greeting")
        assert verdict.success
```

## Decision Guidance

### Realtime vs. Custom Pipeline

| Aspect | Realtime Mode | Custom Pipeline |
|--------|---------------|-----------------|
| **Setup** | Simplest (one LLM) | More config (STT + LLM + TTS) |
| **Latency** | Lowest (~50ms) | Slightly higher |
| **Control** | Limited | Full control over each component |
| **Providers** | Gemini, OpenAI, Qwen, xAI | Mix any STT, LLM, TTS |
| **When to use** | Prototypes, demos, speed critical | Production, custom requirements |

**Realtime example:**
```python
llm=gemini.Realtime()  # Handles STT/TTS internally
```

**Custom pipeline example:**
```python
llm=gemini.LLM()
stt=deepgram.STT()
tts=elevenlabs.TTS()
```

### Deployment: Single Node vs. Horizontal Scaling

| Factor | Single Node | Horizontal (Redis) |
|--------|-------------|-------------------|
| **Sessions** | In-memory registry | Shared Redis store |
| **Sticky sessions** | Not needed | Not needed |
| **Max concurrent** | Limited by machine | Unlimited (add nodes) |
| **Cost** | Lower | Higher (Redis + nodes) |
| **When to use** | Dev, small production | High traffic, multi-region |

### STT Provider Choice

| Provider | Latency | Turn Detection | Cost | Best For |
|----------|---------|----------------|------|----------|
| **Deepgram** | ~85ms | Built-in | Pay-per-use | General purpose |
| **ElevenLabs** | ~150ms | Built-in | Pay-per-use | High quality |
| **Fast-Whisper** | ~200ms | None | Free (local) | Cost-sensitive |
| **Mistral** | ~100ms | None | Pay-per-use | Multilingual |

## Workflow

### 1. Create a Basic Agent

1. **Initialize project:**
   ```bash
   uv init --python 3.12 my-agent && cd my-agent
   uv add "vision-agents[getstream,gemini]" python-dotenv
   ```

2. **Add `.env` with API keys:**
   ```bash
   STREAM_API_KEY=...
   STREAM_API_SECRET=...
   GOOGLE_API_KEY=...
   ```

3. **Write `main.py`:**
   ```python
   from dotenv import load_dotenv
   from vision_agents.core import Agent, AgentLauncher, User, Runner
   from vision_agents.plugins import getstream, gemini
   
   load_dotenv()
   
   async def create_agent(**kwargs) -> Agent:
       return Agent(
           edge=getstream.Edge(),
           agent_user=User(name="Assistant", id="agent"),
           instructions="You're a helpful voice assistant.",
           llm=gemini.Realtime(),
       )
   
   async def join_call(agent: Agent, call_type: str, call_id: str, **kwargs) -> None:
       call = await agent.create_call(call_type, call_id)
       async with agent.join(call):
           await agent.simple_response("Greet the user")
           await agent.finish()
   
   if __name__ == "__main__":
       Runner(AgentLauncher(create_agent=create_agent, join_call=join_call)).cli()
   ```

4. **Run:** `uv run main.py run`

### 2. Add Function Calling

1. **Register functions on the LLM:**
   ```python
   @llm.register_function(description="Get weather")
   async def get_weather(location: str) -> dict:
       return {"temp": "22C"}
   ```

2. **Agent calls automatically when relevant** — no extra code needed.

### 3. Deploy to Production

1. **Create `Dockerfile`:**
   ```dockerfile
   FROM python:3.13-slim
   WORKDIR /app
   RUN pip install uv
   COPY pyproject.toml uv.lock agent.py ./
   ENV UV_LINK_MODE=copy
   CMD ["sh", "-c", "uv sync --frozen && uv run agent.py serve --host 0.0.0.0 --port 8000"]
   ```

2. **Build for Linux:**
   ```bash
   docker buildx build --platform linux/amd64 -t vision-agent .
   ```

3. **Run HTTP server:**
   ```bash
   docker run -e STREAM_API_KEY=... -p 8000:8000 vision-agent
   ```

4. **Create sessions via API:**
   ```bash
   curl -X POST http://localhost:8000/calls/my-call/sessions \
     -H "Content-Type: application/json" \
     -d '{"call_type": "default"}'
   ```

### 4. Test Agent Behavior

1. **Write test with `TestSession`:**
   ```python
   async def test_weather_tool():
       llm = gemini.LLM("gemini-2.0-flash")
       async with TestSession(llm=llm, instructions="...") as session:
           response = await session.simple_response("Weather in Berlin?")
           response.assert_function_called("get_weather", arguments={"location": "Berlin"})
   ```

2. **Run:** `uv run pytest tests/ -m integration`

## Common Gotchas

- **Async functions only** — `@llm.register_function()` requires async functions. Sync functions raise `ValueError`.
- **Call IDs must be lowercase alphanumeric** — Pattern: `^[a-z0-9_-]+$`. Invalid IDs return HTTP 400.
- **STT/TTS auto-disabled in realtime mode** — Don't pass `stt` or `tts` when using `gemini.Realtime()` or `openai.Realtime()`.
- **Turn detection conflicts** — If STT has built-in turn detection (Deepgram, ElevenLabs), don't pass a separate `turn_detection` plugin.
- **API keys auto-loaded from `.env`** — Vision Agents scans `.env` automatically. Don't pass keys manually unless needed.
- **Session closure is async** — DELETE and POST `/close` return HTTP 202 (accepted). Closure happens on next maintenance cycle, not immediately.
- **GPU not needed for most agents** — Only use GPU Dockerfile if running local models (Roboflow, local VLMs). Voice agents use cloud APIs.
- **Metrics are no-ops without OpenTelemetry** — Configure `PrometheusMetricReader` or `OTLPSpanExporter` to enable collection. Otherwise, metrics have zero overhead.
- **Instructions support file references** — Use `instructions="@system.md"` to load from a markdown file.
- **Multi-speaker filtering defaults to FirstSpeakerWinsFilter** — Agent locks onto first speaker and drops others. Override with `multi_speaker_filter=` parameter.

## Verification Checklist

Before submitting agent code:

- [ ] All required API keys are in `.env` (STREAM_API_KEY, STREAM_API_SECRET, provider keys)
- [ ] Agent uses async functions for all registered tools (`@llm.register_function()`)
- [ ] STT/TTS not passed when using realtime LLM (Gemini Realtime, OpenAI Realtime)
- [ ] Call IDs match pattern `^[a-z0-9_-]+$` (lowercase, alphanumeric, hyphens, underscores)
- [ ] `join_call()` awaits `agent.finish()` or has explicit exit logic
- [ ] Dockerfile uses `--platform linux/amd64` for cloud deployment
- [ ] HTTP server endpoints tested with curl or client library
- [ ] Metrics configured if monitoring is required (Prometheus or Jaeger)
- [ ] Tests pass: `uv run pytest tests/ -m integration`
- [ ] Agent runs locally: `uv run main.py run`
- [ ] Docker image builds: `docker buildx build --platform linux/amd64 -t vision-agent .`

## Resources

**Comprehensive navigation:** https://visionagents.ai/llms.txt

**Critical documentation:**
1. [Quickstart](https://visionagents.ai/introduction/quickstart) — 5-minute setup
2. [Voice Agents](https://visionagents.ai/introduction/voice-agents) — Realtime vs. custom pipelines
3. [Built-in HTTP Server](https://visionagents.ai/guides/http-server) — Production deployment and API reference
4. [Integrations](https://visionagents.ai/integrations/introduction-to-integrations) — 30+ provider options
5. [MCP and Function Calling](https://visionagents.ai/guides/mcp-tool-calling) — External tools and tool execution
6. [Docker Deployment](https://visionagents.ai/guides/deployment) — Production setup
7. [Telemetry & Metrics](https://visionagents.ai/core/telemetry) — Monitoring and observability
8. [Testing](https://visionagents.ai/guides/testing) — Unit testing agents without live infrastructure

---

> For additional documentation and navigation, see: https://visionagents.ai/llms.txt