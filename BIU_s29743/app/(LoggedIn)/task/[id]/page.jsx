"use client"

import {useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {useFormik} from "formik";
import * as Yup from "yup";
import {useFormStatus} from "react-dom";
import {useTasks} from "../../../contexts/TasksContext";
import {useUsers} from "../../../contexts/UsersContext";
import {useGroups} from "../../../contexts/GroupsContext";
import {downloadTaskIcs} from "../../../lib/exportUtils";
import {deriveStatusFromProgress} from "../../../lib/taskStatus";
import Loading from "../../../components/Loading";

const priorities = {
    1: "Critical",
    2: "High",
    3: "Moderate",
    4: "Low",
    5: "Optional",
};

const REPEAT_PRESETS = {
    daily: { days: 1, hours: 0 },
    weekly: { days: 7, hours: 0 },
    monthly: { days: 30, hours: 0 },
};

function inferRepeatFrequency(repeat) {
    if (!repeat) return "daily";
    const match = Object.entries(REPEAT_PRESETS).find(
        ([, preset]) => preset.days === repeat.days && preset.hours === repeat.hours
    );
    return match ? match[0] : "custom";
}

// Members without an explicit permissions entry default to "edit" — only an
// explicit "read" or "manage" entry changes what they can do with the task.
function getRole(group, email) {
    return group?.permissions?.[email] || "edit";
}

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

function toDatetimeLocalValue(value) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function SubmitButton() {
    const {pending} = useFormStatus();
    return (
        <button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save changes"}
        </button>
    );
}

function EditTaskForm({task, users, groups, onCancel, onSaved}) {
    const [attachments, setAttachments] = useState(
        task.attachments?.length ? task.attachments : [""]
    );

    function handleAttachmentChange(index, value) {
        setAttachments((prev) => prev.map((a, i) => (i === index ? value : a)));
    }

    function addAttachmentField() {
        setAttachments((prev) => [...prev, ""]);
    }

    function removeAttachmentField(index) {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    }

    const [labels, setLabels] = useState(
        task.tags?.otherTags?.length ? task.tags.otherTags : [""]
    );

    function handleLabelChange(index, value) {
        setLabels((prev) => prev.map((l, i) => (i === index ? value : l)));
    }

    function addLabelField() {
        setLabels((prev) => [...prev, ""]);
    }

    function removeLabelField(index) {
        setLabels((prev) => prev.filter((_, i) => i !== index));
    }

    const formik = useFormik({
        initialValues: {
            title: task.title || "",
            description: task.description || "",
            notes: task.notes || "",
            assignee: task.assignee || "",
            group: task.group || "",
            priority: String(task.priority || 1),
            tagMain: task.tags?.main || "",
            progress: task.progress ?? 0,
            startMode: task.schedule?.mode === "scheduled" ? "scheduled" : "now",
            startDate: toDatetimeLocalValue(task.schedule?.startDate),
            dueDate: toDatetimeLocalValue(task.schedule?.dueDate),
            repeatEnabled: !!task.schedule?.repeat,
            repeatFrequency: inferRepeatFrequency(task.schedule?.repeat),
            repeatDays: task.schedule?.repeat?.days ?? REPEAT_PRESETS.daily.days,
            repeatHours: task.schedule?.repeat?.hours ?? REPEAT_PRESETS.daily.hours,
        },
        validationSchema: Yup.object({
            title: Yup.string().trim().required("Title is required"),
            assignee: Yup.string().trim().required("Assignee is required"),
            group: Yup.string().trim().required("Group is required"),
            startMode: Yup.string().oneOf(["now", "scheduled"]).required(),
            startDate: Yup.string().when("startMode", {
                is: "scheduled",
                then: (s) => s.required("Pick a start date and time"),
                otherwise: (s) => s.notRequired(),
            }),
            dueDate: Yup.string().test(
                "due-after-start",
                "Due date must be after the start date",
                function (value) {
                    const {startMode, startDate} = this.parent;
                    if (!value || startMode !== "scheduled" || !startDate) return true;
                    return new Date(value) > new Date(startDate);
                }
            ),
            repeatDays: Yup.number()
                .transform((v, orig) => (orig === "" ? 0 : v))
                .min(0, "Days cannot be negative")
                .when("repeatEnabled", {
                    is: true,
                    then: (s) => s.test(
                        "interval-positive",
                        "Set days and/or hours above 0",
                        function () {
                            const days = Number(this.parent.repeatDays) || 0;
                            const hours = Number(this.parent.repeatHours) || 0;
                            return days * 24 + hours > 0;
                        }
                    ),
                }),
            repeatHours: Yup.number()
                .transform((v, orig) => (orig === "" ? 0 : v))
                .min(0, "Hours cannot be negative"),
        }),
        onSubmit: async (values, {setStatus}) => {
            setStatus(undefined);
            try {
                const schedule = {
                    mode: values.startMode,
                    startDate: values.startMode === "scheduled" ? (values.startDate || null) : null,
                    dueDate: values.dueDate || null,
                    repeat: values.repeatEnabled
                        ? {days: Number(values.repeatDays) || 0, hours: Number(values.repeatHours) || 0}
                        : null,
                };

                const res = await fetch(`/api/tasks/${task.id}`, {
                    method: "PATCH",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        title: values.title,
                        description: values.description,
                        notes: values.notes,
                        assignee: values.assignee,
                        group: values.group,
                        priority: Number(values.priority),
                        progress: Number(values.progress),
                        tags: {
                            ...task.tags,
                            main: values.tagMain,
                            otherTags: labels.map((l) => l.trim()).filter(Boolean),
                        },
                        attachments: attachments.map((a) => a.trim()).filter(Boolean),
                        schedule,
                    }),
                });

                const data = await res.json().catch(() => ({}));

                if (!res.ok) {
                    throw new Error(data.error || "Failed to update task");
                }

                onSaved(data.task);
            } catch (err) {
                setStatus(err.message);
            }
        },
    });

    const fieldError = (name) =>
        formik.touched[name] && formik.errors[name] ? (
            <span className="field-error">{formik.errors[name]}</span>
        ) : null;

    function handleRepeatFrequencyChange(event) {
        const frequency = event.target.value;
        formik.setFieldValue("repeatFrequency", frequency);
        if (frequency !== "custom") {
            formik.setFieldValue("repeatDays", REPEAT_PRESETS[frequency].days);
            formik.setFieldValue("repeatHours", REPEAT_PRESETS[frequency].hours);
        }
    }

    return (
        <form action={() => formik.submitForm()}>
            <h3>Edit task</h3>

            <label htmlFor="title">Title</label>
            <input
                type="text"
                name="title"
                id="title"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.title}
            />
            {fieldError("title")}

            <label htmlFor="description">Description</label>
            <textarea
                name="description"
                id="description"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.description}
            />

            <label htmlFor="notes">Notes</label>
            <textarea
                name="notes"
                id="notes"
                placeholder="Additional notes (separate from the description)"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.notes}
            />

            <label htmlFor="assignee">Assignee</label>
            <select
                name="assignee"
                id="assignee"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.assignee}
            >
                <option value="">Select an assignee</option>
                {users.users.map((u) => {
                    const fullName = `${u.firstName || ""} ${u.lastName || ""}`.trim();
                    return (
                        <option key={u.id} value={u.email}>
                            {fullName ? `${fullName} (${u.email})` : u.email}
                        </option>
                    );
                })}
            </select>
            {fieldError("assignee")}

            <label htmlFor="group">Group</label>
            <select
                name="group"
                id="group"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.group}
            >
                <option value="">Select a group</option>
                {groups.groups.map((g) => (
                    <option key={g.id} value={g.name}>{g.name}</option>
                ))}
            </select>
            {fieldError("group")}

            <label htmlFor="priority">Priority</label>
            <select
                name="priority"
                id="priority"
                onChange={formik.handleChange}
                value={formik.values.priority}
            >
                <option value="1">Critical</option>
                <option value="2">High</option>
                <option value="3">Medium</option>
                <option value="4">Low</option>
                <option value="5">Optional</option>
            </select>

            <label htmlFor="tagMain">Tag</label>
            <select
                name="tagMain"
                id="tagMain"
                onChange={formik.handleChange}
                value={formik.values.tagMain}
            >
                <option value="UI">UI</option>
                <option value="Test">Test</option>
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
                <option value="Validation">Validation</option>
                <option value="TEMP">TEMP</option>
            </select>

            <div className="task-progress">
                <label htmlFor="progress">
                    Progress ({formik.values.progress}% — {deriveStatusFromProgress(Number(formik.values.progress))})
                </label>
                <input
                    type="range"
                    min="0"
                    max="100"
                    name="progress"
                    id="progress"
                    className="progress-slider"
                    style={{"--progress-value": `${formik.values.progress}%`}}
                    onChange={formik.handleChange}
                    value={formik.values.progress}
                />
            </div>

            <fieldset className="labels-section">
                <legend>Labels</legend>
                <div className="labels-list">
                    {labels.map((value, index) => (
                        <div className="label-row" key={index}>
                            <input
                                type="text"
                                placeholder="e.g. urgent"
                                value={value}
                                onChange={(e) => handleLabelChange(index, e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => removeLabelField(index)}
                                disabled={labels.length === 1}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
                <button type="button" className="add-label" onClick={addLabelField}>
                    + Add label
                </button>
            </fieldset>

            <fieldset className="attachments-section">
                <legend>Attachments / links</legend>
                <div className="attachments-list">
                    {attachments.map((value, index) => (
                        <div className="attachment-row" key={index}>
                            <input
                                type="text"
                                placeholder="https://..."
                                value={value}
                                onChange={(e) => handleAttachmentChange(index, e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => removeAttachmentField(index)}
                                disabled={attachments.length === 1}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
                <button type="button" className="add-attachment" onClick={addAttachmentField}>
                    + Add link
                </button>
            </fieldset>

            <fieldset className="schedule-section">
                <legend>Scheduling</legend>

                <div className="schedule-mode">
                    <label>
                        <input
                            type="radio"
                            name="startMode"
                            value="now"
                            checked={formik.values.startMode === "now"}
                            onChange={formik.handleChange}
                        />
                        Start now
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="startMode"
                            value="scheduled"
                            checked={formik.values.startMode === "scheduled"}
                            onChange={formik.handleChange}
                        />
                        Schedule for later
                    </label>
                </div>

                {formik.values.startMode === "scheduled" ? (
                    <>
                        <label htmlFor="startDate">Start at</label>
                        <input
                            type="datetime-local"
                            name="startDate"
                            id="startDate"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.startDate}
                        />
                        {fieldError("startDate")}
                    </>
                ) : null}

                <label htmlFor="dueDate">Due by</label>
                <input
                    type="datetime-local"
                    name="dueDate"
                    id="dueDate"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.dueDate}
                />
                {fieldError("dueDate")}

                <label className="repeat-toggle" htmlFor="repeatEnabled">
                    <input
                        type="checkbox"
                        name="repeatEnabled"
                        id="repeatEnabled"
                        onChange={formik.handleChange}
                        checked={formik.values.repeatEnabled}
                    />
                    Repeat this task
                </label>

                {formik.values.repeatEnabled ? (
                    <div className="repeat-interval">
                        <label htmlFor="repeatFrequency">Repeat frequency</label>
                        <select
                            name="repeatFrequency"
                            id="repeatFrequency"
                            onChange={handleRepeatFrequencyChange}
                            value={formik.values.repeatFrequency}
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="custom">Custom</option>
                        </select>

                        {formik.values.repeatFrequency === "custom" ? (
                            <>
                                <label htmlFor="repeatDays">Every — days</label>
                                <input
                                    type="number"
                                    min="0"
                                    name="repeatDays"
                                    id="repeatDays"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.repeatDays}
                                />
                                <label htmlFor="repeatHours">hours</label>
                                <input
                                    type="number"
                                    min="0"
                                    name="repeatHours"
                                    id="repeatHours"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.repeatHours}
                                />
                                {fieldError("repeatDays")}
                                {fieldError("repeatHours")}
                            </>
                        ) : null}
                    </div>
                ) : null}
            </fieldset>

            {formik.status ? <span className="field-error">{formik.status}</span> : null}

            <div className="task-edit-actions">
                <SubmitButton/>
                <button type="button" onClick={onCancel}>Cancel</button>
            </div>
        </form>
    );
}

export default function TaskDetail() {
    const {id} = useParams();
    const router = useRouter();
    const {tasks, dispatch} = useTasks();
    const {users} = useUsers();
    const {groups} = useGroups();
    const [isEditing, setIsEditing] = useState(false);

    const task = tasks.tasks.find((t) => t.id === Number(id));

    if (tasks.loading || groups.loading) {
        return <Loading label="Loading task…" />;
    }

    if (!task) {
        return <div>Task not found</div>;
    }

    const taskGroup = groups.groups.find((g) => g.name === task.group);
    const role = getRole(taskGroup, users.loggedIn?.email);
    const canEdit = role !== "read";
    const canManage = role === "manage";

    async function handleProgressChange(event) {
        const progress = Number(event.target.value);
        const res = await fetch(`/api/tasks/${task.id}`, {
            method: "PATCH",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({progress, status: deriveStatusFromProgress(progress)}),
        });

        if (res.ok) {
            const data = await res.json();
            dispatch({type: "UPDATE_TASK", payload: data.task});
        }
    }

    async function handleDelete() {
        const res = await fetch(`/api/tasks/${task.id}`, {method: "DELETE"});

        if (res.ok) {
            dispatch({type: "DELETE_TASK", payload: task.id});
            router.push("/tasks");
        }
    }

    function handleSaved(updatedTask) {
        dispatch({type: "UPDATE_TASK", payload: updatedTask});
        setIsEditing(false);
    }

    if (isEditing) {
        return (
            <div className="task-detail task-detail-editing">
                <div className="task-detail-interface">
                    <EditTaskForm
                        task={task}
                        users={users}
                        groups={groups}
                        onCancel={() => setIsEditing(false)}
                        onSaved={handleSaved}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="task-detail">
            <div className="task-detail-interface">
                <h1>{task.title}</h1>
                {task.description ? <p>{task.description}</p> : null}
                {task.notes ? (
                    <div className="task-notes">
                        <h3>Notes</h3>
                        <p>{task.notes}</p>
                    </div>
                ) : null}
                <p className={"priority" + task.priority}>{priorities[task.priority]}</p>
                <p>Assignee: {task.assignee}</p>
                <p>Group: {task.group}</p>
                <p>Your role: {role}</p>
                <p>Tag: {task.tags?.main}</p>

                {task.tags?.otherTags?.length > 0 ? (
                    <div className="task-labels">
                        {task.tags.otherTags.map((label) => (
                            <span key={label} className="label-chip">{label}</span>
                        ))}
                    </div>
                ) : null}

                {task.attachments?.length > 0 ? (
                    <div className="task-attachments">
                        <h3>Attachments</h3>
                        <ul>
                            {task.attachments.map((url, index) => (
                                <li key={index}>
                                    <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}

                <div className="task-progress">
                    <label htmlFor="progress">Progress ({task.progress ?? 0}% — {task.status})</label>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        id="progress"
                        className="progress-slider"
                        style={{"--progress-value": `${task.progress ?? 0}%`}}
                        value={task.progress ?? 0}
                        disabled={!canEdit}
                        onChange={canEdit ? handleProgressChange : undefined}
                    />
                </div>

                <div className="task-schedule">
                    <h3>Schedule</h3>
                    <p>Mode: {task.schedule?.mode === "scheduled" ? "Scheduled" : "Start now"}</p>
                    <p>Starts: {formatDateTime(task.schedule?.startDate)}</p>
                    <p>Due: {formatDateTime(task.schedule?.dueDate)}</p>
                    <p>Repeat: {formatRepeat(task.schedule?.repeat)}</p>
                    {task.schedule?.dueDate ? (
                        <button type="button" className="add-to-calendar" onClick={() => downloadTaskIcs(task)}>
                            Add to calendar (.ics)
                        </button>
                    ) : null}
                </div>

                <div className="task-detail-actions">
                    {canEdit ? <button onClick={() => setIsEditing(true)}>Edit task</button> : null}
                    {canManage ? <button onClick={handleDelete}>Delete task</button> : null}
                </div>
            </div>
        </div>
    );
}
