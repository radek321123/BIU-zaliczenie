import { NextResponse } from "next/server";
import { tasksDB, nextTaskId, makeSchedule } from "./data";

export async function GET() {
    return NextResponse.json(tasksDB);
}

export async function POST(request) {
    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { error: "Invalid JSON body" },
            { status: 400 }
        );
    }

    const { title, description, priority, tagMain, assignee, group, schedule } = body;

    const trimmedTitle = (title || "").trim();
    const trimmedAssignee = (assignee || "").trim();
    const trimmedGroup = (group || "").trim();

    if (!trimmedTitle || !trimmedAssignee || !trimmedGroup) {
        return NextResponse.json(
            { error: "Title, assignee and group are required" },
            { status: 400 }
        );
    }

    const p = Number(priority);
    const normalizedPriority = Number.isInteger(p) && p >= 1 && p <= 5 ? p : 1;

    // Scheduling: "now" is stamped with the server's current time (authoritative);
    // "scheduled" requires a client-provided start date/time.
    const scheduleInput = schedule || {};
    const mode = scheduleInput.mode === "scheduled" ? "scheduled" : "now";

    let startDate;
    if (mode === "now") {
        startDate = new Date();
    } else {
        if (!scheduleInput.startDate) {
            return NextResponse.json(
                { error: "A start date is required when scheduling for later" },
                { status: 400 }
            );
        }
        startDate = scheduleInput.startDate;
    }

    const task = {
        id: nextTaskId(),
        title: trimmedTitle,
        description: (description || "").trim(),
        priority: normalizedPriority,
        tags: {
            main: tagMain || "",
            otherTags: [],
        },
        assignee: trimmedAssignee,
        status: "to do",
        group: trimmedGroup,
        schedule: makeSchedule({
            mode,
            startDate,
            dueDate: scheduleInput.dueDate || null,
            repeat: scheduleInput.repeat || null,
        }),
    };

    tasksDB.push(task);

    return NextResponse.json(
        { message: "Task created", task },
        { status: 201 }
    );
}
