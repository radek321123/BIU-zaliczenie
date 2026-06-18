// Browser-side helpers for the calendar (.ics) export and the JSON/CSV
// import/export features — no server endpoint involved, files are built
// and downloaded entirely client-side.

export function downloadBlob(filename, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function formatIcsDate(value) {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function escapeIcsText(value) {
    return String(value || "").replace(/[\\,;]/g, (c) => "\\" + c).replace(/\n/g, "\\n");
}

// Tasks without a due date have nothing meaningful to put on a calendar, so they're skipped.
function taskToIcsEvent(task) {
    const due = task.schedule?.dueDate;
    if (!due) return null;
    const dueStamp = formatIcsDate(due);
    if (!dueStamp) return null;

    const startStamp = formatIcsDate(task.schedule?.startDate) || dueStamp;
    const lines = [
        "BEGIN:VEVENT",
        `UID:task-${task.id}@biu-todo-app`,
        `DTSTAMP:${formatIcsDate(new Date())}`,
        `DTSTART:${startStamp}`,
        `DTEND:${dueStamp}`,
        `SUMMARY:${escapeIcsText(task.title)}`,
    ];
    if (task.description) lines.push(`DESCRIPTION:${escapeIcsText(task.description)}`);
    if (task.group) lines.push(`CATEGORIES:${escapeIcsText(task.group)}`);
    if (task.schedule?.repeat) {
        const freq = task.schedule.repeat.days >= 1 ? "DAILY" : "HOURLY";
        lines.push(`RRULE:FREQ=${freq}`);
    }
    lines.push("END:VEVENT");
    return lines.join("\r\n");
}

export function buildIcsCalendar(tasks) {
    const events = tasks.map(taskToIcsEvent).filter(Boolean);
    return [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//BIU Todo App//EN",
        ...events,
        "END:VCALENDAR",
    ].join("\r\n");
}

export function downloadTaskIcs(task) {
    const ics = buildIcsCalendar([task]);
    downloadBlob(`${task.title.replace(/[^a-z0-9]+/gi, "-") || "task"}.ics`, ics, "text/calendar");
}

export function downloadTasksIcs(tasks, filename = "tasks.ics") {
    downloadBlob(filename, buildIcsCalendar(tasks), "text/calendar");
}

const CSV_COLUMNS = [
    "id", "title", "description", "notes", "priority", "status", "progress",
    "group", "assignee", "tagMain", "otherTags", "startDate", "dueDate",
    "repeatDays", "repeatHours",
];

function csvEscape(value) {
    const str = String(value ?? "");
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export function tasksToCsv(tasks) {
    const rows = tasks.map((t) => [
        t.id,
        t.title,
        t.description,
        t.notes,
        t.priority,
        t.status,
        t.progress,
        t.group,
        t.assignee,
        t.tags?.main,
        (t.tags?.otherTags || []).join(";"),
        t.schedule?.startDate ? new Date(t.schedule.startDate).toISOString() : "",
        t.schedule?.dueDate ? new Date(t.schedule.dueDate).toISOString() : "",
        t.schedule?.repeat?.days ?? "",
        t.schedule?.repeat?.hours ?? "",
    ].map(csvEscape).join(","));

    return [CSV_COLUMNS.join(","), ...rows].join("\r\n");
}

export function tasksToJson(tasks) {
    return JSON.stringify(tasks, null, 2);
}

function parseCsvLine(line) {
    const values = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (inQuotes) {
            if (char === '"' && line[i + 1] === '"') {
                current += '"';
                i++;
            } else if (char === '"') {
                inQuotes = false;
            } else {
                current += char;
            }
        } else if (char === '"') {
            inQuotes = true;
        } else if (char === ",") {
            values.push(current);
            current = "";
        } else {
            current += char;
        }
    }
    values.push(current);
    return values;
}

// Builds POST-body-shaped task objects (group/assignee required server-side);
// the caller is expected to fill in any gaps (e.g. group fallback) before sending.
function rowToTaskInput(row) {
    return {
        title: row.title || "",
        description: row.description || "",
        notes: row.notes || "",
        priority: row.priority || 1,
        tagMain: row.tagMain || "",
        otherTags: (row.otherTags || "").split(";").map((t) => t.trim()).filter(Boolean),
        assignee: row.assignee || "",
        group: row.group || "",
        progress: row.progress || 0,
        schedule: {
            mode: row.startDate ? "scheduled" : "now",
            startDate: row.startDate || null,
            dueDate: row.dueDate || null,
            repeat: row.repeatDays || row.repeatHours
                ? { days: Number(row.repeatDays) || 0, hours: Number(row.repeatHours) || 0 }
                : null,
        },
    };
}

export function parseCsvTasks(text) {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];
    const headers = parseCsvLine(lines[0]);
    return lines.slice(1).map((line) => {
        const values = parseCsvLine(line);
        const row = {};
        headers.forEach((h, i) => { row[h] = values[i]; });
        return rowToTaskInput(row);
    });
}

export function parseJsonTasks(text) {
    const parsed = JSON.parse(text);
    const list = Array.isArray(parsed) ? parsed : [parsed];
    return list.map((t) => ({
        title: t.title || "",
        description: t.description || "",
        notes: t.notes || "",
        priority: t.priority || 1,
        tagMain: t.tags?.main || t.tagMain || "",
        otherTags: t.tags?.otherTags || t.otherTags || [],
        attachments: t.attachments || [],
        assignee: t.assignee || "",
        group: t.group || "",
        progress: t.progress || 0,
        schedule: t.schedule || { mode: "now", startDate: null, dueDate: null, repeat: null },
    }));
}
