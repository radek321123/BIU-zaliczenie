"use client"
import {useEffect, useRef, useState} from "react";
import {useTasks} from "../../contexts/TasksContext";
import {useGroups} from "../../contexts/GroupsContext";
import {useUsers} from "../../contexts/UsersContext";
import Task from "../components/Task";
import Folder from "../components/Folder";
import Loading from "../../components/Loading";
import {
    downloadBlob,
    downloadTasksIcs,
    tasksToCsv,
    tasksToJson,
    parseCsvTasks,
    parseJsonTasks,
} from "../../lib/exportUtils";

const ALL_TASKS_FOLDER = "__all_tasks__";

const PRIORITY_LABELS = {
    1: "Critical",
    2: "High",
    3: "Moderate",
    4: "Low",
    5: "Optional",
};

const STATUSES = ["to do", "in progress", "done"];

function getChildren(allGroups, parentId) {
    return allGroups.filter((g) => g.parentId === parentId);
}

// A group "name" doubles as the access key tasks are filtered by, so a group
// is reachable from the root if the user belongs to it OR to any group nested under it.
function collectDescendantNames(allGroups, group) {
    const names = [group.name];
    getChildren(allGroups, group.id).forEach((child) => {
        names.push(...collectDescendantNames(allGroups, child));
    });
    return names;
}

function countTasksForGroup(allGroups, allTasks, group) {
    const direct = allTasks.filter((t) => t.group === group.name).length;
    const childCount = getChildren(allGroups, group.id)
        .reduce((sum, child) => sum + countTasksForGroup(allGroups, allTasks, child), 0);
    return direct + childCount;
}

function getGroupPath(allGroups, groupId) {
    const path = [];
    let current = allGroups.find((g) => g.id === groupId);
    while (current) {
        path.unshift(current);
        current = current.parentId != null ? allGroups.find((g) => g.id === current.parentId) : null;
    }
    return path;
}

// Dropdown with checkboxes letting the user pick zero or more options.
// An empty selection means "no filter" (everything matches).
function MultiSelectFilter({label, options, selected, onToggle, onClear}) {
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

    const summary = selected.length === 0
        ? `All ${label.toLowerCase()}`
        : selected.length === 1
            ? options.find((opt) => opt.value === selected[0])?.label
            : `${label} (${selected.length})`;

    return (
        <div className="multi-select-filter" ref={containerRef}>
            <button type="button" className="multi-select-toggle" onClick={() => setOpen((isOpen) => !isOpen)}>
                {summary} &#9662;
            </button>
            {open ? (
                <div className="multi-select-panel">
                    {options.length === 0 ? (
                        <span className="multi-select-empty">No options</span>
                    ) : (
                        options.map((opt) => (
                            <label key={opt.value}>
                                <input
                                    type="checkbox"
                                    checked={selected.includes(opt.value)}
                                    onChange={() => onToggle(opt.value)}
                                />
                                {opt.label}
                            </label>
                        ))
                    )}
                    <button
                        type="button"
                        className="multi-select-clear"
                        onClick={onClear}
                        disabled={selected.length === 0}
                    >
                        Clear
                    </button>
                </div>
            ) : null}
        </div>
    );
}

export default function TasksPage() {

    const {tasks, dispatch: tasksDispatch} = useTasks();
    const {groups} = useGroups();
    const {users} = useUsers();
    const [openFolder, setOpenFolder] = useState(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState([]);
    const [priorityFilter, setPriorityFilter] = useState([]);
    const [labelFilter, setLabelFilter] = useState([]);
    const [assigneeFilter, setAssigneeFilter] = useState("all");
    const [sortBy, setSortBy] = useState("default");
    const [savedViews, setSavedViews] = useState([]);
    const [selectedView, setSelectedView] = useState("");
    const [viewNameInput, setViewNameInput] = useState("");
    const [importError, setImportError] = useState(null);
    const [importing, setImporting] = useState(false);
    const importInputRef = useRef(null);

    // assignee/label options depend on the open folder, so reset them when switching folders
    function openFolderView(folder) {
        setOpenFolder(folder);
        setAssigneeFilter("all");
        setLabelFilter([]);
    }

    function viewsStorageKey(folder) {
        return `taskFilterViews:${users.loggedIn?.email}:${folder}`;
    }

    // Saved views are per-user, per-folder (filter meaning/options differ across folders).
    // localStorage is an external system, so syncing it into state here is a legitimate
    // effect — the setState calls are deliberate, not an accidental render loop.
    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        if (!openFolder || !users.loggedIn) {
            setSavedViews([]);
            setSelectedView("");
            return;
        }
        try {
            const raw = localStorage.getItem(viewsStorageKey(openFolder));
            setSavedViews(raw ? JSON.parse(raw) : []);
        } catch {
            setSavedViews([]);
        }
        setSelectedView("");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openFolder, users.loggedIn?.email]);
    /* eslint-enable react-hooks/set-state-in-effect */

    function persistViews(views) {
        setSavedViews(views);
        try {
            localStorage.setItem(viewsStorageKey(openFolder), JSON.stringify(views));
        } catch {
            // localStorage unavailable — saved views just won't persist across reloads
        }
    }

    function saveCurrentView() {
        const name = viewNameInput.trim();
        if (!name) return;
        const view = {name, statusFilter, priorityFilter, labelFilter, assigneeFilter, sortBy, search};
        persistViews([...savedViews.filter((v) => v.name !== name), view]);
        setSelectedView(name);
        setViewNameInput("");
    }

    function applyView(name) {
        setSelectedView(name);
        const view = savedViews.find((v) => v.name === name);
        if (!view) return;
        setStatusFilter(view.statusFilter || []);
        setPriorityFilter(view.priorityFilter || []);
        setLabelFilter(view.labelFilter || []);
        setAssigneeFilter(view.assigneeFilter || "all");
        setSortBy(view.sortBy || "default");
        setSearch(view.search || "");
    }

    function deleteSelectedView() {
        if (!selectedView) return;
        persistViews(savedViews.filter((v) => v.name !== selectedView));
        setSelectedView("");
    }

    function exportCalendar(taskList) {
        downloadTasksIcs(taskList, `${openFolder === ALL_TASKS_FOLDER ? "all-tasks" : openGroup?.name}.ics`);
    }

    function exportJson(taskList) {
        downloadBlob("tasks.json", tasksToJson(taskList), "application/json");
    }

    function exportCsv(taskList) {
        downloadBlob("tasks.csv", tasksToCsv(taskList), "text/csv");
    }

    async function handleImportFile(event) {
        const file = event.target.files?.[0];
        if (!file) return;
        setImportError(null);
        setImporting(true);
        try {
            const text = await file.text();
            const parsedTasks = file.name.toLowerCase().endsWith(".csv")
                ? parseCsvTasks(text)
                : parseJsonTasks(text);

            for (const input of parsedTasks) {
                const body = {
                    ...input,
                    group: input.group || (openFolder !== ALL_TASKS_FOLDER ? openGroup?.name : "") || "",
                    assignee: input.assignee || users.loggedIn?.email || "",
                };
                const res = await fetch("/api/tasks", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(body),
                });
                const data = await res.json().catch(() => ({}));
                if (res.ok) {
                    tasksDispatch({type: "ADD_TASK", payload: data.task});
                }
            }
        } catch (err) {
            setImportError(err.message || "Failed to import file");
        } finally {
            setImporting(false);
            if (importInputRef.current) importInputRef.current.value = "";
        }
    }

    function toggleStatusFilter(value) {
        setStatusFilter((prev) =>
            prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
        );
    }

    function togglePriorityFilter(value) {
        setPriorityFilter((prev) =>
            prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
        );
    }

    function toggleLabelFilter(value) {
        setLabelFilter((prev) =>
            prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
        );
    }

    const userGroups = users.loggedIn?.groups || [];
    const userTasks = tasks.tasks.filter((t) => userGroups.includes(t.group));

    if (tasks.error) {
        return <div>Failed to load tasks: {tasks.error}</div>;
    }

    if (tasks.loading || groups.loading) {
        return <Loading label="Loading tasks…" />;
    }

    if (tasks.tasks.length === 0) {
        return <div className="tasks-empty">No tasks yet</div>;
    }

    const rootGroups = groups.groups.filter((g) => g.parentId == null);
    const accessibleRootGroups = rootGroups.filter((g) =>
        collectDescendantNames(groups.groups, g).some((name) => userGroups.includes(name))
    );

    if (!openFolder) {
        return (
            <div className="tasks-page">
                <div className="folders-container">
                    <Folder
                        key="all"
                        name="All tasks"
                        count={userTasks.length}
                        onOpen={() => openFolderView(ALL_TASKS_FOLDER)}
                    />
                    {accessibleRootGroups.map((group) => (
                        <Folder
                            key={group.id}
                            name={group.name}
                            count={countTasksForGroup(groups.groups, tasks.tasks, group)}
                            onOpen={() => openFolderView(group.id)}
                        />
                    ))}
                </div>
            </div>
        );
    }

    const openGroup = openFolder === ALL_TASKS_FOLDER
        ? null
        : groups.groups.find((g) => g.id === openFolder);

    // Opening a group the user isn't directly a member of (a pass-through
    // ancestor reached while drilling down) shows its sub-folders but no task list.
    const isMember = openFolder === ALL_TASKS_FOLDER || (openGroup && userGroups.includes(openGroup.name));
    const childGroups = openGroup ? getChildren(groups.groups, openGroup.id) : [];
    const breadcrumbPath = openGroup ? getGroupPath(groups.groups, openGroup.id) : [];

    const folderTasks = openFolder === ALL_TASKS_FOLDER
        ? userTasks
        : (isMember ? tasks.tasks.filter((t) => t.group === openGroup.name) : []);

    // assignee dropdown is populated with members of the open group, or — for the
    // "All tasks" folder — members of any group the logged-in user belongs to.
    const assigneeUsers = openFolder === ALL_TASKS_FOLDER
        ? users.users.filter((u) => (u.groups || []).some((g) => userGroups.includes(g)))
        : users.users.filter((u) => (u.groups || []).includes(openGroup?.name));

    const labelOptions = [...new Set(
        folderTasks.flatMap((t) => t.tags?.otherTags || [])
    )].map((label) => ({value: label, label}));

    const filteredTasks = folderTasks.filter((task) => {
        const matchesSearch = task.title
            .toLowerCase()
            .includes(search.trim().toLowerCase());
        const matchesStatus =
            statusFilter.length === 0 || statusFilter.includes(task.status);
        const matchesPriority =
            priorityFilter.length === 0 || priorityFilter.includes(String(task.priority));
        const matchesLabel =
            labelFilter.length === 0 ||
            (task.tags?.otherTags || []).some((l) => labelFilter.includes(l));
        const matchesAssignee =
            assigneeFilter === "all" || task.assignee === assigneeFilter;
        return matchesSearch && matchesStatus && matchesPriority && matchesLabel && matchesAssignee;
    });

    const dueTime = (task) => {
        const due = task.schedule?.dueDate;
        if (!due) return null;
        const ms = new Date(due).getTime();
        return Number.isNaN(ms) ? null : ms;
    };

    const sortedTasks = [...filteredTasks].sort((a, b) => {
        switch (sortBy) {
            case "priority-high":
                return a.priority - b.priority;
            case "priority-low":
                return b.priority - a.priority;
            case "date-asc":
            case "date-desc": {
                const av = dueTime(a);
                const bv = dueTime(b);
                if (av === null && bv === null) return 0;
                if (av === null) return 1; // tasks without a due date sort last
                if (bv === null) return -1;
                return sortBy === "date-asc" ? av - bv : bv - av;
            }
            default:
                return 0;
        }
    });

    return (
        <div className="tasks-page">
            <div className="tasks-folder-header">
                <div className="breadcrumb">
                    <button type="button" className="breadcrumb-link" onClick={() => openFolderView(null)}>
                        All folders
                    </button>
                    {openFolder === ALL_TASKS_FOLDER ? (
                        <>
                            <span className="breadcrumb-sep">/</span>
                            <span className="breadcrumb-current">All tasks</span>
                        </>
                    ) : (
                        breadcrumbPath.map((g, idx) => (
                            <span key={g.id}>
                                <span className="breadcrumb-sep">/</span>
                                {idx === breadcrumbPath.length - 1 ? (
                                    <span className="breadcrumb-current">{g.name}</span>
                                ) : (
                                    <button
                                        type="button"
                                        className="breadcrumb-link"
                                        onClick={() => openFolderView(g.id)}
                                    >
                                        {g.name}
                                    </button>
                                )}
                            </span>
                        ))
                    )}
                </div>
            </div>

            {childGroups.length > 0 ? (
                <div className="folders-container sub-folders">
                    {childGroups.map((group) => (
                        <Folder
                            key={group.id}
                            name={group.name}
                            count={countTasksForGroup(groups.groups, tasks.tasks, group)}
                            onOpen={() => openFolderView(group.id)}
                        />
                    ))}
                </div>
            ) : null}

            {isMember ? (
                <>
                    <div className="tasks-filters">
                        <input
                            type="text"
                            placeholder="Search by title"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <MultiSelectFilter
                            label="Statuses"
                            options={STATUSES.map((status) => ({value: status, label: status}))}
                            selected={statusFilter}
                            onToggle={toggleStatusFilter}
                            onClear={() => setStatusFilter([])}
                        />
                        <MultiSelectFilter
                            label="Priorities"
                            options={Object.entries(PRIORITY_LABELS).map(([value, label]) => ({value, label}))}
                            selected={priorityFilter}
                            onToggle={togglePriorityFilter}
                            onClear={() => setPriorityFilter([])}
                        />
                        <MultiSelectFilter
                            label="Labels"
                            options={labelOptions}
                            selected={labelFilter}
                            onToggle={toggleLabelFilter}
                            onClear={() => setLabelFilter([])}
                        />
                        <select
                            value={assigneeFilter}
                            onChange={(e) => setAssigneeFilter(e.target.value)}
                        >
                            <option value="all">All assignees</option>
                            {assigneeUsers.map((u) => {
                                const fullName = `${u.firstName || ""} ${u.lastName || ""}`.trim();
                                return (
                                    <option key={u.id} value={u.email}>
                                        {fullName ? `${fullName} (${u.email})` : u.email}
                                    </option>
                                );
                            })}
                        </select>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="default">Sort: default</option>
                            <option value="priority-high">Priority: high first</option>
                            <option value="priority-low">Priority: low first</option>
                            <option value="date-asc">Due date: soonest</option>
                            <option value="date-desc">Due date: latest</option>
                        </select>
                    </div>
                    <div className="saved-views">
                        <select
                            value={selectedView}
                            onChange={(e) => (e.target.value ? applyView(e.target.value) : setSelectedView(""))}
                        >
                            <option value="">Saved views…</option>
                            {savedViews.map((v) => (
                                <option key={v.name} value={v.name}>{v.name}</option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={deleteSelectedView}
                            disabled={!selectedView}
                        >
                            Delete view
                        </button>
                        <input
                            type="text"
                            placeholder="New view name"
                            value={viewNameInput}
                            onChange={(e) => setViewNameInput(e.target.value)}
                        />
                        <button type="button" onClick={saveCurrentView} disabled={!viewNameInput.trim()}>
                            Save current filters as view
                        </button>
                    </div>
                    <div className="data-import-export">
                        <button type="button" onClick={() => exportCalendar(sortedTasks)}>
                            Export calendar (.ics)
                        </button>
                        <button type="button" onClick={() => exportJson(sortedTasks)}>
                            Export JSON
                        </button>
                        <button type="button" onClick={() => exportCsv(sortedTasks)}>
                            Export CSV
                        </button>
                        <label className="import-tasks-label">
                            Import tasks
                            <input
                                type="file"
                                accept=".json,.csv"
                                ref={importInputRef}
                                onChange={handleImportFile}
                                disabled={importing}
                            />
                        </label>
                        {importing ? <span>Importing…</span> : null}
                        {importError ? <span className="field-error">{importError}</span> : null}
                    </div>
                    <div className="tasks-container">
                        {sortedTasks.length === 0 ? (
                            <div className="tasks-empty">
                                {folderTasks.length === 0
                                    ? "No tasks in this folder"
                                    : "No tasks match the filters"}
                            </div>
                        ) : (
                            sortedTasks.map((task) => (
                                <Task key={task.id} task={task} />
                            ))
                        )}
                    </div>
                </>
            ) : (
                <div className="tasks-empty">
                    You are not a member of this project — browse its sub-folders above.
                </div>
            )}
        </div>
    )
}
