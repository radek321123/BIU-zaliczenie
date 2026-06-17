"use client"
import {useUsers} from "../../contexts/UsersContext";

export default () => {

    const {users} = useUsers();

    return (
        <div>
            <p>welcome{users.loggedIn ? `, ${users.loggedIn.email}` : ""}</p>
        </div>
    )
}