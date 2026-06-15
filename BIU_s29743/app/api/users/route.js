import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json(usersDB);
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