"use client"

export default ({name, count, onOpen}) => {

    return (
        <div className="folder" onClick={onOpen}>
            <p className="folder-name">{name}</p>
            <p className="folder-count">{count} task{count === 1 ? "" : "s"}</p>
        </div>
    )
}
