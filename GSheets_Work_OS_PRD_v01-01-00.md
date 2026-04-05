  
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
| **M1-01** | Fixed column schema: ID, Title, Project, Status, Assignee, Priority, Start Date, Due Date, Scheduled Date, Effort (h), Tags, Notion Link | **P0** | All columns in the "Board" tab; data validation (dropdown) for Status and Priority. |
| **M1-02** | Quick capture line at the top of the board with natural language parsing to automatically fill in fields. | **P0** | Typing "review PR tomorrow P1" creates a task with the correct title, due date, and priority via Apps Script. |
| **M1-03** | Global shortcut (Chrome extension / AutoHotKey / Raycast) that opens the task creation modal directly from any screen. | **P1** | Modal opens in \< 500 ms; task created in \< 2 s after submit. |
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

## **7.1 MCP Server Architecture** {#7.1-mcp-server-architecture}

The MCP Server is implemented as an Apps Script (doPost) endpoint that interprets JSON-RPC 2.0 calls in MCP format. Apps Script acts as a proxy for all ecosystem APIs (Sheets, Google Tasks, Calendar, Notion), eliminating the need for external infrastructure.

| Component | Technology | Paper |
| ----- | ----- | ----- |
| **MCP Endpoint** | Apps Script doPost(e) | Receives JSON-RPC 2.0 calls from the agent; validates HMAC-SHA256; routes to the correct handler. |
| **Tool Router** | Function dispatch table | Maps tool\_name to Apps Script function; executes with correct user context; returns structured JSON. |
| **Auth** | HMAC-SHA256 shared secret | Secret stored in PropertiesService; validated on each call; monthly rotation via automated script. |
| **External MCPs** | Notion MCP · Gmail MCP · GCal MCP | The agent connects these MCPs directly for additional context; the GSheets MCP focuses on the board data. |
| **Transport** | HTTPS (Apps Script URL) | Public endpoint protected by HMAC; rate limit: 60 calls/min via LockService; logs in PropertiesService. |

## **7.2 MCP Tools Catalog** {#7.2-mcp-tools-catalog}

All tools follow the standard MCP schema: name, description, inputSchema (JSON Schema), and return a structured JSON object. Complete schemas are published in /schema on the MCP endpoint.

### **7.2.1 Tools de Board** {#7.2.1-tools-de-board}

| Tool ID | Description | Main Parameters | Return |
| ----- | ----- | ----- | ----- |
| **board\_list\_projects** | List of active projects with task count by status. | { active\_only?: boolean } | { projects: \[{ id, name, task\_counts }\] } |
| **board\_get\_project** | Returns details and tasks of a project. | { project\_id: string } | { project, tasks: Task\[\] } |
| **board\_get\_my\_tasks** | Tasks assigned to a user with optional filters. | { assignee, status\_filter?, due\_filter?: "today"|"week"|"overdue" } | { tasks: Task\[\] } |
| **board\_get\_overdue** | Tasks with a due date in the past and a status of \!= Done | { assignee\_filter?: string } | { tasks: Task\[\], count: number } |
| **board\_create\_task** | Create a new task on the board and sync it with Google Tasks. | { title, project\_id, assignee?, due\_date?, priority?, scheduled\_date?, notion\_link? } | { task\_id, row\_id, gtask\_id } |
| **board\_update\_task** | Updates fields in an existing task. | { task\_id, fields: Partial\<Task\> } | { success, updated\_fields: string\[\] } |
| **board\_complete\_task** | Mark task as Done and sync with Google Tasks. | { task\_id } | { success, completed\_at } |
| **board\_bulk\_reschedule** | Reschedule multiple tasks at once. | { task\_ids: string\[\], new\_scheduled\_date: date } | { updated\_count, errors: \[\] } |

### **7.2.2 Tools de Notion** {#7.2.2-tools-de-notion}

| Tool ID | Description | Main Parameters | Return |
| ----- | ----- | ----- | ----- |
| **notion\_get\_pending\_reviews** | Notion comment review tasks not completed. | { since?: timestamp } | { tasks: ReviewTask\[\], count: number } |
| **notion\_get\_recent\_activity** | New comments and quotes on monitored pages | { since: timestamp } | { comments: Comment\[\], citations: Citation\[\] } |
| **notion\_get\_page\_summary** | Summary of a Notion page for agent context | { page\_id: string } | { title, last\_edited, summary\_text, comment\_count } |

### **7.2.3 Calendar Tools and Time Context** {#7.2.3-calendar-tools-and-time-context}

| Tool ID | Description | Main Parameters | Return |
| ----- | ----- | ----- | ----- |
| **calendar\_get\_today** | User's daily events on Google Calendar | { user\_email: string } | { events: CalEvent\[\], has\_free\_blocks: boolean } |
| **calendar\_get\_deadlines** | Tasks with deadlines in the next N days. | { days: number, assignee?: string } | { deadlines: \[{ task, due\_date, days\_until }\] } |
| **gtasks\_get\_completions** | Tasks completed since a timestamp (for yesterday's daily) | { since: timestamp, assignee?: string } | { completed\_tasks: Task\[\], count: number } |
| **calendar\_create\_timeblock** | Create a time block in the calendar to work on a task. | { task\_id, start\_time, duration\_min } | { event\_id, start\_time, calendar\_link } |

### **7.2.4 Notification and Output Tools** {#7.2.4-notification-and-output-tools}

| Tool ID | Description | Main Parameters | Return |
| ----- | ----- | ----- | ----- |
| **notify\_post\_standup** | Post a formatted standup message on Google Chat. | { channel\_webhook: string, briefing: DailyBriefing } | { success, message\_url? } |
| **notify\_send\_digest** | Sends daily digest to the user via email. | { to: string, briefing: DailyBriefing } | { success } |
| **notify\_send\_dm** | Send a direct message via Gmail to a team member. | { to: string, subject: string, body: string } | { success, thread\_id } |

## **7.3 Daily Agent Protocol** {#7.3-daily-agent-protocol}

The Daily Agent operates at two fixed times per day. It calls MCP tools sequentially, synthesizes a structured Daily Briefing, updates the board, and notifies the team. Below are the detailed flows of each ritual.

### **7.3.1 Morning Daily — 07:30** {#7.3.1-morning-daily-—-07:30}

Objective: to generate clarity about the day, identify risks, and post an opening stand-up routine.

| \# | Tool / Action | Objective and Output |
| :---: | ----- | ----- |
| **1** | gtasks\_get\_completions(since=yesterday\_9am) | List what was actually completed yesterday → "completed" section of the standup |
| **2** | board\_get\_my\_tasks(due\_filter="today") | Tasks scheduled for today → based on the "focus\_today" section |
| **3** | board\_get\_overdue(assignee=user) | Overdue tasks → flag them in "blockers"; identify if the same task has been overdue for the 2nd or more day. |
| **4** | calendar\_get\_today(user\_email) | Meetings and block parties that reduce availability → adjust the suggested top 3 tasks based on the available time. |
| **5** | calendar\_get\_deadlines(days=3) | Deadlines approaching → raise the priority of the corresponding tasks. |
| **6** | notion\_get\_pending\_reviews() | Comments on Notion awaiting review → include on the day if critical |
| **7** | **\[Agent Synthesis\]** | Gerar DailyBriefing: accomplished / focus\_today (top 3\) / overdue / notion\_reviews / blockers / narrative |
| **8** | board\_bulk\_reschedule() \[condicional\] | If there are overdue tasks without a Point of Sale (P0), reschedule for today or tomorrow based on availability analysis. |
| **9** | notify\_post\_standup() \+ notify\_send\_digest() | Post the briefing on Google Chat (structured format) and send a digest to the user via email. |

### **7.3.2 EOD Daily — 18:00** {#7.3.2-eod-daily-—-18:00}

Objective: to track progress, calculate completion rate, plan carry-overs, and generate tomorrow's preview.

6. board\_get\_my\_tasks(due\_filter="today") — check what should have been done  
7. gtasks\_get\_completions(since=today\_9am) — which was effectively completed today  
8. board\_get\_overdue() — carry-overs and tasks that came from previous days.  
9. \[Agent Synthesis\] — calculate completion rate; detect patterns (e.g., tasks of type X are always delayed)  
10. board\_bulk\_reschedule(uncompleted\_today, tomorrow) — automatically reschedule incomplete tasks.  
11. board\_get\_my\_tasks(due\_filter="week") — generate a preview of the next 2 business days  
12. notify\_post\_standup(eod\_summary) \+ notify\_send\_digest(tomorrow\_preview)

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

## **7.4 Connection Points with External MCPs** {#7.4-connection-points-with-external-mcps}

In addition to the native MCP Server, the agent connects to external MCPs already available in the ecosystem for context and additional actions. The table below maps the three available MCPs and their role in the daily protocol.

| External MCP | Endpoint / Status | Tools Relevant to Daily | Non-Protocol Use |
| ----- | ----- | ----- | ----- |
| **Notion MCP** | mcp.notion.com/mcp ✅ Available | notion\_search notion\_retrieve\_page notion\_query\_database notion\_get\_comments | Deep search in Notion databases; retrieval of page content for agent context; fallback if the AS Notion Poller is delayed. |
| **Gmail MCP** | gmail.mcp.claude.com/mcp ✅ Available | gmail\_search\_messages gmail\_read\_thread | Identify emails that require action and should generate tasks; detect approvals responded to by email that should update the status on the board. |
| **Google Calendar MCP** | gcal.mcp.claude.com/mcp ✅ Available | list\_events create\_event check\_availability | Native Calendar reading for morning daily tasks; creation of time blocks for the top 3 tasks; checking actual availability before rescheduling tasks. |
| **GSheets Work OS MCP (this document)** | script.google.com/macros/.../exec 🔧 To be implemented | Complete catalog §7.2 (board, notion, calendar, notification tools) | Reading and writing to the board; creating and completing tasks; bulk rescheduling; forced syncing with Google Tasks. |

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

**9.1 Task Scheme (Board Line)** {#9.1-task-scheme-(board-line)}

| Field | Type | Example | Notes |
| ----- | ----- | ----- | ----- |
| **task\_id** | string | TSK-0042 | UUID generated by Apps Script; immutable. |
| **title** | string | Review schema BQ | Required; max 200 characters |
| **project\_id** | string | PRJ-bigquery | FK for both Projects |
| **status** | enum | In Progress | Inbox | To Do | In Progress | Review | Done | Cancelled | Blocked |
| **assignee** | email | user@email.com | Valid Google email address for notifications. |
| **priority** | enum | P1 | P0 (critical) | P1 (high) | P2 (normal) | P3 (low) |
| **due\_date** | date | 2025-04-10 | ISO 8601; triggers sync with Google Tasks and Calendar. |
| **scheduled\_date** | date | 2025-04-07 | "When am I going to work on this?" — different from the due date. |
| **start\_date** | date | 2025-04-05 | Used in Gantt/Timeline view. |
| **effort\_h** | number | 2.5 | Estimate in hours; used in velocity tracking. |
| **tags** | string\[\] | bigquery,review | CSV; no spaces; lowercase |
| **notion\_link** | url | notion.so/page/... | Populated by Notion Poller; hyperlink in Sheets cell |
| **gtask\_id** | string | MDEwOTEx... | ID da Google Task; coluna hidden no Sheets |
| **created\_at** | datetime | 2025-04-07T08:30:00 | Auto-populated in the onEdit creation event; immutable. |

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