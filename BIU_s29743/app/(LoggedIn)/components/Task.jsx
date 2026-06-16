"use client"

import Link from "next/link";

const priorities = {
    1: "Critical",
    2: "High",
    3: "Moderate",
    4: "Low",
};

export default ({task}) => {

    return (
        <div key={task.id} className="task">
            <Link href={"task/" + task.id.toString()} className="">{task.title}</Link>
            <p className={"priority" + task.priority}>{priorities[task.priority]}</p>
            <p className="">{task.assignee}</p>
            <p className="">{task.group}</p>
            <p className="">{task.tags.main}</p>
            <p className="">{task.status}</p>
        </div>
        )
}