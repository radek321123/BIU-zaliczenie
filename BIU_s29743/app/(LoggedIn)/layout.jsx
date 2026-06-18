"use client"

import {useEffect} from "react";
import {useRouter} from "next/navigation";
import Navbar from "./components/Navbar";
import {TasksProvider} from "../contexts/TasksContext";
import {GroupsProvider} from "../contexts/GroupsContext";
import {useUsers} from "../contexts/UsersContext";


export default function LoggedInLayout({children}) {

    const router = useRouter();
    const {users} = useUsers();

    useEffect(() => {
        if (!users.loggedIn) {
            router.replace("/");
        }
    }, [users.loggedIn, router]);

    if (!users.loggedIn) {
        return null;
    }

    return (
        <div className="App">
            <GroupsProvider>
                <TasksProvider>
                    <Navbar/>
                    {children}
                </TasksProvider>
            </GroupsProvider>
        </div>
    )
}
