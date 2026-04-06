# GSheets Work OS — Quick Capture

A lightweight Tauri v2 desktop app that provides a global keyboard shortcut
(`Ctrl+Shift+T` / `Cmd+Shift+T`) for instant task capture with AI-powered
natural language parsing.

## Architecture: Two-Tiered NLP

```
User types: "review PR tomorrow P1 #backend @myproject"
                          │
                          ▼
               ┌─────────────────────┐
               │  Tier 1: Local NLP  │  Deterministic regex parser
               │  (runs in browser)  │  Extracts: title, date, priority,
               │                     │  tags, project, assignee, effort
               └────────┬────────────┘
                         │
                    confidence >= 0.6?
                    /            \
                  YES              NO
                   │                │
                   ▼                ▼
          ┌──────────────┐  ┌───────────────────┐
          │ board_create_ │  │ board_parse_and_  │
          │ task (direct) │  │ create_task       │
          │               │  │ (agent-assisted)  │
          └──────────────┘  └───────────────────┘
                   │                │
                   ▼                ▼
             Board MCP (Apps Script doPost endpoint)
```

**Tier 1 -- Local Parse (~0ms):** A deterministic regex-based parser in
TypeScript extracts structured fields from the input. Handles priorities
(`P0`-`P3`, `urgent`, `high`), relative dates (`today`, `tomorrow`,
`next friday`, `in 3 days`), tags (`#backend`), projects (`@myproject`,
`PRJ-xxx`), assignees (`->alice@co.com`), and effort (`2.5h`).

**Tier 2 -- Agent-Assisted (~2-5s):** When Tier 1 confidence is below 0.6
(ambiguous input, complex sentences), the raw text is sent to
`board_parse_and_create_task` on the Board MCP. This endpoint calls an LLM
(Gemini via Apps Script) to parse the input into structured fields, then
creates the task.

## Setup

```bash
# Prerequisites: Rust, Node.js 18+, system libs (GTK, WebKit on Linux)

# Install dependencies
npm install

# Configure (env vars or .env file)
export BOARD_MCP_ENDPOINT="https://script.google.com/macros/s/YOUR_ID/exec"
export BOARD_MCP_SECRET="your-hmac-secret"
export BOARD_MCP_AGENT_ID="quick_capture"

# Development
npm run tauri dev

# Build for production
npm run tauri build
```

## NLP Syntax Reference

| Token | Extracts | Examples |
|-------|----------|----------|
| `P0`-`P3` | Priority | `P1`, `urgent`, `high`, `low` |
| Date words | Due date | `today`, `tomorrow`, `friday`, `next week`, `in 3 days` |
| ISO date | Due date | `2025-04-10`, `10/04` |
| `#tag` | Tags | `#backend`, `#review` |
| `@project` | Project ID | `@bigquery` -> `PRJ-bigquery` |
| `PRJ-xxx` | Project ID | `PRJ-bigquery` |
| `->email` | Assignee | `->alice@company.com` |
| `Nh` | Effort | `2.5h`, `1hr` |

Everything else becomes the task **title**.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd+Shift+T` | Toggle Quick Capture window |
| `Enter` | Submit task |
| `Escape` | Hide window |
