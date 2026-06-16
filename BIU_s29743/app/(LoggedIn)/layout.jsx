"use client"

import Navbar from "./components/Navbar";
import "../contexts/TasksContext";
import {TasksProvider} from "../contexts/TasksContext";
import {UsersProvider} from "../contexts/UsersContext";


export default ({children}) => {

    return (
        <div className="App">
            <UsersProvider>
                <TasksProvider>
                    <Navbar/>
                    {children}
                </TasksProvider>
            </UsersProvider>
        </div>
    )
}
