import { NextResponse } from "next/server";
import { groupsDB } from "../data";

export async function PATCH(request, { params }) {
    const { id } = await params;
    const index = groupsDB.findIndex((g) => g.id === Number(id));

    if (index === -1) {
        return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    groupsDB[index] = { ...groupsDB[index], ...body, id: groupsDB[index].id };

    return NextResponse.json({ message: "Group updated", group: groupsDB[index] });
}
