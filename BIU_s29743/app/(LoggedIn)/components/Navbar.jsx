"use client"

import Link from "next/link";
import {useEffect, useRef, useState} from "react";
import {useUsers} from "../../contexts/UsersContext";
import {useTasks} from "../../contexts/TasksContext";

const DUE_SOON_MS = 24 * 60 * 60 * 1000;

// Builds the logged-in user's notification list from live task data — there's no
// server-side notification queue, so "due soon"/"overdue"/"assigned" are derived
// on the fly and gated by the user's own notifyTypes preference.
function buildNotifications(tasks, user) {
    if (!user) return [];
    const types = user.notifyTypes || [];
    const now = Date.now();
    const relevant = tasks.filter(
        (t) => t.status !== "done" && (t.assignee === user.email || (user.groups || []).includes(t.group))
    );

    const notifications = [];
    relevant.forEach((task) => {
        const due = task.schedule?.dueDate ? new Date(task.schedule.dueDate).getTime() : null;
        const isOverdue = due !== null && !Number.isNaN(due) && due < now;
        const isDueSoon = due !== null && !Number.isNaN(due) && !isOverdue && due - now <= DUE_SOON_MS;

        if (isOverdue && types.includes("overdue")) {
            notifications.push({id: `${task.id}-overdue`, task, kind: "Overdue"});
        } else if (isDueSoon && types.includes("due_soon")) {
            notifications.push({id: `${task.id}-due_soon`, task, kind: "Due soon"});
        } else if (types.includes("assigned") && task.assignee === user.email && !isOverdue && !isDueSoon) {
            notifications.push({id: `${task.id}-assigned`, task, kind: "Assigned to you"});
        }
    });

    return notifications;
}

function NotificationBell() {
    const {users} = useUsers();
    const {tasks} = useTasks();
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const notifications = buildNotifications(tasks.tasks || [], users.loggedIn);

    return (
        <div className="notification-bell" ref={containerRef}>
            <button type="button" className="notification-toggle" onClick={() => setOpen((isOpen) => !isOpen)}>
                Notifications
                {notifications.length > 0 ? (
                    <span className="notification-count">{notifications.length}</span>
                ) : null}
            </button>
            {open ? (
                <div className="notification-panel">
                    {notifications.length === 0 ? (
                        <span className="notification-empty">No notifications</span>
                    ) : (
                        notifications.map((n) => (
                            <Link
                                key={n.id}
                                href={`/task/${n.task.id}`}
                                className="notification-item"
                                onClick={() => setOpen(false)}
                            >
                                <span className={"notification-kind notification-" + n.kind.toLowerCase().replace(/\s+/g, "-")}>
                                    {n.kind}
                                </span>
                                <span className="notification-title">{n.task.title}</span>
                            </Link>
                        ))
                    )}
                </div>
            ) : null}
        </div>
    );
}

export default function Navbar() {

    const {users, dispatch} = useUsers();

    const isAdmin = users.loggedIn?.groups?.includes("admin");

    function handleLogout() {
        dispatch({type: "LOGOUT_USER"});
    }

    return (
        <nav>
            <div className="navbar-left">
                <Link href="/tasks">
                    all tasks
                </Link>
                <Link href="/add_task">
                    add task
                </Link>
                <Link href="/dashboard">
                    dashboard
                </Link>
                {isAdmin ? (
                    <Link href="/admin">
                        admin
                    </Link>
                ) : null}
            </div>
            <div className="navbar-right">
                <NotificationBell/>
                <Link href="/" onClick={handleLogout}>
                    logout
                </Link>
                <Link href="/profile">
                    profile
                </Link>
            </div>
        </nav>
    )
}
