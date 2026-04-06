import { invoke } from "@tauri-apps/api/core";
import { parseTaskInput, CONFIDENCE_THRESHOLD, type ParsedTask } from "./nlp";

const input = document.getElementById("task-input") as HTMLInputElement;
const preview = document.getElementById("preview") as HTMLDivElement;
const previewFields = document.getElementById("preview-fields") as HTMLDivElement;
const tierBadge = document.getElementById("tier-badge") as HTMLDivElement;
const statusBar = document.getElementById("status-bar") as HTMLDivElement;
const statusText = document.getElementById("status-text") as HTMLSpanElement;

let currentParse: ParsedTask | null = null;

// ── Live preview on typing ─────────────────────────────────────────

input.addEventListener("input", () => {
  const raw = input.value.trim();
  if (!raw) {
    preview.classList.add("hidden");
    tierBadge.textContent = "T1";
    tierBadge.classList.remove("tier2");
    currentParse = null;
    return;
  }

  currentParse = parseTaskInput(raw);
  renderPreview(currentParse);

  if (currentParse.confidence < CONFIDENCE_THRESHOLD) {
    tierBadge.textContent = "T2";
    tierBadge.title = "Tier 2: agent-assisted (confidence too low for local parse)";
    tierBadge.classList.add("tier2");
  } else {
    tierBadge.textContent = "T1";
    tierBadge.title = "Tier 1: local parse";
    tierBadge.classList.remove("tier2");
  }
});

// ── Submit on Enter ────────────────────────────────────────────────

input.addEventListener("keydown", async (e) => {
  if (e.key === "Enter" && currentParse && currentParse.title) {
    e.preventDefault();
    await submitTask(currentParse, input.value.trim());
  }
  if (e.key === "Escape") {
    e.preventDefault();
    invoke("hide_window");
  }
});

// ── Submit logic ───────────────────────────────────────────────────

async function submitTask(parsed: ParsedTask, rawInput: string) {
  showStatus("pending", "Creating task...");

  try {
    if (parsed.confidence >= CONFIDENCE_THRESHOLD) {
      // Tier 1: deterministic — call board_create_task directly
      const result = await invoke<string>("create_task_direct", {
        title: parsed.title,
        projectId: parsed.project_id,
        epicId: parsed.epic_id,
        priority: parsed.priority,
        dueDate: parsed.due_date,
        scheduledDate: parsed.scheduled_date,
        tags: parsed.tags,
        assignee: parsed.assignee,
        effortH: parsed.effort_h,
      });
      showStatus("success", `Created: ${parsed.title} (${result})`);
    } else {
      // Tier 2: agent-assisted — send raw text to MCP agent
      showStatus("pending", "Low confidence — asking agent...");
      const result = await invoke<string>("create_task_via_agent", {
        rawInput,
      });
      showStatus("success", `Agent created: ${result}`);
    }

    // Clear and hide after short delay
    setTimeout(() => {
      input.value = "";
      preview.classList.add("hidden");
      statusBar.classList.add("hidden");
      currentParse = null;
      invoke("hide_window");
    }, 1200);
  } catch (err) {
    showStatus("error", `Failed: ${err}`);
  }
}

// ── Render helpers ─────────────────────────────────────────────────

function renderPreview(parsed: ParsedTask) {
  previewFields.innerHTML = "";
  preview.classList.remove("hidden");

  if (parsed.title) {
    addPill("title", parsed.title);
  }
  if (parsed.priority) {
    addPill("priority", parsed.priority, `priority-${parsed.priority}`);
  }
  if (parsed.due_date) {
    addPill("due", parsed.due_date);
  }
  if (parsed.project_id) {
    addPill("project", parsed.project_id);
  }
  for (const tag of parsed.tags) {
    addPill("tag", `#${tag}`, "tag");
  }
  if (parsed.assignee) {
    addPill("assignee", parsed.assignee);
  }
  if (parsed.effort_h !== null) {
    addPill("effort", `${parsed.effort_h}h`);
  }

  // Confidence indicator
  const confPill = document.createElement("span");
  confPill.className = "field-pill";
  confPill.style.marginLeft = "auto";
  confPill.innerHTML = `<span class="label">conf</span> ${Math.round(parsed.confidence * 100)}%`;
  previewFields.appendChild(confPill);
}

function addPill(label: string, value: string, extraClass?: string) {
  const pill = document.createElement("span");
  pill.className = `field-pill${extraClass ? ` ${extraClass}` : ""}`;
  pill.innerHTML = `<span class="label">${label}</span> ${escapeHtml(value)}`;
  previewFields.appendChild(pill);
}

function showStatus(type: "success" | "error" | "pending", message: string) {
  statusBar.classList.remove("hidden", "success", "error", "pending");
  statusBar.classList.add(type);
  statusText.textContent = message;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ── Focus input on window show ─────────────────────────────────────
window.addEventListener("focus", () => input.focus());
document.addEventListener("DOMContentLoaded", () => input.focus());
