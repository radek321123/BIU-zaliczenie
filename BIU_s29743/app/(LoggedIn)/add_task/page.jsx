"use client"

import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { useTasks } from "../../contexts/TasksContext";
import { useUsers } from "../../contexts/UsersContext";
import { useGroups } from "../../contexts/GroupsContext";

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

    const formik = useFormik({
        initialValues: {
            title: "",
            description: "",
            assignee: "",
            group: "",
            priority: "1",
            tagMain: "UI",
            startMode: "now",
            startDate: "",
            dueDate: "",
            repeatEnabled: false,
            repeatDays: "",
            repeatHours: "",
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
                        assignee: values.assignee,
                        group: values.group,
                        priority: values.priority,
                        tagMain: values.tagMain,
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

    const fieldError = (name) =>
        formik.touched[name] && formik.errors[name] ? (
            <span className="field-error">{formik.errors[name]}</span>
        ) : null;

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
