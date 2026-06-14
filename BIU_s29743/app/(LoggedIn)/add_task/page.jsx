export default () => {
    return (
        <form>
            <h3> Add new task</h3>
            <label htmlFor="title">Title</label>
            <input type="text" name="title" id="title" />
            <label htmlFor="description">Description</label>
            <textarea name="description" id="description" />
            <label htmlFor="priority">Priority:</label>
            <select name="priority" id="priority">
                <option value="1">Critical</option>
                <option value="2">High</option>
                <option value="3">Medium</option>
                <option value="4">Low</option>
                <option value="5">Optional</option>
            </select>
            <label htmlFor="tags">Priority:</label>
            <select name="tags" id="tags">
                <option value="1">UI</option>
                <option value="2">Test</option>
                <option value="3">Manual</option>
                <option value="4">Automatic</option>
                <option value="5">Validation</option>
                <option value="5">TEMP</option>
            </select>
            <p>
                start now?
            </p>
            <label htmlFor="start-date">Start:</label>
            <input type="datetime-local" name="start-date" id="start-date" />
            <label htmlFor="end-date">Start:</label>
            <input type="datetime-local" name="end-date" id="end-date" />
            <p>
                repeat checkmark?
            </p>
            <label htmlFor="days">Days:</label>
            <input type="number" name="days" id="days" />
            <label htmlFor="hours">Hours:</label>
            <input type="number" name="hours" id="hours" />
            <button>Add task</button>
        </form>
    )
}