// In-memory groups list (mock DB), mirroring tasks/users.
export let groupsDB = [
    { id: 1, name: "admin" },
    { id: 2, name: "pjatk" },
    { id: 3, name: "Rumia" },
];

export function nextGroupId() {
    return groupsDB.length ? Math.max(...groupsDB.map((g) => g.id)) + 1 : 1;
}
