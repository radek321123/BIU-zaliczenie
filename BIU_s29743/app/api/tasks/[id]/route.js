import { NextResponse } from "next/server";
import { tasksDB } from "../data";

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

    tasksDB[index] = { ...tasksDB[index], ...body, id: tasksDB[index].id };

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
