# OpenAI Apps / ChatGPT Native Integration

This backend now exposes an MCP-compatible HTTP endpoint you can connect from a ChatGPT-native app integration.

## Endpoints

- `GET /api/apps/manifest`
- `POST /api/apps/mcp`

## Optional auth

Set this in `.env` to require a bearer token:

```bash
APPS_MCP_API_KEY=your_shared_token
```

When set, call endpoints with:

```bash
Authorization: Bearer your_shared_token
```

## Public URL

Set the deployed origin so the manifest returns an absolute server URL:

```bash
PUBLIC_BASE_URL=https://your-domain.com
```

## Exposed MCP tools

- `steadyai.get_user_summary`
- `steadyai.ask_agent`
- `steadyai.educator_help`
- `steadyai.workout_coach`
- `steadyai.log_workout_session`

## Rich UI support (Apps SDK style)

The MCP server now supports:

- `resources/list`
- `resources/read`

For `steadyai.ask_agent`, `tools/list` includes:

- `_meta.ui.resourceUri = ui://widget/steadyai-agent-card.html`
- `_meta["openai/outputTemplate"] = ui://widget/steadyai-agent-card.html`

For `steadyai.educator_help` and `steadyai.get_user_summary`, `tools/list` also includes
their own `ui.resourceUri` + `openai/outputTemplate` values:

- `ui://widget/steadyai-educator-card.html`
- `ui://widget/steadyai-summary-card.html`
- `ui://widget/steadyai-workout-card.html`

The resource returns `text/html;profile=mcp-app` and uses `window.openai` in the widget for:

- reading `toolInput` / `toolOutput`
- `sendFollowUpMessage(...)`
- `requestDisplayMode({ mode: "fullscreen" })`

## Local test

Initialize:

```bash
curl -X POST http://localhost:3000/api/apps/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'
```

List tools:

```bash
curl -X POST http://localhost:3000/api/apps/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
```

Call Habit Coach:

```bash
curl -X POST http://localhost:3000/api/apps/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "id":3,
    "method":"tools/call",
    "params":{
      "name":"steadyai.ask_agent",
      "arguments":{
        "agentType":"HABIT_COACH",
        "prompt":"I missed three check-ins this week and want to restart."
      }
    }
  }'
```

Call Workout Coach (include `userId` so "Save session" works in widget):

```bash
curl -X POST http://localhost:3000/api/apps/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "id":6,
    "method":"tools/call",
    "params":{
      "name":"steadyai.workout_coach",
      "arguments":{
        "userId":"<USER_UUID>",
        "prompt":"Create a low-impact workout for today."
      }
    }
  }'
```

List resources:

```bash
curl -X POST http://localhost:3000/api/apps/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":4,"method":"resources/list","params":{}}'
```

Read widget resource:

```bash
curl -X POST http://localhost:3000/api/apps/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "id":5,
    "method":"resources/read",
    "params":{"uri":"ui://widget/steadyai-agent-card.html"}
  }'
```
