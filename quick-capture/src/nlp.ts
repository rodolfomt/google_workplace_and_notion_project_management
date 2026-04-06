/**
 * Quick Capture — Local NLP Parser (Tier 1)
 *
 * Deterministic regex-based parser that extracts structured task fields
 * from natural language input. Returns a confidence score (0–1).
 * If confidence < CONFIDENCE_THRESHOLD, the caller should fall back to
 * Tier 2 (agent-assisted via MCP).
 *
 * Examples:
 *   "review PR tomorrow P1"           → { title: "review PR", due_date: "2025-04-06", priority: "P1" }
 *   "deploy v2 friday #infra P0"      → { title: "deploy v2", due_date: "2025-04-11", priority: "P0", tags: ["infra"] }
 *   "call alice about budget"         → { title: "call alice about budget", confidence: 0.4 } → fallback
 */

export const CONFIDENCE_THRESHOLD = 0.6;

export interface ParsedTask {
  title: string;
  due_date: string | null;
  scheduled_date: string | null;
  priority: string | null;
  project_id: string | null;
  epic_id: string | null;
  tags: string[];
  assignee: string | null;
  effort_h: number | null;
  confidence: number;
}

// ── Date helpers ──────────────────────────────────────────────────────

function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function nextWeekday(from: Date, targetDay: number): Date {
  // targetDay: 0=Sun ... 6=Sat
  const diff = (targetDay - from.getDay() + 7) % 7;
  return addDays(from, diff === 0 ? 7 : diff);
}

const DAY_MAP: Record<string, number> = {
  sunday: 0, sun: 0,
  monday: 1, mon: 1,
  tuesday: 2, tue: 2, tues: 2,
  wednesday: 3, wed: 3,
  thursday: 4, thu: 4, thurs: 4,
  friday: 5, fri: 5,
  saturday: 6, sat: 6,
};

// ── Extraction functions ─────────────────────────────────────────────

interface Extraction<T> {
  value: T | null;
  remaining: string;
  matched: boolean;
}

function extractPriority(input: string): Extraction<string> {
  const match = input.match(/\b(P[0-3])\b/i);
  if (match) {
    return {
      value: match[1].toUpperCase(),
      remaining: input.replace(match[0], "").trim(),
      matched: true,
    };
  }
  // Word-based: "urgent" → P0, "high" → P1, "low" → P3
  const wordMap: Record<string, string> = {
    urgent: "P0", critical: "P0",
    high: "P1", important: "P1",
    normal: "P2", medium: "P2",
    low: "P3",
  };
  for (const [word, pri] of Object.entries(wordMap)) {
    const re = new RegExp(`\\b${word}\\b`, "i");
    if (re.test(input)) {
      return { value: pri, remaining: input.replace(re, "").trim(), matched: true };
    }
  }
  return { value: null, remaining: input, matched: false };
}

function extractTags(input: string): Extraction<string[]> {
  const tags: string[] = [];
  const remaining = input.replace(/#(\w+)/g, (_, tag) => {
    tags.push(tag.toLowerCase());
    return "";
  });
  return { value: tags.length > 0 ? tags : [], remaining: remaining.trim(), matched: tags.length > 0 };
}

function extractProject(input: string): Extraction<string> {
  // @project or PRJ-xxx
  const atMatch = input.match(/@(\w[\w-]*)/);
  if (atMatch) {
    return {
      value: `PRJ-${atMatch[1].toLowerCase()}`,
      remaining: input.replace(atMatch[0], "").trim(),
      matched: true,
    };
  }
  const prjMatch = input.match(/\b(PRJ-[\w-]+)\b/i);
  if (prjMatch) {
    return {
      value: prjMatch[1],
      remaining: input.replace(prjMatch[0], "").trim(),
      matched: true,
    };
  }
  return { value: null, remaining: input, matched: false };
}

function extractAssignee(input: string): Extraction<string> {
  // ->email or =>email or assign:email
  const match = input.match(/(?:->|=>|assign[:\s]+)([\w.+-]+@[\w.-]+)/i);
  if (match) {
    return {
      value: match[1],
      remaining: input.replace(match[0], "").trim(),
      matched: true,
    };
  }
  return { value: null, remaining: input, matched: false };
}

function extractEffort(input: string): Extraction<number> {
  const match = input.match(/\b(\d+(?:\.\d+)?)\s*h(?:ours?|r?s?)?\b/i);
  if (match) {
    return {
      value: parseFloat(match[1]),
      remaining: input.replace(match[0], "").trim(),
      matched: true,
    };
  }
  return { value: null, remaining: input, matched: false };
}

function extractDate(input: string, now: Date = new Date()): Extraction<string> {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lower = input.toLowerCase();

  // Relative: today, tomorrow, day-after-tomorrow
  const relativeMap: [RegExp, () => Date][] = [
    [/\btoday\b/, () => today],
    [/\btomorrow\b/, () => addDays(today, 1)],
    [/\bday[\s-]?after[\s-]?tomorrow\b/, () => addDays(today, 2)],
    [/\bnext\s+week\b/, () => addDays(today, 7)],
  ];
  for (const [re, fn] of relativeMap) {
    if (re.test(lower)) {
      return {
        value: toISO(fn()),
        remaining: input.replace(re, "").trim(),
        matched: true,
      };
    }
  }

  // "next friday", "this monday", weekday names
  const nextDayMatch = lower.match(/\b(?:next\s+|this\s+)?(\w+day|mon|tue|tues|wed|thu|thurs|fri|sat|sun)\b/);
  if (nextDayMatch) {
    const dayName = nextDayMatch[1].toLowerCase();
    // Find the base day name (strip "day" suffix for lookup)
    const lookupKey = Object.keys(DAY_MAP).find(
      (k) => dayName === k || dayName.startsWith(k)
    );
    if (lookupKey !== undefined) {
      const targetDay = DAY_MAP[lookupKey];
      return {
        value: toISO(nextWeekday(today, targetDay)),
        remaining: input.replace(new RegExp(nextDayMatch[0], "i"), "").trim(),
        matched: true,
      };
    }
  }

  // "in N days"
  const inDaysMatch = lower.match(/\bin\s+(\d+)\s+days?\b/);
  if (inDaysMatch) {
    return {
      value: toISO(addDays(today, parseInt(inDaysMatch[1]))),
      remaining: input.replace(new RegExp(inDaysMatch[0], "i"), "").trim(),
      matched: true,
    };
  }

  // Explicit ISO date: 2025-04-10
  const isoMatch = input.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (isoMatch) {
    return {
      value: isoMatch[1],
      remaining: input.replace(isoMatch[0], "").trim(),
      matched: true,
    };
  }

  // dd/mm or mm/dd (assume dd/mm for non-US locale, configurable)
  const slashMatch = input.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
  if (slashMatch) {
    const day = parseInt(slashMatch[1]);
    const month = parseInt(slashMatch[2]);
    const year = slashMatch[3]
      ? parseInt(slashMatch[3]) + (slashMatch[3].length === 2 ? 2000 : 0)
      : today.getFullYear();
    const d = new Date(year, month - 1, day);
    return {
      value: toISO(d),
      remaining: input.replace(slashMatch[0], "").trim(),
      matched: true,
    };
  }

  return { value: null, remaining: input, matched: false };
}

// ── Main parser ──────────────────────────────────────────────────────

export function parseTaskInput(raw: string, now: Date = new Date()): ParsedTask {
  let text = raw.trim();
  let fieldsMatched = 0;

  // Extract structured fields in order (each removes matched tokens from text)
  const priority = extractPriority(text);
  text = priority.remaining;
  if (priority.matched) fieldsMatched++;

  const tags = extractTags(text);
  text = tags.remaining;
  if (tags.matched) fieldsMatched++;

  const project = extractProject(text);
  text = project.remaining;
  if (project.matched) fieldsMatched++;

  const assignee = extractAssignee(text);
  text = assignee.remaining;

  const effort = extractEffort(text);
  text = effort.remaining;
  if (effort.matched) fieldsMatched++;

  const dueDate = extractDate(text, now);
  text = dueDate.remaining;
  if (dueDate.matched) fieldsMatched++;

  // Whatever remains is the title
  const title = text.replace(/\s{2,}/g, " ").trim();

  // Confidence: base 0.5 for having a non-empty title, +0.1 per matched field
  let confidence = title.length > 0 ? 0.5 : 0.1;
  confidence += fieldsMatched * 0.1;
  confidence = Math.min(confidence, 1.0);

  // Penalize if title is suspiciously short (1-2 chars) or very long (>200)
  if (title.length <= 2) confidence *= 0.5;
  if (title.length > 200) confidence *= 0.8;

  return {
    title,
    due_date: dueDate.value,
    scheduled_date: null, // could be extracted with "schedule for X"
    priority: priority.value,
    project_id: project.value,
    epic_id: null,
    tags: tags.value ?? [],
    assignee: assignee.value,
    effort_h: effort.value,
    confidence: Math.round(confidence * 100) / 100,
  };
}
