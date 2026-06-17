"use client"

import { useParams, useRouter } from "next/navigation";
import { useTasks } from "../../../contexts/TasksContext";

const priorities = {
    1: "Critical",
    2: "High",
    3: "Moderate",
    4: "Low",
    5: "Optional",
};

const statuses = ["to do", "in progress", "done"];

function formatDateTime(value) {
    if (!value) return "—";
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

function formatRepeat(repeat) {
    if (!repeat) return "Does not repeat";
    const parts = [];
    if (repeat.days) parts.push(`${repeat.days} day${repeat.days === 1 ? "" : "s"}`);
    if (repeat.hours) parts.push(`${repeat.hours} hour${repeat.hours === 1 ? "" : "s"}`);
    const every = parts.length ? parts.join(" ") : "interval";
    return `Every ${every} (next: ${formatDateTime(repeat.next)})`;
}

export default function TaskDetail() {
    const { id } = useParams();
    const router = useRouter();
    const { tasks, dispatch } = useTasks();

    const task = tasks.tasks.find((t) => t.id === Number(id));

    if (tasks.loading) {
        return <div>Loading...</div>;
    }

    if (!task) {
        return <div>Task not found</div>;
    }

    async function handleStatusChange(event) {
        const status = event.target.value;
        const res = await fetch(`/api/tasks/${task.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        });

        if (res.ok) {
            const data = await res.json();
            dispatch({ type: "UPDATE_TASK", payload: data.task });
        }
    }

    async function handleDelete() {
        const res = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });

        if (res.ok) {
            dispatch({ type: "DELETE_TASK", payload: task.id });
            router.push("/tasks");
        }
    }

    return (
        <div className="task-detail">
            <h1>{task.title}</h1>
            {task.description ? <p>{task.description}</p> : null}
            <p className={"priority" + task.priority}>{priorities[task.priority]}</p>
            <p>Assignee: {task.assignee}</p>
            <p>Group: {task.group}</p>
            <p>Tag: {task.tags?.main}</p>

            <div className="task-schedule">
                <h3>Schedule</h3>
                <p>Mode: {task.schedule?.mode === "scheduled" ? "Scheduled" : "Start now"}</p>
                <p>Starts: {formatDateTime(task.schedule?.startDate)}</p>
                <p>Due: {formatDateTime(task.schedule?.dueDate)}</p>
                <p>Repeat: {formatRepeat(task.schedule?.repeat)}</p>
            </div>

            <label htmlFor="status">Status:</label>
            <select id="status" value={task.status} onChange={handleStatusChange}>
                {statuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                ))}
            </select>

            <button onClick={handleDelete}>Delete task</button>
        </div>
    );
}
