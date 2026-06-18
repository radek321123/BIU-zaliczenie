import { NextResponse } from "next/server";
import { tasksDB, makeSchedule } from "../data";
import { deriveStatusFromProgress } from "../../../lib/taskStatus";

export async function GET(request, { params }) {
    const { id } = await params;
    const task = tasksDB.find((t) => t.id === Number(id));

    if (!task) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
}

export async function PATCH(request, { params }) {
    const { id } = await params;
    const index = tasksDB.findIndex((t) => t.id === Number(id));

    if (index === -1) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const updated = { ...tasksDB[index], ...body, id: tasksDB[index].id };

    // Status has no independent control — it's always derived from progress.
    if (body.progress !== undefined) {
        const progressNum = Number(body.progress);
        updated.progress = Number.isFinite(progressNum)
            ? Math.min(100, Math.max(0, Math.round(progressNum)))
            : tasksDB[index].progress;
    }
    updated.status = deriveStatusFromProgress(updated.progress);

    if (updated.status !== tasksDB[index].status) {
        updated.completedAt = updated.status === "done" ? new Date() : null;
    }

    if (body.schedule) {
        const mode = body.schedule.mode === "scheduled" ? "scheduled" : "now";

        if (mode === "scheduled" && !body.schedule.startDate) {
            return NextResponse.json(
                { error: "A start date is required when scheduling for later" },
                { status: 400 }
            );
        }

        // Mirror POST: "now" is stamped with the server's current time (authoritative).
        const startDate = mode === "now" ? new Date() : body.schedule.startDate;
        updated.schedule = makeSchedule({ ...body.schedule, mode, startDate });
    }

    tasksDB[index] = updated;

    return NextResponse.json({ message: "Task updated", task: tasksDB[index] });
}

export async function DELETE(request, { params }) {
    const { id } = await params;
    const index = tasksDB.findIndex((t) => t.id === Number(id));

    if (index === -1) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    tasksDB.splice(index, 1);

    return NextResponse.json({ message: "Task deleted" });
}
