"use client";

import {createContext, useContext, useEffect, useReducer} from "react";
import {taskReducer, initialTaskState} from "../reducers/TaskReducer";

const TaskContext = createContext(null);

export function TasksProvider({ children }) {
    const [tasks, dispatch] = useReducer(taskReducer, initialTaskState);

    async function fetchData() {
        dispatch({ type: 'FETCH_START' });
        try {
            const res = await fetch("/api/tasks");
            const json = await res.json();
            dispatch({ type: 'FETCH_SUCCESS', payload: json });
        } catch (err) {
            console.error("Tasks API error:", err);
            dispatch({ type: 'FETCH_ERROR', payload: err.message });
        }
    }

    useEffect(() => {
        if (tasks.tasks.length === 0) {
            fetchData();
        }
    }, []);

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

