"use client";

import {createContext, useContext, useState} from "react";

const TaskContext = createContext(null);

export function TasksProvider({ children }) {
    const [tasks, setTasks] = useState(null);
    const [tags, setTags] = useState(tagsDB);



    async function fetchData() {
        try {
            const res = await fetch("http://localhost:3000/api/tasks");
            const json = await res.json();
            setTasks(prevState => json);
        } catch (err) {
            console.error("Users API error:", err);
        }
    }


    return (
        <TaskContext.Provider
            value={{
                tasks,
                setTasks,
                tags,
                setTags,
                fetchData
            }}
        >
            {children}
        </TaskContext.Provider>
    );
}

export function useTasks() {
    const context = useContext(TaskContext);

    if (!context) {
        throw new Error("useTasks must be used inside AuthProvider");
    }

    return context;
}

let tagsDB = [
    "tag1", "tag2", "tag3"
]

