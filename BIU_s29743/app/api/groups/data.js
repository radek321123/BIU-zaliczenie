// In-memory groups list (mock DB), mirroring tasks/users.
// `parentId` (nullable) lets groups nest under one another, forming a
// folder/project hierarchy that the tasks page renders as drill-down folders.
// `permissions` maps a member's email to their role in this group/shared list:
// "read" (view only), "edit" (create/edit tasks), "manage" (also delete tasks).
// Members without an explicit entry default to "edit" (see getRole() helpers).
export let groupsDB = [
    { id: 1, name: "admin", parentId: null, permissions: { "s29743@pjwstk.edu.pl": "manage" } },
    { id: 2, name: "pjatk", parentId: null, permissions: { "s29743@pjwstk.edu.pl": "manage", "JK@gmail.com": "read" } },
    { id: 3, name: "Rumia", parentId: null, permissions: { "s29743@pjwstk.edu.pl": "manage", "JK2@gmail.pl": "edit" } },
    { id: 4, name: "pjatk-frontend", parentId: 2, permissions: { "s29743@pjwstk.edu.pl": "edit" } },
    { id: 5, name: "pjatk-backend", parentId: 2, permissions: {} },
];

export function nextGroupId() {
    return groupsDB.length ? Math.max(...groupsDB.map((g) => g.id)) + 1 : 1;
}
