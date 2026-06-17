import { NextResponse } from "next/server";
import { groupsDB, nextGroupId } from "./data";

export async function GET() {
    return NextResponse.json(groupsDB);
}

export async function POST(request) {
    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { error: "Invalid JSON body" },
            { status: 400 }
        );
    }

    const name = (body?.name || "").trim();

    if (!name) {
        return NextResponse.json(
            { error: "Group name is required" },
            { status: 400 }
        );
    }

    if (groupsDB.some((g) => g.name.toLowerCase() === name.toLowerCase())) {
        return NextResponse.json(
            { error: "A group with this name already exists" },
            { status: 409 }
        );
    }

    const group = { id: nextGroupId(), name };
    groupsDB.push(group);

    return NextResponse.json(
        { message: "Group created", group },
        { status: 201 }
    );
}
