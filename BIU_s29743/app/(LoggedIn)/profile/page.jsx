"use client"

import {useState} from "react";
import {useFormik} from "formik";
import * as Yup from "yup";
import {useFormStatus} from "react-dom";
import {useUsers} from "../../contexts/UsersContext";

function SubmitButton() {
    const {pending} = useFormStatus();
    return (
        <button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save changes"}
        </button>
    );
}

const NOTIFY_TYPE_OPTIONS = [
    {value: "due_soon", label: "Due soon"},
    {value: "overdue", label: "Overdue"},
    {value: "assigned", label: "Assigned to me"},
];

function EditProfileForm({user, onCancel, onSaved}) {
    const formik = useFormik({
        initialValues: {
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            password: "",
            notifyEmail: user.notifyEmail ?? true,
            notifyFrequency: user.notifyFrequency || "immediate",
            notifyTypes: user.notifyTypes || ["due_soon", "overdue"],
        },
        validationSchema: Yup.object({
            firstName: Yup.string().trim().required("First name is required"),
            lastName: Yup.string().trim().required("Last name is required"),
            password: Yup.string().min(8, "Password must be at least 8 characters"),
        }),
        onSubmit: async (values, {setStatus}) => {
            setStatus(undefined);
            try {
                const body = {
                    firstName: values.firstName,
                    lastName: values.lastName,
                    notifyEmail: values.notifyEmail,
                    notifyFrequency: values.notifyFrequency,
                    notifyTypes: values.notifyTypes,
                };

                if (values.password) {
                    body.password = values.password;
                }

                const res = await fetch(`/api/users/${user.id}`, {
                    method: "PATCH",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(body),
                });

                const data = await res.json().catch(() => ({}));

                if (!res.ok) {
                    throw new Error(data.error || "Failed to update profile");
                }

                onSaved(data.user);
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
        <form action={() => formik.submitForm()}>
            <label htmlFor="firstName">First name</label>
            <input
                type="text"
                name="firstName"
                id="firstName"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.firstName}
            />
            {fieldError("firstName")}

            <label htmlFor="lastName">Last name</label>
            <input
                type="text"
                name="lastName"
                id="lastName"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.lastName}
            />
            {fieldError("lastName")}

            <label htmlFor="password">New password</label>
            <input
                type="password"
                name="password"
                id="password"
                placeholder="Leave blank to keep current password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
            />
            {fieldError("password")}

            <fieldset className="notify-settings">
                <legend>Notifications</legend>

                <label className="notify-email-toggle" htmlFor="notifyEmail">
                    <input
                        type="checkbox"
                        name="notifyEmail"
                        id="notifyEmail"
                        checked={formik.values.notifyEmail}
                        onChange={formik.handleChange}
                    />
                    Email notifications
                </label>

                <label htmlFor="notifyFrequency">Frequency</label>
                <select
                    name="notifyFrequency"
                    id="notifyFrequency"
                    value={formik.values.notifyFrequency}
                    onChange={formik.handleChange}
                >
                    <option value="immediate">Immediately</option>
                    <option value="daily">Daily digest</option>
                    <option value="weekly">Weekly digest</option>
                </select>

                <span className="notify-types-label">Notify me about</span>
                <div className="notify-types">
                    {NOTIFY_TYPE_OPTIONS.map((opt) => (
                        <label key={opt.value}>
                            <input
                                type="checkbox"
                                checked={formik.values.notifyTypes.includes(opt.value)}
                                onChange={() => {
                                    const next = formik.values.notifyTypes.includes(opt.value)
                                        ? formik.values.notifyTypes.filter((t) => t !== opt.value)
                                        : [...formik.values.notifyTypes, opt.value];
                                    formik.setFieldValue("notifyTypes", next);
                                }}
                            />
                            {opt.label}
                        </label>
                    ))}
                </div>
            </fieldset>

            {formik.status ? <span className="field-error">{formik.status}</span> : null}

            <div className="profile-edit-actions">
                <SubmitButton/>
                <button type="button" onClick={onCancel}>Cancel</button>
            </div>
        </form>
    );
}

export default function ProfilePage() {
    const {users, dispatch} = useUsers();
    const [isEditing, setIsEditing] = useState(false);

    const user = users.loggedIn;

    if (!user) {
        return null;
    }

    function handleSaved(updatedUser) {
        dispatch({type: "UPDATE_USER", payload: updatedUser});
        setIsEditing(false);
    }

    return (
        <div className="profile-page">
            <div className="profile-interface">
                <h1>Profile</h1>
                <p className="profile-email">{user.email}</p>

                {isEditing ? (
                    <EditProfileForm
                        user={user}
                        onCancel={() => setIsEditing(false)}
                        onSaved={handleSaved}
                    />
                ) : (
                    <>
                        <p><strong>First name:</strong> {user.firstName || "—"}</p>
                        <p><strong>Last name:</strong> {user.lastName || "—"}</p>
                        <p><strong>Groups:</strong></p>
                        <div className="profile-groups-list">
                            {(user.groups || []).length === 0 ? (
                                <span className="profile-group-chip empty">No groups</span>
                            ) : (
                                user.groups.map((name) => (
                                    <span key={name} className="profile-group-chip">{name}</span>
                                ))
                            )}
                        </div>

                        <p><strong>Notifications:</strong> {user.notifyEmail ? "Email on" : "Email off"}, {user.notifyFrequency || "immediate"}{(user.notifyTypes?.length ? ` — ${user.notifyTypes.join(", ")}` : "")}</p>

                        <div className="profile-actions">
                            <button onClick={() => setIsEditing(true)}>Edit profile</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
