"use client";

import {createContext, useContext, useEffect, useReducer, useState} from "react";
import {taskReducer, initialTaskState} from "../reducers/TaskReducer";

const TaskContext = createContext(null);

export function TasksProvider({ children }) {
    const [tasks, dispatch] = useReducer(taskReducer, initialTaskState);

    useEffect(() => {
        fetchData();
    }, [dispatch]);

    async function fetchData() {
        try {
            const res = await fetch("http://localhost:3000/api/tasks");
            const json = await res.json();
            for (const task of json) {
                dispatch({
                    type: 'ADD_TASK',
                    payload: task,
                });
            }

        } catch (err) {
            console.error("Tasks API error:", err);
        }
    }

    return (
        <TaskContext.Provider
            value={{
                tasks,
                dispatch,
            }}
        >
            {children}
        </TaskContext.Provider>
    );
}

export function useTasks() {
    const context = useContext(TaskContext);

    if (!context) {
        throw new Error("useTasks must be used inside Provider");
    }

    return context;
}

