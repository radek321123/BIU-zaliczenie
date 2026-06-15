"use client"
import {useTasks} from "../../contexts/TasksContext";
import Task from "../components/Task";
import {useEffect} from "react";

export default function () {


    const allTasks = useTasks();

    useEffect(() => {
        if (allTasks.tasks===null) {
            allTasks.fetchData()
        }
    }, []);


    return (

        <div className="tasks-page">
            <div className="tasks-filters">
                filter
                filter
                filter
            </div>
            <div className="tasks-container">
                {allTasks.tasks?.map((task, index) => (
                    <Task key={task.id} task={task} />
                ))}
            </div>
        </div>


    )
}