"use client";

import {createContext, useContext, useEffect, useReducer} from "react";
import {initialGroupsState, groupsReducer} from "../reducers/GroupsReducer";

const GroupContext = createContext(null);

export function GroupsProvider({ children }) {
    const [groups, dispatch] = useReducer(groupsReducer, initialGroupsState);

    async function fetchData() {
        dispatch({ type: 'FETCH_START' });
        try {
            const res = await fetch("/api/groups");
            const json = await res.json();
            dispatch({ type: 'FETCH_SUCCESS', payload: json });
        } catch (err) {
            console.error("Groups API error:", err);
            dispatch({ type: 'FETCH_ERROR', payload: err.message });
        }
    }

    useEffect(() => {
        fetchData();
    }, [dispatch]);

    return (
        <GroupContext.Provider
            value={{
                groups,
                dispatch,
            }}
        >
            {children}
        </GroupContext.Provider>
    );
}

export function useGroups() {
    const context = useContext(GroupContext);

    if (!context) {
        throw new Error("useGroups must be used inside Provider");
    }

    return context;
}
