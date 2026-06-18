import { NextResponse } from "next/server";
import { tasksDB, nextTaskId, makeSchedule } from "./data";
import { deriveStatusFromProgress } from "../../lib/taskStatus";

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

    const { title, description, notes, priority, tagMain, otherTags, assignee, group, schedule, attachments, progress } = body;

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

    const progressNum = Number(progress);
    const normalizedProgress = Number.isFinite(progressNum)
        ? Math.min(100, Math.max(0, Math.round(progressNum)))
        : 0;

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
        notes: (notes || "").trim(),
        completedAt: normalizedProgress >= 100 ? new Date() : null,
        priority: normalizedPriority,
        tags: {
            main: tagMain || "",
            otherTags: Array.isArray(otherTags)
                ? otherTags.map((t) => (t || "").trim()).filter(Boolean)
                : [],
        },
        attachments: Array.isArray(attachments)
            ? attachments.map((a) => (a || "").trim()).filter(Boolean)
            : [],
        assignee: trimmedAssignee,
        status: deriveStatusFromProgress(normalizedProgress),
        progress: normalizedProgress,
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
