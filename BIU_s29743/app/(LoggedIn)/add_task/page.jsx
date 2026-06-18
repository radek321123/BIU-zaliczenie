"use client"

import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { useTasks } from "../../contexts/TasksContext";
import { useUsers } from "../../contexts/UsersContext";
import { useGroups } from "../../contexts/GroupsContext";
import Loading from "../../components/Loading";

const REPEAT_PRESETS = {
    daily: { days: 1, hours: 0 },
    weekly: { days: 7, hours: 0 },
    monthly: { days: 30, hours: 0 },
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={pending}>
            {pending ? "Adding…" : "Add task"}
        </button>
    );
}

export default function AddTask() {
    const router = useRouter();
    const { dispatch } = useTasks();
    const { users } = useUsers();
    const { groups } = useGroups();

    const userGroups = users.loggedIn?.groups || [];
    // "read"-only members can browse a shared list but not add tasks to it.
    const availableGroups = groups.groups.filter(
        (g) => userGroups.includes(g.name) && (g.permissions?.[users.loggedIn?.email] || "edit") !== "read"
    );

    const [attachments, setAttachments] = useState([""]);

    function handleAttachmentChange(index, value) {
        setAttachments((prev) => prev.map((a, i) => (i === index ? value : a)));
    }

    function addAttachmentField() {
        setAttachments((prev) => [...prev, ""]);
    }

    function removeAttachmentField(index) {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    }

    const [labels, setLabels] = useState([""]);

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
            title: "",
            description: "",
            notes: "",
            assignee: "",
            group: "",
            priority: "1",
            tagMain: "UI",
            progress: 0,
            startMode: "now",
            startDate: "",
            dueDate: "",
            repeatEnabled: false,
            repeatFrequency: "daily",
            repeatDays: REPEAT_PRESETS.daily.days,
            repeatHours: REPEAT_PRESETS.daily.hours,
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
                    const { startMode, startDate } = this.parent;
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
        onSubmit: async (values, { setStatus }) => {
            setStatus(undefined);
            try {
                const schedule = {
                    mode: values.startMode,
                    startDate: values.startMode === "scheduled" ? (values.startDate || null) : null,
                    dueDate: values.dueDate || null,
                    repeat: values.repeatEnabled
                        ? { days: Number(values.repeatDays) || 0, hours: Number(values.repeatHours) || 0 }
                        : null,
                };

                const res = await fetch("/api/tasks", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: values.title,
                        description: values.description,
                        notes: values.notes,
                        assignee: values.assignee,
                        group: values.group,
                        priority: values.priority,
                        tagMain: values.tagMain,
                        progress: values.progress,
                        otherTags: labels,
                        attachments,
                        schedule,
                    }),
                });

                const data = await res.json().catch(() => ({}));

                if (!res.ok) {
                    throw new Error(data.error || "Failed to add task");
                }

                dispatch({ type: "ADD_TASK", payload: data.task });
                router.push("/tasks");
            } catch (err) {
                setStatus(err.message);
            }
        },
    });

    if (groups.loading) {
        return (
            <div className="add-task-page">
                <div className="add-task-interface">
                    <Loading label="Loading groups…" />
                </div>
            </div>
        );
    }

    const fieldError = (name) =>
        formik.touched[name] && formik.errors[name] ? (
            <span className="field-error">{formik.errors[name]}</span>
        ) : null;

    const assigneeOptions = formik.values.group
        ? users.users.filter((u) => (u.groups || []).includes(formik.values.group))
        : [];

    function handleGroupChange(event) {
        formik.setFieldValue("group", event.target.value);
        formik.setFieldValue("assignee", "");
    }

    function handleRepeatFrequencyChange(event) {
        const frequency = event.target.value;
        formik.setFieldValue("repeatFrequency", frequency);
        if (frequency !== "custom") {
            formik.setFieldValue("repeatDays", REPEAT_PRESETS[frequency].days);
            formik.setFieldValue("repeatHours", REPEAT_PRESETS[frequency].hours);
        }
    }

    return (
        <div className="add-task-page">
            <div className="add-task-interface">
                <form action={() => formik.submitForm()}>
                    <h3>Add new task</h3>

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

                    <label htmlFor="group">Group</label>
                    <select
                        name="group"
                        id="group"
                        onChange={handleGroupChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.group}
                    >
                        <option value="">Select a group</option>
                        {availableGroups.map((g) => (
                            <option key={g.id} value={g.name}>{g.name}</option>
                        ))}
                    </select>
                    {fieldError("group")}

                    <label htmlFor="assignee">Assignee</label>
                    <select
                        name="assignee"
                        id="assignee"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.assignee}
                        disabled={!formik.values.group}
                    >
                        <option value="">
                            {formik.values.group ? "Select an assignee" : "Select a group first"}
                        </option>
                        {assigneeOptions.map((u) => {
                            const fullName = `${u.firstName || ""} ${u.lastName || ""}`.trim();
                            return (
                                <option key={u.id} value={u.email}>
                                    {fullName ? `${fullName} (${u.email})` : u.email}
                                </option>
                            );
                        })}
                    </select>
                    {fieldError("assignee")}

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

                    <label htmlFor="progress">Progress ({formik.values.progress}%)</label>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        name="progress"
                        id="progress"
                        onChange={formik.handleChange}
                        value={formik.values.progress}
                    />

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

                    <SubmitButton />
                </form>
            </div>
        </div>
    )
}
