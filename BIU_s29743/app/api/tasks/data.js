const DAY_MS = 86400000;
const HOUR_MS = 3600000;

// A task's scheduling lives in one `schedule` object:
//   mode:      "now" | "scheduled"  — the scheduling option chosen at creation
//   startDate: Date | null          — when the task starts (server time if "now")
//   dueDate:   Date | null          — deadline
//   repeat:    null | { days, hours, intervalMs, next } — recurrence
export function makeSchedule({ mode = "now", startDate = null, dueDate = null, repeat = null } = {}) {
    const start = startDate ? new Date(startDate) : null;
    const due = dueDate ? new Date(dueDate) : null;

    let normalizedRepeat = null;
    if (repeat) {
        const days = Number(repeat.days) || 0;
        const hours = Number(repeat.hours) || 0;
        const intervalMs = repeat.intervalMs != null
            ? Number(repeat.intervalMs)
            : days * DAY_MS + hours * HOUR_MS;

        if (intervalMs > 0) {
            normalizedRepeat = {
                days,
                hours,
                intervalMs,
                next: repeat.next
                    ? new Date(repeat.next)
                    : (start ? new Date(start.getTime() + intervalMs) : null),
            };
        }
    }

    return {
        mode: mode === "scheduled" ? "scheduled" : "now",
        startDate: start,
        dueDate: due,
        repeat: normalizedRepeat,
    };
}

export let tasksDB = [
    {
        id: 1,
        title: "Task1",
        description: "",
        priority: 1,
        tags: { main: "main tag", otherTags: ["other1", "other2", "other3"] },
        assignee: "test assignee",
        status: "to do",
        group: "group 1",
        schedule: makeSchedule({
            mode: "scheduled",
            startDate: new Date("2026-06-20T09:00:00"),
            dueDate: new Date("2026-06-27T17:00:00"),
            repeat: { days: 1, hours: 0 },
        }),
    },
    {
        id: 2,
        title: "Task2",
        description: "",
        priority: 2,
        tags: { main: "main tag", otherTags: ["other1", "other2", "other3"] },
        assignee: "test assignee",
        status: "in progress",
        group: "group 2",
        schedule: makeSchedule({
            mode: "now",
            startDate: new Date("2026-06-17T08:00:00"),
            dueDate: new Date("2026-06-24T12:00:00"),
        }),
    },
    {
        id: 3,
        title: "Task3",
        description: "",
        priority: 3,
        tags: { main: "main tag", otherTags: ["other1", "other2", "other3"] },
        assignee: "test assignee",
        status: "done",
        group: "group 1",
        schedule: makeSchedule({
            mode: "scheduled",
            startDate: new Date("2026-06-18T10:00:00"),
            dueDate: new Date("2026-06-19T10:00:00"),
            repeat: { days: 0, hours: 12 },
        }),
    },
    {
        id: 4,
        title: "Task4",
        description: "",
        priority: 4,
        tags: { main: "main tag", otherTags: ["other1", "other2", "other3"] },
        assignee: "test assignee",
        status: "to do",
        group: "group 3",
        schedule: makeSchedule({ mode: "now", startDate: new Date("2026-06-17T08:00:00") }),
    },
];

export function nextTaskId() {
    return tasksDB.length ? Math.max(...tasksDB.map((t) => t.id)) + 1 : 1;
}
