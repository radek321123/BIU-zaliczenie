"use client";

import {createContext, useContext, useEffect, useState} from "react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
    const [users, setUsers] = useState([]);


    async function fetchData() {
        try {
            const res = await fetch("/api/users");
            const json = await res.json();
            setUsers(json);
        } catch (err) {
            console.error("Users API error:", err);
        }
    }

    return (
        <UserContext.Provider
            value={{
                users,
                setUsers,
                fetchData
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

export function useUsers() {
    const context = useContext(UserContext);

    if (!context) {
        throw new Error("useUsers must be used inside AuthProvider");
    }

    return context;
}


