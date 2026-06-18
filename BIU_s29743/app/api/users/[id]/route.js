import { NextResponse } from "next/server";
import { usersDB } from "../data";

export async function PATCH(request, { params }) {
    const { id } = await params;
    const index = usersDB.findIndex((u) => u.id === Number(id));

    if (index === -1) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { email, id: bodyId, password, ...rest } = body;

    const updated = { ...usersDB[index], ...rest };

    if (password) {
        updated.password = password;
    }

    usersDB[index] = updated;

    const { password: _password, ...safeUser } = usersDB[index];
    return NextResponse.json({ message: "User updated", user: safeUser });
}
