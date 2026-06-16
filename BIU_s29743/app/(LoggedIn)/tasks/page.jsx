"use client"
import {useTasks} from "../../contexts/TasksContext";
import Task from "../components/Task";
import {useEffect} from "react";

export default function () {

    const {tasks, dispatch} = useTasks();

    useEffect(() => {
        if (tasks.tasks.size === 0) {
            tasks.fetchData()
        }
    }, []);

    if (tasks.tasks.size === 0) {
        return <div>Loading...</div>;
    }

    return (

        <div className="tasks-page">
            <div className="tasks-filters">
                filter
                filter
                filter
            </div>
            <div className="tasks-container">
                {tasks.tasks.map((task, index) => (
                    <Task key={task.id} task={task} />
                ))}
            </div>
        </div>


    )
}