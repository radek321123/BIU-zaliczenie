"use client";

import {createContext, useContext, useEffect, useReducer, useState} from "react";
import {initialUsersState, userReducer} from "../reducers/UserReducer";

const UserContext = createContext(null);

export function UsersProvider({ children }) {
    const [users, dispatch] = useReducer(userReducer, initialUsersState);

    useEffect(() => {
        fetchData();
    }, [dispatch]);

    async function fetchData() {
        try {
            const res = await fetch("http://localhost:3000/api/users");
            const json = await res.json();
            for (const task of json) {
                dispatch({
                    type: 'LOGIN_USER',
                    payload: task,
                });
            }

        } catch (err) {
            console.error("Users API error:", err);
        }
    }

    return (
        <UserContext.Provider
            value={{
                users,
                dispatch,
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

export function useUsers() {
    const context = useContext(UserContext);

    if (!context) {
        throw new Error("useUsers must be used inside Provider");
    }

    return context;
}

