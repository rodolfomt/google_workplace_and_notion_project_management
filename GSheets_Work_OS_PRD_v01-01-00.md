  
**GSheets Work OS**  
Product Requirements Document

v1.0  ·  Draft  ·  Abril 2025

| Product | GSheets Work OS |
| :---- | :---- |
| **Version** | 1.0 — Draft |
| **Status** | Under review |
| **Stack** | Google Sheets · Apps Script · Google Tasks · Google Calendar · Notion API · MCP |
| **External MCPs** | Notion MCP · Gmail MCP · Google Calendar MCP (all available) |

# **Summary** {#summary}

---

[Summary](#summary)	

[1\. Overview](#1.-overview)	

[2\. Context and Problem](#2.-context-and-problem)	

[2.1 Central Problem](#2.1-central-problem)	

[2.2 Identified Gaps](#2.2-identified-gaps)	

[3\. Objectives and Success Metrics](#3.-objectives-and-success-metrics)	

[3.1 Objectives](#3.1-objectives)	

[3.2 Success Metrics](#3.2-success-metrics)	

[4\. People](#4.-people)	

[4.1 Power User — Data Engineer](#4.1-power-user-—-data-engineer)	

[4.2 Collaborators — Mixed Teams](#4.2-collaborators-—-mixed-teams)	

[4.3 AI Agent — Daily Agent](#4.3-ai-agent-—-daily-agent)	

[5\. System Architecture](#5.-system-architecture)	

[6\. Functional Requirements by Module](#6.-functional-requirements-by-module)	

[M1 — Google Sheets Board (Interface Principal)](#m1-—-google-sheets-board-\(interface-principal\))	

[M2 — Sync Engine (Apps Script)](#m2-—-sync-engine-\(apps-script\))	

[M3 — Notion Poller (Apps Script)](#m3-—-notion-poller-\(apps-script\))	

[M4 — Workflow Engine (Apps Script)](#m4-—-workflow-engine-\(apps-script\))	

[M5 — HtmlService (Rich UI Layer)](#m5-—-htmlservice-\(rich-ui-layer\))	

[M6 — Google Tasks \+ Google Calendar](#m6-—-google-tasks-+-google-calendar)	

[7\. MCP Layer — Integration with AI Agents](#7.-mcp-layer-—-integration-with-ai-agents)	

[7.1 MCP Server Architecture](#7.1-mcp-server-architecture)	

[7.2 MCP Tools Catalog](#7.2-mcp-tools-catalog)	

[7.2.1 Tools de Board](#7.2.1-tools-de-board)	

[7.2.2 Tools de Notion](#7.2.2-tools-de-notion)	

[7.2.3 Calendar Tools and Time Context](#7.2.3-calendar-tools-and-time-context)	

[7.2.4 Notification and Output Tools](#7.2.4-notification-and-output-tools)	

[7.3 Daily Agent Protocol](#7.3-daily-agent-protocol)	

[7.3.1 Morning Daily — 07:30](#7.3.1-morning-daily-—-07:30)	

[7.3.2 EOD Daily — 18:00](#7.3.2-eod-daily-—-18:00)	

[7.3.3 Schema DailyBriefing](#7.3.3-schema-dailybriefing)	

[7.4 Connection Points with External MCPs](#7.4-connection-points-with-external-mcps)	

[7.5 System Prompt do Daily Agent (Template)](#7.5-system-prompt-do-daily-agent-\(template\))	

[8\. Non-Functional Requirements](#8.-non-functional-requirements)	

[9\. Data Model](#9.-data-model)	

[9.1 Task Scheme (Board Line)](#9.1-task-scheme-\(board-line\))	

[10\. Security and Access Control](#10.-security-and-access-control)	

[11\. Phases and Milestones](#11.-phases-and-milestones)	

[12\. Risks and Mitigations](#12.-risks-and-mitigations)	

[13\. Glossary](#13.-glossary)	

# **1\. Overview** {#1.-overview}

---

GSheets Work OS is a task and project management system built entirely within the Google ecosystem, without dependence on external SaaS for the central work plan. It replicates the core functionalities of Monday.com — tabular board, multiple views, workflow automations, work front collaboration — using Google Sheets as the primary interface, Apps Script for orchestration, Google Tasks as a multi-device sync layer, and Notion as an asset and documentation repository.

The core value proposition: speed of capture, spreadsheet editing with familiar shortcuts, persistence within the Google ecosystem (no separate billing, no vendor lock-in), and extensibility via Apps Script \+ REST APIs. The MCP (Model Context Protocol) layer enables AI agents to autonomously perform daily planning rituals — "dailies" — collecting board state, prioritizing tasks, posting standups, and rescheduling items without human intervention.

# **2\. Context and Problem** {#2.-context-and-problem}

## ---

**2.1 Central Problem** {#2.1-central-problem}

Existing project management tools (ClickUp, Monday.com, Asana) are expensive to scale, have a steep adoption curve for mixed teams (technical \+ non-technical), and don't natively integrate with Google Workspace as a first-class solution. Lightweight tools (Todoist, TickTick) don't offer tabular editing, Gantt charts, or deep collaboration.

Google Sheets is the most universally adopted tool in work environments. Building the management system on an already familiar interface eliminates the adoption curve and keeps data within Google Drive (already covered by the existing Workspace plan).

## **2.2 Identified Gaps** {#2.2-identified-gaps}

* Sheets doesn't have native sync with Google Tasks → agents and mobile devices are left without access to the board.  
* Notion stores design assets and comments, but does not connect to execution tasks.  
* No workflow automations (notify assignee, escalate delays) and no custom Apps Script.  
* Daily rituals are manual and consume approximately 20 minutes of cognitive work per day.  
* No rich interface for custom fields within Sheets (dropdowns, detail modals)

# **3\. Objectives and Success Metrics** {#3.-objectives-and-success-metrics}

## ---

**3.1 Objectives** {#3.1-objectives}

1. Eliminate dependence on external SaaS for project management without losing core Monday.com functionality.  
2. Reduce new task capture time to \< 5 seconds via global shortcut or natural language.  
3. Automatic status synchronization between Sheets (desktop), Google Tasks (mobile), and Google Calendar (deadlines).  
4. Connect comments and citations from Notion as traceable review tasks on the board.  
5. Enable AI agents via MCP to perform daily rituals without human intervention.

## **3.2 Success Metrics** {#3.2-success-metrics}

| Metric | Baseline | 90-day goal |
| ----- | ----- | ----- |
| Average task capture time | \~45 s | \< 5 s via global shortcut |
| Tasks synced with Google Tasks | 0 % | 100 % das tasks com due date |
| Notion comments without traceable review task | \~100 % | \< 5% (in \< 10 min of comment) |
| Time spent on daily manual | \~20 min/day | \< 3 min (agent output review) |

# **4\. People** {#4.-people}

## ---

**4.1 Power User — Data Engineer** {#4.1-power-user-—-data-engineer}

Primary user and system builder. Works with BigQuery, Python, Cursor, and Claude Code. Needs to capture tasks at the speed of thought while programming, manage technical aspects (pipelines, platform evaluations, tooling), and personal context within the same interface. Comfortable with Apps Script and REST APIs. Tolerates complex setup if the system is very quick to use on a daily basis.

Pain points: switching between tools during code flow interrupts concentration; Notion has the assets but not the tasks; mobile (Android) needs tasks with reminders for items outside the computer.

## **4.2 Collaborators — Mixed Teams** {#4.2-collaborators-—-mixed-teams}

They receive assigned tasks, update statuses, and provide comments. They need a familiar interface (spreadsheet) with no learning curve. They don't interact directly with Apps Script or MCP. They need to receive notifications via email or Google Chat when a task is assigned or overdue.

## **4.3 AI Agent — Daily Agent** {#4.3-ai-agent-—-daily-agent}

Non-human persona that operates via MCP. Performs morning and evening rituals: collects board status, identifies delays, generates structured briefings, posts stand-ups, updates priorities. Operates with read and write permissions limited to the user's scope. Does not create projects or delete tasks.

# **5\. System Architecture** {#5.-system-architecture}

---

The complete information flow diagram is available in the architecture.mermaid file included with this document. The table below summarizes the six layers of the system.

| Layer | Technology | Responsibility |
| ----- | ----- | ----- |
| **Interface** | Google Sheets \+ HtmlService | Main board, tabular editing, rich views (kanban, charts), task modals |
| **Orchestration** | Apps Script | Triggers, Sync Engine, Notion Poller, Workflow Engine, PropertiesService |
| **Sync Mobile** | Google Tasks API v1 | Task lists by project, completion tracking, reminders push on chellphone |
| **Calendar** | Google Calendar API v3 | Deadline events, time blocks, team calendar sharing |
| **Assets & Docs** | Notion API | Pages, databases, comments, citations — polling read-only via Apps Script |
| **AI Agents** | MCP Server (AS endpoint) | Standardized interface for agents to perform daily tasks and interact with the board via MCP tools. |

# **6\. Functional Requirements by Module** {#6.-functional-requirements-by-module}

---

Priorities: P0 \= blocking for MVP · P1 \= required for v1.0 · P2 \= next release

## **M1 — Google Sheets Board (Interface Principal)** {#m1-—-google-sheets-board-(interface-principal)}

| ID | Description | At | Acceptance Criteria |
| ----- | ----- | :---: | ----- |
| **M1-01** | Fixed column schema: ID, Title, Project, Epic, Parent Task, Status, Assignee, Priority, Start Date, Due Date, Scheduled Date, Effort (h), Tags, Notion Link. Separate "Projects" and "Epics" tabs with their own schemas (§9.1, §9.2). | **P0** | All columns in the "Board" tab; data validation (dropdown) for Status, Priority, Project, and Epic. Projects and Epics tabs created with computed columns. |
| **M1-02** | Quick capture line at the top of the board with natural language parsing to automatically fill in fields. | **P0** | Typing "review PR tomorrow P1" creates a task with the correct title, due date, and priority via Apps Script. |
| **M1-03** | Global shortcut via **Quick Capture** — a Tauri v2 desktop mini-app (~15 MB, system tray) activated by `Cmd/Ctrl+Shift+T` from any screen. Two-tiered NLP: **Tier 1** (local, deterministic regex parser in TypeScript, ~0 ms) extracts priority, date, tags, project, assignee, and effort from structured input; **Tier 2** (agent-assisted, `board_parse_and_create_task` MCP tool calling Gemini, ~2–5 s) handles ambiguous natural language when Tier 1 confidence < 0.6. See `quick-capture/` directory for implementation. | **P1** | Shortcut opens floating window in < 500 ms; Tier 1 task creation completes in < 2 s; Tier 2 completes in < 5 s; window hides automatically after confirmation. |
| **M1-04** | Filters and sorting by any column without altering the data structure. | **P0** | Using native Sheets filters does not impact Apps Script sync. |
| **M1-05** | Kanban view via HtmlService sidebar grouped by Status with draggable cards. | **P1** | Drag end call google.script.run.updateTaskStatus(rowId, newStatus); updates in \< 2 s |
| **M1-06** | View Timeline/Gantt via HtmlService showing Start Date → Due Date by project | **P1** | Toolbars rendered by project; click opens task details; read-only in v1.0 |
| **M1-07** | Bulk edit: select multiple rows and change Status, Assignee, or Priority in batch. | **P0** | Custom menu \> Batch editing or Ctrl+Shift+E; updates field in all selected rows. |
| **M1-08** | Notion Link cells open the document in Notion in a new tab when clicked. | **P1** | Hyperlink automatically generated by Notion Poller when creating a review task. |
| **M1-09** | Changelog tab: every status change records the timestamp, previous field, new value, and user. | **P1** | The \`onEdit\` trigger writes to the "Changelog" tab; maximum 10,000 lines with automatic rotation. |
| **M1-10** | Sharing by front: each project has collaborators with Editor or Commenter permission via Sheets' native range protection. | **P1** | The setup script automatically creates protections when a new project is created. |

## **M2 — Sync Engine (Apps Script)** {#m2-—-sync-engine-(apps-script)}

| ID | Description | At | Acceptance Criteria |
| ----- | ----- | :---: | ----- |
| **M2-01** | Every task with a Due Date on the board must have a corresponding entry in Google Tasks in the project list. | **P0** | Sync within 30 seconds after onEdit; Google Task ID stored in PropertiesService |
| **M2-02** | Changing the status to "Done" on the board marks the task as completed in Google Tasks \= true. | **P0** | The \`onEdit\` trigger detects a change in the \`Status\` column; call to Tasks API v1. |
| **M2-03** | The completed task in the Google Tasks app (mobile) has its status updated to "Done" on the board. | **P0** | Time-trigger every 5 minutes queries the Tasks API and reconciles discrepancies. |
| **M2-04** | Changing the Due Date on the board updates the "due" field in the corresponding Google Task. | **P0** | Delta sync: verifies field hashes before patching the API to avoid unnecessary calls. |
| **M2-05** | Creating a new task on the board automatically creates an entry in Google Tasks. | **P0** | onEdit detects a new row; creates a task and persists the taskId ↔ rowId mapping in the PropertiesService. |
| **M2-06** | Deleting a task (status "Cancelled") archives (does not delete) it in Google Tasks. | **P1** | Soft delete: Google Task receives hidden=true; do not delete to preserve history. |
| **M2-07** | Due Date of task creates event in Google Calendar as "deadline" all-day | **P1** | Event created with colorId by priority: red=P0, yellow=P1, blue=P2 |
| **M2-08** | Sync conflicts (both sides alternating between two polls) follow this rule: Sheets wins. | **P0** | Conflict recorded in the Changelog; Sheets is always the source of truth. |

## **M3 — Notion Poller (Apps Script)** {#m3-—-notion-poller-(apps-script)}

| ID | Description | At | Acceptance Criteria |
| ----- | ----- | :---: | ----- |
| **M3-01** | Every 10 minutes, retrieve new comments from monitored Notion pages via GET /comments. | **P0** | Configurable list of page\_ids in PropertiesService; cursor stored to avoid reprocessing. |
| **M3-02** | Every new comment generates a task on the board: "Review comment: \[truncated text\] — \[page title\]" with the Notion Link filled in. | **P0** | Task created with Priority=P1, Status=To Do, Scheduled Date=today |
| **M3-03** | A new @mention or citation on monitored pages generates the task: "Check reference in \[page title\]" | **P1** | Parsing the mention block type via the Notion Blocks API; do not duplicate if mention has already been processed. |
| **M3-04** | Review tasks that have already been created are not duplicated if the commentId already has an entry on the board. | **P0** | Hash of the commentId stored in PropertiesService; skip if it already exists. |
| **M3-05** | Configuration interface via HtmlService to add/remove monitored page\_ids. | **P1** | List of pages with toggle on/off; persists in PropertiesService |

## **M4 — Workflow Engine (Apps Script)** {#m4-—-workflow-engine-(apps-script)}

| ID | Description | At | Acceptance Criteria |
| ----- | ----- | :---: | ----- |
| **M4-01** | When Status changes to any value, notify the Assignee by email with context for the change. | **P1** | MailApp.sendEmail() with a standardized HTML template; user opt-out in PropertiesService |
| **M4-02** | Tasks with a past due date and a status of \!= Done are automatically marked as "Overdue". | **P0** | Daily time-trigger at 8 AM; adds "overdue" tag and sends alert to Assignee and project owner. |
| **M4-03** | Daily digest at 8 AM: tasks of the day, overdue, and pending Notion review tasks. | **P1** | MailApp with formatted HTML; maximum 10 tasks per category. |
| **M4-04** | Automatic posting to Google Chat when Status changes to "Done" in tasks P0 | **P2** | Google Chat webhook configurable per project; payload with task title and link to the board. |
| **M4-05** | Approval workflow: task in "Awaiting Approval" sends an email to the approver with a one-click link. | **P2** | A link generated by Apps Script that, when clicked, changes the Status to "Approved" via a doGet handler. |

## **M5 — HtmlService (Rich UI Layer)** {#m5-—-htmlservice-(rich-ui-layer)}

| ID | Description | At | Acceptance Criteria |
| ----- | ----- | :---: | ----- |
| **M5-01** | Task detail sidebar: opens when clicking on the Title cell; shows all fields, status history, and Notion link. | **P1** | google.script.run for reading/writing; SpreadsheetApp.getUi().showSidebar() |
| **M5-02** | Kanban View: sidebar showing cards grouped by Status with drag-to-update. | **P1** | Drag end calls google.script.run.updateTaskStatus(); updates Sheets in real time. |
| **M5-03** | Gantt View/Timeline: bars per project with horizontal panning by month. | **P1** | SVG/Canvas inline; read-only na v1.0 |
| **M5-04** | Quick modal creation with NLP: a single text field that Apps Script parses to populate the fields. | **P0** | Ctrl+Shift+N opens modal; Apps Script returns parsed fields before creating the task. |
| **M5-05** | System settings sidebar: projects, monitored Notion pages, notification preferences | **P1** | Read/write via google.script.run; persists in PropertiesService |
| **M5-06** | Metrics dashboard: tasks by status, weekly velocity, overdue rate | **P2** | Charts.js or Google Charts in HtmlService with board data |

## **M6 — Google Tasks \+ Google Calendar** {#m6-—-google-tasks-+-google-calendar}

| ID | Description | At | Acceptance Criteria |
| ----- | ----- | :---: | ----- |
| **M6-01** | A Google Tasks list for each active project on the board; list name \= project name. | **P0** | Script de setup cria lists; mapping project\_name ↔ tasklist\_id em PropertiesService |
| **M6-02** | Tasks with a Due Date receive a reminder in Google Tasks 1 day beforehand. | **P1** | The Tasks API field generates push notifications in the Google Tasks mobile app. |
| **M6-03** | Tasks completed on mobile are synced to the board in less than 10 minutes. | **P0** | Time-trigger a cada 5 min; PATCH no Sheets via Sheets API |
| **M6-04** | Due Date for task P0 creates an all-day event in red on the Assignee's Google Calendar. | **P1** | Calendar API v3 insertEvent(); event has a link to a board row in the description field. |
| **M6-05** | Google Task Notes contain a link to the board row and a link to the related Notion page. | **P1** | Notes filled in at the time the task was created by the Sync Engine. |

# **7\. MCP Layer — Integration with AI Agents** {#7.-mcp-layer-—-integration-with-ai-agents}

---

The MCP (Model Context Protocol) layer exposes GSheets Work OS as a set of tools consumable by AI agents. This allows an agent (Claude, GPT-4o, or another) to execute automated planning rituals—the "dailies"—and query or update the board conversationally without the user needing to open Sheets.

**Design principle:** do not reinvent the wheel. Mature MCP servers already exist for Notion, Google Calendar, Google Tasks, and Gmail. The custom Apps Script MCP is scoped exclusively to board business logic (projects, epics, tasks, sub-tasks) — the data layer that only this system understands. Everything else is delegated to external MCPs.

## **7.1 MCP Server Architecture** {#7.1-mcp-server-architecture}

The agent connects to **two tiers** of MCP servers simultaneously:

**Tier 1 — Custom Board MCP (built in this project):** An Apps Script `doPost(e)` endpoint implementing JSON-RPC 2.0. Responsible exclusively for board operations: reading/writing projects, epics, tasks, and sub-tasks in the Sheets data model. This is the only tier that requires custom development.

**Tier 2 — External MCPs (reused, not built):** Established MCP servers for Notion, Google Calendar, Google Tasks, and Gmail. The agent calls these directly; no proxy or wrapper is needed.

| Component | Technology | Role |
| ----- | ----- | ----- |
| **Board MCP Endpoint** | Apps Script doPost(e) | Receives JSON-RPC 2.0 calls; validates HMAC-SHA256; routes to board handlers. Scope: projects, epics, tasks only. |
| **Tool Router** | Function dispatch table | Maps tool\_name → Apps Script function; returns structured JSON. |
| **Auth** | HMAC-SHA256 shared secret | Secret stored in PropertiesService; validated on each call; monthly rotation. |
| **Transport** | HTTPS (Apps Script URL) | Public endpoint protected by HMAC; rate limit: 60 calls/min via LockService. |
| **Notion MCP** | `@notionhq/notion-mcp-server` (remote) | Official Notion-maintained MCP. Used directly by the agent for page reads, comment retrieval, and search. Not proxied through Apps Script. |
| **Google Workspace MCP** | `taylorwilsdon/google_workspace_mcp` | Community MCP (2 k★, MIT, PyPI: `workspace-mcp`) covering Calendar, Tasks, Gmail, Drive, Docs, Sheets under one OAuth 2.1 server. Used directly by the agent. |

## **7.2 MCP Tools Catalog** {#7.2-mcp-tools-catalog}

All tools follow the standard MCP schema: name, description, inputSchema (JSON Schema), and return a structured JSON object. Complete schemas are published in /schema on the MCP endpoint.

### **7.2.1 Tools de Board** {#7.2.1-tools-de-board}

| Tool ID | Description | Main Parameters | Return |
| ----- | ----- | ----- | ----- |
| **board\_list\_projects** | List of active projects with task count by status, completion %, and deadline. | { active\_only?: boolean } | { projects: \[{ id, name, status, responsible, deadline, task\_counts, completion\_pct }\] } |
| **board\_get\_project** | Returns full project details, its epics, and tasks. | { project\_id: string, include\_subtasks?: boolean } | { project: Project, epics: Epic\[\], tasks: Task\[\] } |
| **board\_create\_project** | Create a new project in the Projects tab. | { name, description?, goal?, responsible, deadline?, priority?, team?: string\[\] } | { project\_id } |
| **board\_update\_project** | Update fields in an existing project. | { project\_id, fields: Partial\<Project\> } | { success, updated\_fields: string\[\] } |
| **board\_list\_epics** | List epics for a project with progress info. | { project\_id: string, status\_filter?: string } | { epics: \[{ epic\_id, title, status, completion\_pct, total\_tasks }\] } |
| **board\_get\_epic** | Returns epic details and all its tasks. | { epic\_id: string, include\_subtasks?: boolean } | { epic: Epic, tasks: Task\[\] } |
| **board\_create\_epic** | Create a new epic under a project. | { title, project\_id, description?, responsible?, target\_date?, priority? } | { epic\_id } |
| **board\_update\_epic** | Update fields in an existing epic. | { epic\_id, fields: Partial\<Epic\> } | { success, updated\_fields: string\[\] } |
| **board\_get\_my\_tasks** | Tasks assigned to a user with optional filters. | { assignee, status\_filter?, due\_filter?: "today"\|"week"\|"overdue", include\_subtasks?: boolean } | { tasks: Task\[\] } |
| **board\_get\_task** | Returns a single task by ID with full details including sub-tasks. | { task\_id: string, include\_subtasks?: boolean } | { task: Task, subtasks?: Task\[\] } |
| **board\_search\_tasks** | Free-text search across task titles, tags, and descriptions. Enables IDE/coworker agents to find tasks by context (e.g., "sync engine") without needing to know IDs. | { query: string, project\_id?: string, status\_filter?: string, limit?: number } | { tasks: Task\[\], count: number } |
| **board\_get\_overdue** | Tasks with a due date in the past and a status of \!= Done | { assignee\_filter?: string } | { tasks: Task\[\], count: number } |
| **board\_create\_task** | Create a new task on the board and sync it with Google Tasks. | { title, project\_id, epic\_id?, parent\_task\_id?, assignee?, due\_date?, priority?, scheduled\_date?, notion\_link? } | { task\_id, row\_id, gtask\_id } |
| **board\_create\_follow\_up** | Creates one or more successor tasks linked to a completed or in-progress task. Used by IDE agents to spawn review, testing, or deployment tasks after finishing implementation. | { source\_task\_id: string, follow\_ups: \[{ title, assignee?, priority?, due\_date?, relationship: "review"\|"test"\|"deploy"\|"alternative"\|"continuation" }\] } | { created: \[{ task\_id, title, relationship }\] } |
| **board\_update\_task** | Updates fields in an existing task. | { task\_id, fields: Partial\<Task\> } | { success, updated\_fields: string\[\] } |
| **board\_complete\_task** | Mark task as Done and sync with Google Tasks. | { task\_id } | { success, completed\_at } |
| **board\_get\_subtasks** | Get all sub-tasks for a given parent task. | { parent\_task\_id: string } | { subtasks: Task\[\], count: number } |
| **board\_bulk\_reschedule** | Reschedule multiple tasks at once. | { task\_ids: string\[\], new\_scheduled\_date: date } | { updated\_count, errors: \[\] } |
| **board\_parse\_and\_create\_task** | Tier 2 NLP endpoint for Quick Capture. Receives raw natural-language text, calls an LLM (Gemini via UrlFetchApp) to parse it into structured fields, then creates the task. Used when the local Tier 1 parser's confidence is below threshold. | { raw\_text: string, source?: string } | { task\_id, title, parsed\_fields: Partial\<Task\>, confidence: number } |

### **7.2.2 External MCP — Notion** {#7.2.2-external-mcp-notion}

**Server:** `@notionhq/notion-mcp-server` — official, Notion-maintained (makenotion org). Remote hosted version at `https://mcp.notion.com/mcp` is the recommended path (OAuth, no token management). Local npm package (`v2.2.1`) available as fallback.

The agent uses Notion MCP tools directly for all read and comment operations. The Apps Script **Notion Poller (M3)** remains responsible for the write side: translating Notion comments into board tasks (project-specific logic that belongs in Apps Script, not in the agent).

| Notion MCP Tool | Used for in Daily Protocol |
| ----- | ----- |
| `retrieve-a-comment` | Fetch new comments from monitored pages (replaces custom notion\_get\_pending\_reviews) |
| `retrieve-a-page` | Get page metadata and last-edited timestamp for agent context |
| `get-block-children` | Read page body for summary context (replaces custom notion\_get\_page\_summary) |
| `post-search` | Search for pages/databases to identify active project documentation |
| `query-data-source` | Query Notion databases when project docs are structured as databases |
| `create-a-comment` | Post agent-generated notes back to Notion pages when needed |

> **Setup requirement:** the Notion integration must be explicitly granted access to each page/database via Notion's integration settings. Workspace-wide access is not automatic.

### **7.2.3 External MCP — Google Workspace (Calendar, Tasks, Gmail)** {#7.2.3-external-mcp-google-workspace}

**Server:** `taylorwilsdon/google_workspace_mcp` — community-maintained (MIT, PyPI: `workspace-mcp`, 2 k★). Covers 12 Google Workspace services under a single OAuth 2.1 server. This replaces all custom calendar, tasks, and notification tools that would otherwise have been implemented in the Board MCP.

> **Alternative:** `google/mcp` (Google's own umbrella repo, Apache 2.0, 3.5 k★) exposes a remote Workspace MCP at `https://workspace-developer.goog/mcp` but carries a "not an officially supported Google product" disclaimer and is primarily demonstration-oriented. Monitor for production readiness — if it matures, prefer it over the community option.

**Google Tasks tools used:**

| Tool | Used for in Daily Protocol |
| ----- | ----- |
| `list_tasks` | Fetch tasks completed since a timestamp (replaces custom gtasks\_get\_completions) |
| `manage_task` | Mark a task complete in Google Tasks when the agent calls board\_complete\_task |
| `list_task_lists` | Enumerate project task lists |

**Google Calendar tools used:**

| Tool | Used for in Daily Protocol |
| ----- | ----- |
| `list_events` | Get today's calendar events and free blocks (replaces custom calendar\_get\_today) |
| `create_event` | Create a focus time block for a task (replaces custom calendar\_create\_timeblock) |
| `list_events` (date range) | Fetch deadlines in the next N days (replaces custom calendar\_get\_deadlines) |

**Gmail tools used:**

| Tool | Used for in Daily Protocol |
| ----- | ----- |
| `search_emails` | Find emails requiring action that should become tasks |
| `send_email` | Send the daily digest to the user (replaces custom notify\_send\_digest) |
| `send_email` | Send a direct message to a team member (replaces custom notify\_send\_dm) |

> **Note on Google Chat standup posts:** `taylorwilsdon/google_workspace_mcp` does not currently cover Google Chat webhooks. The `notify_post_standup` call remains in the Board MCP as a thin wrapper around the Google Chat Incoming Webhook URL stored in PropertiesService.

### **7.2.4 Board MCP — Standup Output** {#7.2.4-board-mcp-standup}

This is the only notification tool that remains in the custom Board MCP, because Google Chat is not covered by the external Workspace MCP.

| Tool ID | Description | Main Parameters | Return |
| ----- | ----- | ----- | ----- |
| **notify\_post\_standup** | Post a formatted standup message on Google Chat via Incoming Webhook. | { channel\_webhook\_key: string, briefing: DailyBriefing } | { success, message\_url? } |

## **7.3 Daily Agent Protocol** {#7.3-daily-agent-protocol}

The Daily Agent operates at two fixed times per day. It calls MCP tools sequentially, synthesizes a structured Daily Briefing, updates the board, and notifies the team. Below are the detailed flows of each ritual.

### **7.3.1 Morning Daily — 07:30** {#7.3.1-morning-daily-—-07:30}

Objective: to generate clarity about the day, identify risks, and post an opening stand-up routine.

| \# | Tool / Action | MCP Server | Objective and Output |
| :---: | ----- | ----- | ----- |
| **1** | `list_tasks(completed=true, since=yesterday_9am)` | Google Workspace MCP | List what was actually completed yesterday → "accomplished" section of the standup. |
| **2** | `board_get_my_tasks(due_filter="today")` | Board MCP (custom) | Tasks scheduled for today → basis for the "focus\_today" section. |
| **3** | `board_get_overdue(assignee=user)` | Board MCP (custom) | Overdue tasks → flag in "blockers"; identify tasks overdue 2+ days in a row. |
| **4** | `list_events(date=today, user_email)` | Google Workspace MCP | Meetings and time blocks that reduce availability → adjust suggested top 3 tasks based on available hours. |
| **5** | `list_events(date_range=next_3_days)` | Google Workspace MCP | Deadlines approaching → raise the priority of corresponding tasks on the board. |
| **6** | `retrieve-a-comment(block_id)` per monitored page | Notion MCP | New comments on Notion pages awaiting review → include in the day if critical. |
| **7** | **\[Agent Synthesis\]** | — | Generate DailyBriefing: accomplished / focus\_today (top 3) / overdue / notion\_reviews / blockers / narrative. |
| **8** | `board_bulk_reschedule()` \[conditional\] | Board MCP (custom) | If overdue tasks exist (non-P0), reschedule for today or tomorrow based on availability from step 4. |
| **9** | `notify_post_standup()` + `send_email(digest)` | Board MCP (standup) + Google Workspace MCP (email) | Post briefing on Google Chat; send digest email to the user. |

### **7.3.2 EOD Daily — 18:00** {#7.3.2-eod-daily-—-18:00}

Objective: to track progress, calculate completion rate, plan carry-overs, and generate tomorrow's preview.

| \# | Tool / Action | MCP Server | Objective and Output |
| :---: | ----- | ----- | ----- |
| **1** | `board_get_my_tasks(due_filter="today")` | Board MCP (custom) | Check what should have been done today. |
| **2** | `list_tasks(completed=true, since=today_9am)` | Google Workspace MCP | What was effectively completed today (source of truth for completion). |
| **3** | `board_get_overdue()` | Board MCP (custom) | Carry-overs and tasks from previous days still unresolved. |
| **4** | **\[Agent Synthesis\]** | — | Calculate completion rate; detect patterns (e.g., tasks of type X always delayed). |
| **5** | `board_bulk_reschedule(uncompleted_today, tomorrow)` | Board MCP (custom) | Automatically reschedule incomplete tasks (max 10, non-P0 only). |
| **6** | `board_get_my_tasks(due_filter="week")` | Board MCP (custom) | Generate preview of the next 2 business days. |
| **7** | `notify_post_standup(eod_summary)` + `send_email(tomorrow_preview)` | Board MCP (standup) + Google Workspace MCP (email) | Post EOD summary to Google Chat; send tomorrow's preview by email. |

### **7.3.3 Schema DailyBriefing** {#7.3.3-schema-dailybriefing}

type DailyBriefing \= {

  date:                 string;           // ISO date

  type:                 "morning" | "eod";

accomplished: Task\[\]; // completed yesterday (morning) or today (eod)

focus\_today: Task\[\]; // top 3 suggested by the agent

overdue: Task\[\]; // overdue

upcoming\_deadlines: Task\[\]; // next 3 days

  notion\_pending:       ReviewTask\[\];     // "Review X" tasks pendentes

calendar\_events: CalEvent\[\]; // meetings of the day

blockers: string\[\]; // generated by agent parsing

completion\_rate?: number; // only EOD: % of the day completed

narrative: string; // paragraph in Brazilian Portuguese generated by the agent

}

## **7.4 MCP Server Registry** {#7.4-mcp-server-registry}

Summary of all MCP servers the Daily Agent connects to, with authoritative source references.

| MCP Server | Source / Endpoint | Maintainer | Status | Scope in this project |
| ----- | ----- | ----- | ----- | ----- |
| **Notion MCP** | Remote: `https://mcp.notion.com/mcp` (OAuth) · Local: `npx @notionhq/notion-mcp-server` · Repo: `github.com/makenotion/notion-mcp-server` | Notion (official) | ✅ Production — remote is actively maintained; local package v2.2.1 in maintenance mode | Read Notion pages, comments, and databases; post comments. Does NOT create board tasks — that's the Notion Poller's job. |
| **Google Workspace MCP** | Local: `pip install workspace-mcp` · Repo: `github.com/taylorwilsdon/google_workspace_mcp` · Alt: `https://workspace-developer.goog/mcp` (Google, unofficial) | Community (Taylor Wilsdon, 2 k★) | ✅ Stable, actively maintained. Monitor `google/mcp` for official replacement. | Calendar (events, time blocks), Tasks (list, complete), Gmail (send digest, search emails). Single OAuth 2.1 setup for all Google services. |
| **Board MCP (custom)** | `https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec` | This project (Apps Script) | 🔧 To be implemented (v1.5) | All board operations: projects, epics, tasks, sub-tasks, bulk reschedule, standup post to Google Chat. |

## **7.5 System Prompt do Daily Agent (Template)** {#7.5-system-prompt-do-daily-agent-(template)}

The agent running the daily task should receive the system prompt below. It defines the role, tone, permission scope, and security restrictions:

You are the Daily Agent for GSheets Work OS. Your role is to perform the ritual.

daily planning by the user using the available tools.

PERMISSIONS:

\- Reading: complete board, Google Tasks, monitored Notion pages, Calendar

\- Escrita restrita: board\_update\_task, board\_complete\_task, board\_bulk\_reschedule

\- Forbidden: creating projects, deleting tasks, changing assignees without confirmation.

BUSINESS RULES:

Never reschedule P0 tasks without explicit user confirmation.

\- Bulk reschedule limit: maximum 10 tasks per execution

\- Reschedule overdue tasks for a maximum of 2 days in the future.

\- Suggest exactly 3 focus tasks (focus\_today) per day.

If the same task is overdue for the 3rd or more day, flag it as a blocker.

FORMATO DO STANDUP (notify\_post\_standup):

✅ Yesterday | \[N tasks\] completed

🎯 Today | \[top 3 tasks with priority \+ deadline\]

⚠️ Blockers | \[list if available\]

📋 Notion | \[N pending revisions\]

Narrative: brief, in Brazilian Portuguese, direct. Maximum 2 sentences.

## **7.6 Multi-Agent Access Model** {#7.6-multi-agent-access-model}

The Board MCP is designed to be consumed not only by the Daily Agent but by any MCP-compatible agent — IDE coding agents (Claude Code, Cursor, Windsurf), coworker agents, CI/CD bots, or custom automation scripts. To support this safely, the system implements agent identity and role-based permissions at the MCP layer.

### **7.6.1 Agent Authentication** {#7.6.1-agent-authentication}

Each agent receives a unique `agent_id` and its own HMAC secret, both stored in PropertiesService:

| Property Key | Example | Notes |
| ----- | ----- | ----- |
| `agent_secret_daily` | `hmac-sha256-secret-daily-...` | Daily Agent (morning + EOD rituals) |
| `agent_secret_ide_alice` | `hmac-sha256-secret-ide-alice-...` | Alice's IDE agent (Claude Code / Cursor) |
| `agent_secret_ci` | `hmac-sha256-secret-ci-...` | CI/CD pipeline bot |

Every MCP request must include `agent_id` in the JSON-RPC params. The endpoint validates the HMAC using the agent-specific secret. This allows:
- **Per-agent audit trail** — every change recorded in Changelog includes the agent\_id.
- **Per-agent revocation** — disable one agent without affecting others.
- **Per-agent rate limiting** — prevent a runaway agent from exhausting the Apps Script quota.

### **7.6.2 Agent Roles and Permission Scopes** {#7.6.2-agent-roles}

Permissions are enforced server-side by the Apps Script Tool Router, not by prompt instructions alone. Each role defines which MCP tools are allowed:

| Role | Intended Consumer | Allowed Tools | Denied Tools |
| ----- | ----- | ----- | ----- |
| **daily** | Daily Agent (scheduled morning + EOD) | `board_get_my_tasks`, `board_get_overdue`, `board_get_task`, `board_search_tasks`, `board_complete_task`, `board_update_task` (status, scheduled\_date, priority only), `board_bulk_reschedule`, `board_get_subtasks`, `board_get_project`, `board_list_projects`, `board_list_epics`, `board_get_epic`, `notify_post_standup` | `board_create_project`, `board_update_project`, `board_create_epic`, `board_update_epic`, `board_create_task` (requires `ide` or `admin`), `board_create_follow_up` |
| **ide** | IDE coding agents (Claude Code, Cursor, Windsurf, etc.) | `board_get_task`, `board_search_tasks`, `board_get_my_tasks`, `board_get_project`, `board_get_epic`, `board_get_subtasks`, `board_complete_task`, `board_update_task`, `board_create_task`, `board_create_follow_up` | `board_create_project`, `board_create_epic`, `board_update_project`, `board_update_epic`, `board_bulk_reschedule`, `notify_post_standup` |
| **admin** | Human user (via direct MCP client or global shortcut) | All tools | None |

> **Role assignment:** the `agent_id → role` mapping is stored in PropertiesService as `agent_role_{agent_id}`. Default role for unrecognized agent\_ids: **denied** (fail-closed).

### **7.6.3 IDE / Coworker Agent Workflow Example** {#7.6.3-ide-agent-workflow}

A typical flow for a Claude Code agent working on a coding task:

```
1. Agent starts a coding session and queries the board:
   → board_search_tasks(query="sync engine", status_filter="In Progress")
   ← { tasks: [{ task_id: "TSK-0042", title: "Implement sync engine", ... }] }

2. Agent works on the implementation, then marks the task done:
   → board_complete_task(task_id="TSK-0042")
   ← { success: true, completed_at: "2025-04-10T16:30:00" }

3. Agent creates follow-up tasks for review and testing:
   → board_create_follow_up(
       source_task_id="TSK-0042",
       follow_ups=[
         { title: "Code review: sync engine", relationship: "review", assignee: "alice@co.com", priority: "P1" },
         { title: "Write integration tests: sync engine", relationship: "test", priority: "P2" },
         { title: "Evaluate alternative: Cloud Functions vs Apps Script triggers", relationship: "alternative", priority: "P2" }
       ]
     )
   ← { created: [
       { task_id: "TSK-0043", title: "Code review: sync engine", relationship: "review" },
       { task_id: "TSK-0044", title: "Write integration tests: sync engine", relationship: "test" },
       { task_id: "TSK-0045", title: "Evaluate alternative: ...", relationship: "alternative" }
     ] }
```

All three actions are logged in the Changelog with the IDE agent's `agent_id`, making it clear that the completion and follow-ups were agent-driven, not human-driven.

### **7.6.4 Changelog Agent Audit Fields** {#7.6.4-changelog-agent-audit}

The Changelog tab (M1-09) is extended with agent-specific columns:

| Field | Type | Example | Notes |
| ----- | ----- | ----- | ----- |
| **source** | enum | agent | `human` (Sheets UI edit) \| `agent` (MCP call) \| `system` (Apps Script trigger) |
| **agent\_id** | string | ide\_alice | Null when source = human. Identifies which agent made the change. |
| **agent\_role** | string | ide | The role under which the agent was operating. |

# **8\. Non-Functional Requirements** {#8.-non-functional-requirements}

---

| Category | Requirement | Specification |
| ----- | ----- | ----- |
| **Performance** | Sync latency | Changes in Sheets reflected in Google Tasks in \< 30 seconds; mobile changes reflected in Sheets in \< 5 minutes. |
| **Performance** | MCP latency | Read tools return in \< 5 seconds; write tools with reconciliation in \< 10 seconds. |
| **Performance** | Board Sheets | Board opens in \< 3 seconds with up to 2,000 active rows; native filters with no added latency from Apps Script. |
| **Reliability** | Quota Apps Script | Apps Script has a limit of 6 minutes per execution and 6 hours per day (Workspace). All triggers must be idempotent and interruptible. |
| **Reliability** | Fault tolerance | External API failure (Notion, Tasks) is logged in the Changelog and retried on the next run without duplicating data; no error visible to the user in Sheets. |
| **Security** | MCP Auth | All calls to the MCP endpoint are validated by HMAC-SHA256; the secret is rotated monthly via an automated script. |
| **Security** | API Keys | Notion API and Google Chat webhook keys are stored only in PropertiesService (server-side); never in Sheets cells or source code. |
| **Maintenance** | Versioning | Apps Script code versioned in Git via clasp; automated deployment by version tag; semantic changelog. |
| **Observability** | Logging | Every trigger execution logs: timestamp, duration, rows affected, errors. See the "SyncLog" tab in Sheets; 30-day retention with automatic rotation. |

# **9\. Data Model** {#9.-data-model}

## ---

**9.1 Project Scheme ("Projects" Tab)** {#9.1-project-scheme}

Each project is a row in a dedicated "Projects" tab in the same Google Sheets workbook. All tasks and epics reference a project via `project_id`.

| Field | Type | Example | Notes |
| ----- | ----- | ----- | ----- |
| **project\_id** | string | PRJ-bigquery | UUID generated by Apps Script (PRJ- prefix); immutable. |
| **name** | string | BigQuery Migration | Required; max 120 characters; unique. |
| **description** | string | Migrate legacy warehouse to BigQuery | Free-text summary of the project scope; max 500 characters. |
| **goal** | string | Reduce query cost by 40% and improve latency to < 2s | Measurable objective or OKR the project targets. |
| **responsible** | email | owner@company.com | Project owner / lead; valid Google Workspace email. |
| **team** | string\[\] | alice@co.com,bob@co.com | CSV of collaborator emails; used for notifications and Sheets range protection (M1-10). |
| **status** | enum | Active | Not Started \| Active \| On Hold \| Completed \| Cancelled |
| **priority** | enum | P1 | P0 (critical) \| P1 (high) \| P2 (normal) \| P3 (low) |
| **start\_date** | date | 2025-04-01 | Planned kick-off date; ISO 8601. |
| **deadline** | date | 2025-06-30 | Target completion date; ISO 8601. Triggers calendar event and overdue alerts. |
| **budget\_h** | number | 320 | Total budgeted effort in hours; compared against sum of task effort\_h for tracking. |
| **category** | string | Engineering | Free-text grouping (e.g., Engineering, Marketing, Operations); used for dashboard filters. |
| **notion\_space\_url** | url | notion.so/space/... | Link to the project's Notion workspace or top-level page for documentation. |
| **notes** | string | Depends on infra team approval | Free-text field for additional context, risks, or dependencies. |
| **created\_at** | datetime | 2025-04-01T09:00:00 | Auto-populated; immutable. |
| **updated\_at** | datetime | 2025-04-15T14:30:00 | Auto-updated on any field change via onEdit trigger. |

**Derived / computed columns (shown in the Projects tab but not editable):**

| Field | Source | Notes |
| ----- | ----- | ----- |
| **total\_tasks** | COUNT of tasks where project\_id matches | Auto-calculated via COUNTIF formula or Apps Script. |
| **completed\_tasks** | COUNT of tasks where project\_id matches AND status = Done | Used to compute completion percentage. |
| **completion\_%** | completed\_tasks / total\_tasks | Displayed as progress bar via conditional formatting. |
| **total\_effort\_h** | SUM of effort\_h for all tasks in the project | Compared against budget\_h for burn tracking. |
| **overdue\_tasks** | COUNT of tasks where due\_date < today AND status ≠ Done | Highlighted in red when > 0. |

---

**9.2 Epic Scheme ("Epics" Tab)** {#9.2-epic-scheme}

An Epic is the middle layer between Projects and Tasks. It groups related tasks into a coherent deliverable or feature within a project. Each epic belongs to exactly one project, and each task may optionally belong to one epic.

| Field | Type | Example | Notes |
| ----- | ----- | ----- | ----- |
| **epic\_id** | string | EPC-0012 | UUID generated by Apps Script (EPC- prefix); immutable. |
| **title** | string | Schema Design & Validation | Required; max 200 characters. |
| **description** | string | Design all BQ tables and validate with stakeholders | Summary of the epic's scope and deliverables; max 500 characters. |
| **project\_id** | string | PRJ-bigquery | FK to the Projects table; required. |
| **responsible** | email | alice@company.com | Epic owner; defaults to the project responsible if not set. |
| **status** | enum | In Progress | Not Started \| In Progress \| Done \| Cancelled |
| **priority** | enum | P1 | P0 (critical) \| P1 (high) \| P2 (normal) \| P3 (low) |
| **start\_date** | date | 2025-04-05 | Planned start date; ISO 8601. |
| **target\_date** | date | 2025-05-15 | Target completion date for the epic; triggers alerts when approaching. |
| **acceptance\_criteria** | string | All 12 tables created, validated by data team, and documented in Notion | Definition of done for the epic; free-text. |
| **tags** | string\[\] | backend,schema | CSV; no spaces; lowercase. |
| **notion\_link** | url | notion.so/page/... | Link to the epic's Notion page for detailed specs or documentation. |
| **sort\_order** | number | 1 | Manual ordering within a project; lower numbers appear first. |
| **created\_at** | datetime | 2025-04-05T10:00:00 | Auto-populated; immutable. |
| **updated\_at** | datetime | 2025-04-20T11:15:00 | Auto-updated on any field change via onEdit trigger. |

**Derived / computed columns:**

| Field | Source | Notes |
| ----- | ----- | ----- |
| **total\_tasks** | COUNT of tasks where epic\_id matches | Auto-calculated. |
| **completed\_tasks** | COUNT of tasks where epic\_id matches AND status = Done | Used to compute epic progress. |
| **completion\_%** | completed\_tasks / total\_tasks | Displayed as progress bar via conditional formatting. |
| **total\_effort\_h** | SUM of effort\_h for all tasks in the epic | Useful for sprint/capacity planning. |

---

**9.3 Task Scheme ("Board" Tab)** {#9.3-task-scheme-(board-line)}

All tasks — including sub-tasks — reside in the same "Board" tab. A task becomes a sub-task when its `parent_task_id` is set. Sub-tasks inherit the project and epic from the parent unless explicitly overridden.

| Field | Type | Example | Notes |
| ----- | ----- | ----- | ----- |
| **task\_id** | string | TSK-0042 | UUID generated by Apps Script; immutable. |
| **title** | string | Review schema BQ | Required; max 200 characters. |
| **project\_id** | string | PRJ-bigquery | FK to the Projects table; required. Inherited from parent if sub-task. |
| **epic\_id** | string | EPC-0012 | FK to the Epics table; optional. Groups tasks under an epic within a project. |
| **parent\_task\_id** | string | TSK-0040 | FK to another task in this same table; null for top-level tasks. When set, the task is a sub-task of the referenced task. Max nesting depth: 1 (sub-tasks cannot have their own sub-tasks). |
| **status** | enum | In Progress | Inbox \| To Do \| In Progress \| Review \| Done \| Cancelled \| Blocked |
| **assignee** | email | user@email.com | Valid Google email address for notifications. |
| **priority** | enum | P1 | P0 (critical) \| P1 (high) \| P2 (normal) \| P3 (low) |
| **due\_date** | date | 2025-04-10 | ISO 8601; triggers sync with Google Tasks and Calendar. |
| **scheduled\_date** | date | 2025-04-07 | "When am I going to work on this?" — different from the due date. |
| **start\_date** | date | 2025-04-05 | Used in Gantt/Timeline view. |
| **effort\_h** | number | 2.5 | Estimate in hours; used in velocity tracking. |
| **tags** | string\[\] | bigquery,review | CSV; no spaces; lowercase. |
| **notion\_link** | url | notion.so/page/... | Populated by Notion Poller; hyperlink in Sheets cell. |
| **follow\_up\_from** | string | TSK-0040 | FK to the predecessor task that originated this follow-up; null if not a follow-up. Set by `board_create_follow_up`. |
| **follow\_up\_type** | enum | review | review \| test \| deploy \| alternative \| continuation; null if not a follow-up. Describes the relationship to the predecessor. |
| **gtask\_id** | string | MDEwOTEx... | ID da Google Task; hidden column in Sheets. |
| **created\_by** | string | ide\_alice | `agent_id` of the agent that created this task, or "human" if created via Sheets UI. Used for audit. |
| **created\_at** | datetime | 2025-04-07T08:30:00 | Auto-populated in the onEdit creation event; immutable. |

**Sub-task behavior rules:**

* A sub-task is any row where `parent_task_id` is not empty.
* Sub-tasks are visually indented in the Board tab using conditional formatting (e.g., title prefixed with "↳" or left-padded).
* When all sub-tasks of a parent are marked "Done", the parent task's status is **not** automatically changed — the user must explicitly mark it as Done (prevents premature closure).
* Filtering by a parent task shows all its sub-tasks; filtering by an epic shows all tasks (including sub-tasks) under that epic.
* Max nesting depth is 1: a sub-task (`parent_task_id` is set) cannot itself be a parent. Apps Script validates this on creation.
* Sub-tasks sync independently to Google Tasks under the same project list as the parent.

**Relationship summary:**

```
Project (1) ──── (N) Epic (1) ──── (N) Task (1) ──── (N) Sub-task
   │                                      │
   └──────────── (N) Task (direct) ───────┘
```

A task can belong directly to a project without an epic (`epic_id` = null). Sub-tasks always reference a parent task via `parent_task_id` and reside in the same Board tab.

# **10\. Security and Access Control** {#10.-security-and-access-control}

* ---

  The Notion API token is stored exclusively in PropertiesService.getScriptProperties(); it is never exposed in Sheets cells or logs.  
* MCP Secret (HMAC-SHA256) rotated monthly; rotation script updates PropertiesService and automatically invalidates old tokens.  
* Native Sheets range protections for system columns (task\_id, gtask\_id, created\_at) — read-only for collaborators  
* Apps Script runs with the owner's identity; Google Workspace service account recommended for production.  
* MCP access logs record: timestamp, tool called, status code, source IP — 90-day retention.  
* Daily Agent operates only with task\_id and non-sensitive fields by default; task content is not sent to LLM without explicit consent.  
* LGPD: Employee data (name, email) stored only in the workspace's Google Drive; no transfer to external systems outside the Google ecosystem and already authorized Notion.

# **11\. Phases and Milestones** {#11.-phases-and-milestones}

---

| Phase | Duration | Key Deliverables | Completion Criteria |
| ----- | ----- | ----- | ----- |
| **MVP v0.1** | 2 weeks | Board schema · Sync Engine (M2) · Quick Capture (M1-01/02/07) · Basic Sync with Google Tasks | Tasks created in Sheets appear in the Google Tasks app in \< 30 seconds; bulk edit functionality |
| **v0.5** | 3 weeks | Notion Poller (M3) · Basic Workflow Engine (M4-01/02/03) · HtmlService detail sidebar (M5-01) | Notion comments generate tasks on the board in \< 10 min; assignment notifications are working. |
| **v1.0** | 2 weeks | Kanban \+ Timeline HtmlService (M5-02/03) · Calendar integration (M6-04) · Daily digest (M4-03) | All views working; digest sent daily; calendar with deadline events. |
| **v1.5 MCP** | 3 weeks | MCP Server (§7.1) · Catálogo completo de tools (§7.2) · Daily Agent Protocol morning \+ EOD (§7.3) | Agent completes morning daily tasks flawlessly for 5 consecutive days; standup posted on Google Chat. |
| **v2.0** | 4 weeks | Metrics dashboard (M5-06) · Approval workflow (M4-05) · Gmail MCP integration for email tasks | Velocity tracking with 4 weeks of data; one-click approvals; important emails automatically become tasks. |

# **12\. Risks and Mitigations** {#12.-risks-and-mitigations}

---

| Risk | Prob. | Impact | Preventive Mitigation | Contingency plan |
| ----- | :---: | :---: | ----- | ----- |
| Apps Script exceeds daily quota (6 hours/day Workspace) | Average | **High** | onEdit fires only for relevant columns; time-trigger consolidated into a function. | Migrate long-running functions to Cloud Run \+ Apps Script as a webhook receiver. |
| Notion API without webhooks → polling latency \> 10 min during peak hours | High | Low | Polling every 5 minutes between 8 AM and 6 PM; every 30 minutes outside of work hours. | Acceptable: Review tasks with a delay of up to 10 minutes are tolerable for the user. |
| Sync conflict: simultaneous editing in Sheets and on mobile. | Low | **Average** | Sheets is a source of truth; the winning rule is documented in onboarding. | Conflict visible in the Changelog; user can manually revert with a restore script. |
| Endpoint MCP exposed publicly → risk of abuse or DDoS attack. | Low | **High** | HMAC required; rate limit of 60 calls/min via LockService; IP whitelist optional. | Disable endpoint via PropertiesService flag without redeploy; revoke secret in \< 1 min |
| Daily Agent reagendando tasks erradas via board\_bulk\_reschedule | Average | **Average** | Prohibit rescheduling of P0 tasks without confirmation; limit of 10 tasks per bulk. | The "DailyLog" tab records all agent activity; the rollback script restores the original scheduled\_date. |

# **13\. Glossary** {#13.-glossary}

---

| Term | Definition |
| ----- | ----- |
| **Apps Script** | Google's server-side scripting platform; executes JavaScript on the Google server and has native access to all Google Workspace APIs without additional OAuth. |
| **Daily / Daily Ritual** | Daily planning ritual: morning daily (7:30 AM) to plan the day and EOD daily (6:00 PM) to record progress and plan for tomorrow. |
| **Delta Sync** | A sync strategy that verifies the hash of relevant fields before making API calls, avoiding unnecessary calls and conflicts. |
| **HtmlService** | Apps Script API for rendering HTML/CSS/JS in sidebars and modals within Google Sheets without serving external pages. |
| **MCP** | Model Context Protocol — Anthropic's open protocol for exposing tools and data to AI agents in a standardized way via JSON-RPC 2.0. |
| **Notion Poller** | Apps Script module that periodically queries the Notion API to detect new comments and citations on monitored pages. |
| **PropertiesService** | Persistent key-value storage for Apps Script; analogous to environment variables; survives redeployments and concurrent executions. |
| **Scheduled Date** | "When will I work on this?" — different from the Due Date. It separates the execution date from the delivery deadline, essential for daily planning. |
| **Source of Truth** | Google Sheets is the authoritative data source. In case of a conflict between Sheets and any other layer, the value from Sheets prevails. |
| **Sync Engine** | Apps Script module that keeps Sheets and Google Tasks synchronized bidirectionally using delta sync and ID mapping persisted in PropertiesService. |
| **Task Stub** | Task automatically created by Notion Poller from a comment; format: "Review comment: \[truncated text\] — \[page name\]" |
| **Time Trigger** | Apps Script trigger executed at fixed intervals (e.g., every 5 minutes); equivalent to cron jobs; basis for Google Tasks and Notion polling. |
| **Tool MCP** | A function exposed by the MCP Server that the agent can call; analogous to a REST endpoint; has input and output schemas defined in JSON Schema. |

*End of document.*