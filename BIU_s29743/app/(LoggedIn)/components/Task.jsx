"use client"

export default ({task}) => {

    return (
        <div key={task.id} className="task">
            <p className="">{task.title}</p>
            <p className="">{task.priority}</p>
            <p className="">{task.tags.main}</p>
            <p className="">{task.assignee}</p>
            <p className="">{task.status}</p>
        </div>
        )
}