"use client"

import Navbar from "./components/Navbar";
import {TasksProvider} from "../contexts/TasksContext";
import {GroupsProvider} from "../contexts/GroupsContext";


export default function LoggedInLayout({children}) {

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
