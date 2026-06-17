"use client"
import {useTasks} from "../../contexts/TasksContext";
import Task from "../components/Task";

export default function TasksPage() {

    const {tasks} = useTasks();

    if (tasks.error) {
        return <div>Failed to load tasks: {tasks.error}</div>;
    }

    if (tasks.loading) {
        return <div>Loading...</div>;
    }

    if (tasks.tasks.length === 0) {
        return <div className="tasks-empty">No tasks yet</div>;
    }

    return (

        <div className="tasks-page">
            <div className="tasks-filters">
                filter
                filter
                filter
            </div>
            <div className="tasks-container">
                {tasks.tasks.map((task) => (
                    <Task key={task.id} task={task} />
                ))}
            </div>
        </div>


    )
}
