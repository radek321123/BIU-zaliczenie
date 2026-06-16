import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json(usersDB);
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

    const { username, password } = body;

    if (!username || !password) {
        return NextResponse.json(
            { error: "Username and password are required" },
            { status: 400 }
        );
    }

    // Match username against the email field
    const user = users.find((u) => u.email === username);

    if (!user || user.password !== password) {
        // Same message for both cases so you don't leak which one was wrong
        return NextResponse.json(
            { error: "Invalid credentials" },
            { status: 401 }
        );
    }

    // Don't send the password back to the client
    const { password: _pw, ...safeUser } = user;

    return NextResponse.json(
        { message: "Login successful", user: safeUser },
        { status: 200 }
    );
}


let usersDB = [
    {
        id: 1,
        fName: "Radosław",
        lName: "Krawiec",
        email: "s29743@pjwstk.edu.pl",
        password: "admin123",
        groups: ["admin", "pjatk", "Rumia"]
    },
    {
        id: 2,
        fName: "Jan",
        lName: "Kowalski",
        email: "JK@gmail.com",
        password: "jankowalski123",
        groups: ["pjatk"]
    },
    {
        id: 3,
        fName: "Janina",
        lName: "Kowalska",
        email: "JK2@gmail.pl",
        password: "JK123",
        groups: ["Rumia"]
    }
]