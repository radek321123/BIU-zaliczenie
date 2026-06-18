"use client"

import {useState} from "react";
import {useUsers} from "../../contexts/UsersContext";
import {useGroups} from "../../contexts/GroupsContext";
import Loading from "../../components/Loading";

export default function AdminPage() {
    const {users, dispatch: usersDispatch} = useUsers();
    const {groups, dispatch: groupsDispatch} = useGroups();
    const [newGroup, setNewGroup] = useState("");
    const [newGroupParentId, setNewGroupParentId] = useState("");
    const [groupError, setGroupError] = useState(null);
    const [savingUserId, setSavingUserId] = useState(null);

    const isAdmin = users.loggedIn?.groups?.includes("admin");

    if (!isAdmin) {
        return (
            <div className="admin-page">
                <div className="admin-interface">
                    <h1>Admin dashboard</h1>
                    <p>You do not have access to this page.</p>
                </div>
            </div>
        );
    }

    if (groups.loading || users.loading) {
        return (
            <div className="admin-page">
                <div className="admin-interface">
                    <Loading label="Loading admin dashboard…" />
                </div>
            </div>
        );
    }

    async function handleAddGroup(event) {
        event.preventDefault();
        setGroupError(null);

        const name = newGroup.trim();
        if (!name) {
            setGroupError("Group name is required");
            return;
        }

        try {
            const res = await fetch("/api/groups", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    name,
                    parentId: newGroupParentId ? Number(newGroupParentId) : null,
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data.error || "Failed to create group");
            }

            groupsDispatch({type: "ADD_GROUP", payload: data.group});
            setNewGroup("");
            setNewGroupParentId("");
        } catch (err) {
            setGroupError(err.message);
        }
    }

    function groupLabel(group) {
        const parent = groups.groups.find((g) => g.id === group.parentId);
        return parent ? `${parent.name} / ${group.name}` : group.name;
    }

    async function patchGroupPermissions(group, permissions) {
        const res = await fetch(`/api/groups/${group.id}`, {
            method: "PATCH",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({permissions}),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
            groupsDispatch({type: "UPDATE_GROUP", payload: data.group});
        }
    }

    async function toggleUserGroup(user, group) {
        const current = user.groups || [];
        const isMember = current.includes(group.name);
        const nextGroups = isMember
            ? current.filter((g) => g !== group.name)
            : [...current, group.name];

        setSavingUserId(user.id);
        try {
            const res = await fetch(`/api/users/${user.id}`, {
                method: "PATCH",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({groups: nextGroups}),
            });

            const data = await res.json().catch(() => ({}));

            if (res.ok) {
                usersDispatch({type: "UPDATE_USER", payload: data.user});
            }

            const nextPermissions = {...(group.permissions || {})};
            if (isMember) {
                delete nextPermissions[user.email];
            } else if (!nextPermissions[user.email]) {
                nextPermissions[user.email] = "edit";
            }
            await patchGroupPermissions(group, nextPermissions);
        } finally {
            setSavingUserId(null);
        }
    }

    async function updateUserRole(user, group, role) {
        await patchGroupPermissions(group, {...(group.permissions || {}), [user.email]: role});
    }

    return (
        <div className="admin-page">
            <div className="admin-interface">
                <h1>Admin dashboard</h1>

                <section className="admin-section">
                    <h2>Groups</h2>
                    <div className="admin-groups-list">
                        {groups.groups.length === 0 ? (
                            <span className="admin-group-chip empty">No groups yet</span>
                        ) : (
                            groups.groups.map((g) => (
                                <span key={g.id} className="admin-group-chip">{groupLabel(g)}</span>
                            ))
                        )}
                    </div>
                    <form className="admin-add-group" onSubmit={handleAddGroup}>
                        <input
                            type="text"
                            placeholder="New group name"
                            value={newGroup}
                            onChange={(e) => setNewGroup(e.target.value)}
                        />
                        <select
                            value={newGroupParentId}
                            onChange={(e) => setNewGroupParentId(e.target.value)}
                        >
                            <option value="">No parent (top-level)</option>
                            {groups.groups.map((g) => (
                                <option key={g.id} value={g.id}>{groupLabel(g)}</option>
                            ))}
                        </select>
                        <button type="submit">Add group</button>
                    </form>
                    {groupError ? <span className="field-error">{groupError}</span> : null}
                </section>

                <section className="admin-section">
                    <h2>Users</h2>
                    <div className="admin-users">
                        {users.users.map((user) => {
                            const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
                            return (
                                <div key={user.id} className="admin-user">
                                    <div className="admin-user-header">
                                        <strong>{fullName || user.email}</strong>
                                        <span className="admin-user-email">{user.email}</span>
                                    </div>
                                    <div className="admin-user-groups">
                                        {groups.groups.map((g) => {
                                            const isMember = (user.groups || []).includes(g.name);
                                            return (
                                                <label key={g.id} className="admin-group-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        checked={isMember}
                                                        disabled={savingUserId === user.id}
                                                        onChange={() => toggleUserGroup(user, g)}
                                                    />
                                                    {groupLabel(g)}
                                                    {isMember ? (
                                                        <select
                                                            className="admin-role-select"
                                                            value={g.permissions?.[user.email] || "edit"}
                                                            disabled={savingUserId === user.id}
                                                            onChange={(e) => updateUserRole(user, g, e.target.value)}
                                                        >
                                                            <option value="read">Read</option>
                                                            <option value="edit">Edit</option>
                                                            <option value="manage">Manage</option>
                                                        </select>
                                                    ) : null}
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>
        </div>
    );
}
