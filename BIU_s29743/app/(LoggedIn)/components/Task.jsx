"use client"

import Link from "next/link";

const priorities = {
    1: "Critical",
    2: "High",
    3: "Moderate",
    4: "Low",
    5: "Optional",
};

function remainingTime(dueDate) {
    if (!dueDate) return {label: "No due date", overdue: false};

    const due = new Date(dueDate);
    if (Number.isNaN(due.getTime())) return {label: "No due date", overdue: false};

    const diffMs = due.getTime() - Date.now();
    if (diffMs <= 0) return {label: "Overdue", overdue: true};

    const totalMinutes = Math.floor(diffMs / 60000);
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;

    const parts = [];
    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (!days && minutes) parts.push(`${minutes}m`);
    if (parts.length === 0) parts.push("<1m");

    return {label: `${parts.join(" ")} left`, overdue: false};
}

export default ({task}) => {

    const isDone = task.status === "done";
    const {label: remainingLabel, overdue} = remainingTime(task.schedule?.dueDate);

    return (
        <div key={task.id} className="task">
            <Link href={`/task/${task.id}`} className="">{task.title}</Link>
            <p className={"priority" + task.priority}>{priorities[task.priority]}</p>
            <p className="">{task.assignee}</p>
            <p className="">{task.group}</p>
            <p className="">{task.tags.main}</p>
            <p className="">{task.status}</p>
            {task.tags?.otherTags?.length > 0 ? (
                <div className="task-labels">
                    {task.tags.otherTags.map((label) => (
                        <span key={label} className="label-chip">{label}</span>
                    ))}
                </div>
            ) : null}
            <div className="task-progress">
                <div className="progress-bar">
                    <div className="progress-bar-fill" style={{width: `${task.progress ?? 0}%`}} />
                </div>
                <span className="progress-label">{task.progress ?? 0}%</span>
            </div>
            {!isDone ? (
                <p className={"task-remaining" + (overdue ? " task-remaining-overdue" : "")}>
                    {remainingLabel}
                </p>
            ) : null}
        </div>
        )
}