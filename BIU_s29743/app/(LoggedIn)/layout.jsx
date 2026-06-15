"use client"

import Navbar from "./components/Navbar";
import "../contexts/TasksContext";
import {TasksProvider} from "../contexts/TasksContext";
import {UserProvider} from "../contexts/UsersContext";


export default ({children}) => {

    return (
        <>
            <UserProvider>
                <TasksProvider>
                    <Navbar/>
                    {children}
                </TasksProvider>
            </UserProvider>
        </>
    )
}
