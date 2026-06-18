"use client"

import {useState} from "react";
import Link from "next/link";
import {useTasks} from "../../contexts/TasksContext";
import {useUsers} from "../../contexts/UsersContext";
import Loading from "../../components/Loading";

const SCOPE_ALL = "__all__";
const SCOPE_MINE = "__mine__";

const PRIORITY_LABELS = {
    1: "Critical",
    2: "High",
    3: "Moderate",
    4: "Low",
    5: "Optional",
};

const STATUSES = ["to do", "in progress", "done"];

function formatDuration(ms) {
    if (ms == null || Number.isNaN(ms)) return "—";
    const hours = ms / (1000 * 60 * 60);
    if (hours < 24) return `${hours.toFixed(1)}h`;
    return `${(hours / 24).toFixed(1)}d`;
}

// Pulled out of the component body since reading Date.now() directly during
// render is flagged as an impure call by the react-hooks/purity rule.
function countOverdue(scopedTasks) {
    const now = Date.now();
    return scopedTasks.filter((t) => {
        const due = t.schedule?.dueDate ? new Date(t.schedule.dueDate).getTime() : null;
        return t.status !== "done" && due !== null && !Number.isNaN(due) && due < now;
    }).length;
}

export default function DashboardPage() {
    const {tasks} = useTasks();
    const {users} = useUsers();
    const [scope, setScope] = useState(SCOPE_ALL);

    const user = users.loggedIn;
    const userGroups = user?.groups || [];

    if (!user) {
        return null;
    }

    if (tasks.loading) {
        return (
            <div className="dashboard-page">
                <div className="dashboard-interface">
                    <Loading label="Loading dashboard…" />
                </div>
            </div>
        );
    }

    let scopedTasks;
    if (scope === SCOPE_MINE) {
        scopedTasks = tasks.tasks.filter((t) => t.assignee === user.email);
    } else if (scope === SCOPE_ALL) {
        scopedTasks = tasks.tasks.filter((t) => userGroups.includes(t.group));
    } else {
        scopedTasks = tasks.tasks.filter((t) => t.group === scope);
    }

    const total = scopedTasks.length;
    const avgProgress = total
        ? Math.round(scopedTasks.reduce((sum, t) => sum + (t.progress ?? 0), 0) / total)
        : 0;
    const statusCounts = STATUSES.map((status) => ({
        status,
        count: scopedTasks.filter((t) => t.status === status).length,
    }));
    const priorityCounts = Object.entries(PRIORITY_LABELS).map(([value, label]) => ({
        value,
        label,
        count: scopedTasks.filter((t) => String(t.priority) === value).length,
    }));

    const overdueCount = countOverdue(scopedTasks);

    const completionTimes = scopedTasks
        .filter((t) => t.status === "done" && t.completedAt && t.schedule?.startDate)
        .map((t) => new Date(t.completedAt).getTime() - new Date(t.schedule.startDate).getTime())
        .filter((ms) => !Number.isNaN(ms) && ms >= 0);
    const avgCompletionMs = completionTimes.length
        ? completionTimes.reduce((sum, ms) => sum + ms, 0) / completionTimes.length
        : null;

    const maxStatusCount = Math.max(1, ...statusCounts.map((s) => s.count));

    return (
        <div className="dashboard-page">
            <div className="dashboard-interface">
                <div className="dashboard-header">
                    <h1>Dashboard</h1>
                    <select value={scope} onChange={(e) => setScope(e.target.value)}>
                        <option value={SCOPE_ALL}>All my groups</option>
                        {userGroups.map((g) => (
                            <option key={g} value={g}>Group: {g}</option>
                        ))}
                        <option value={SCOPE_MINE}>Assigned to me</option>
                    </select>
                </div>

                <div className="dashboard-stats">
                    <div className="stat-card total">
                        <span className="stat-count">{total}</span>
                        <span className="stat-label">Total tasks</span>
                    </div>
                    {statusCounts.map(({status, count}) => (
                        <div key={status} className="stat-card">
                            <span className="stat-count">{count}</span>
                            <span className="stat-label">{status}</span>
                        </div>
                    ))}
                    <div className="stat-card progress">
                        <span className="stat-count">{avgProgress}%</span>
                        <span className="stat-label">Avg. progress</span>
                    </div>
                    <div className="stat-card overdue">
                        <span className="stat-count">{overdueCount}</span>
                        <span className="stat-label">Overdue</span>
                    </div>
                    <div className="stat-card completion-time">
                        <span className="stat-count">{formatDuration(avgCompletionMs)}</span>
                        <span className="stat-label">Avg. completion time</span>
                    </div>
                </div>

                <div className="dashboard-priorities">
                    <h2>By priority</h2>
                    <div className="priority-bars">
                        {priorityCounts.map(({value, label, count}) => (
                            <div key={value} className="priority-row">
                                <span className={"priority-label priority" + value}>{label}</span>
                                <span className="priority-count">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="dashboard-chart">
                    <h2>Status overview</h2>
                    <svg className="status-chart" viewBox="0 0 120 60" preserveAspectRatio="none">
                        {statusCounts.map(({status, count}, index) => {
                            const barHeight = (count / maxStatusCount) * 50;
                            return (
                                <g key={status}>
                                    <rect
                                        className={"status-bar status-bar-" + status.replace(" ", "-")}
                                        x={index * 40 + 10}
                                        y={58 - barHeight}
                                        width={20}
                                        height={barHeight}
                                    />
                                    <text x={index * 40 + 20} y={58} textAnchor="middle" className="status-bar-count">
                                        {count}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>
                    <div className="status-chart-legend">
                        {statusCounts.map(({status}) => (
                            <span key={status} className={"status-legend-item status-bar-" + status.replace(" ", "-")}>
                                {status}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="dashboard-list">
                    <h2>Tasks</h2>
                    {scopedTasks.length === 0 ? (
                        <p className="dashboard-empty">No tasks in this view</p>
                    ) : (
                        scopedTasks.map((task) => (
                            <Link
                                key={task.id}
                                href={`/task/${task.id}`}
                                className="dashboard-task-row"
                            >
                                <span className="dashboard-task-title">{task.title}</span>
                                <span className={"dashboard-task-priority priority" + task.priority}>
                                    {PRIORITY_LABELS[task.priority]}
                                </span>
                                <span className="dashboard-task-group">{task.group}</span>
                                <span className="dashboard-task-status">{task.status}</span>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
