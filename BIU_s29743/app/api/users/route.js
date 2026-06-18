import { NextResponse } from "next/server";
import { usersDB } from "./data";

export async function GET() {
    const safeUsers = usersDB.map(({ password, ...safeUser }) => safeUser);
    return NextResponse.json(safeUsers);
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

    const { email, password, action } = body;

    switch (action) {
        case "register": {
            if (!email || !password) {
                return NextResponse.json(
                    { error: "Username and password are required" },
                    { status: 400 }
                );
            }

            if (usersDB.some((u) => u.email === email)) {
                return NextResponse.json(
                    { error: "An account with this email already exists" },
                    { status: 409 }
                );
            }

            const user = {
                id: usersDB.length + 1,
                firstName: "",
                lastName: "",
                email: email,
                password: password,
                groups: [],
                notifyEmail: true,
                notifyFrequency: "immediate",
                notifyTypes: ["due_soon", "overdue", "assigned"],
            };

            usersDB.push(user);

            const { password: _password, ...safeUser } = user;
            return NextResponse.json(
                { message: "Register successful", user: safeUser },
                { status: 200 }
            );
        }

        case "login": {
            if (!email || !password) {
                return NextResponse.json(
                    { error: "Username and password are required" },
                    { status: 400 }
                );
            }

            const matchedUser = usersDB.find((u) => u.email === email && u.password === password);

            if (!matchedUser) {
                return NextResponse.json(
                    { error: "Invalid email or password" },
                    { status: 401 }
                );
            }

            const { password: _password, ...safeUser } = matchedUser;
            return NextResponse.json(
                { message: "Login successful", user: safeUser },
                { status: 200 }
            );
        }
    }


    return NextResponse.json(
        {error: "something went wrong, please try again later." },
        { status: 400 }
    );

}