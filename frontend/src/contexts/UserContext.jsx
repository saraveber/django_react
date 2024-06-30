// src/contexts/UserContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from "../api";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [currUser, setCurrUser] = useState(null);
    const [currUserId, setCurrUserId] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    const getProfile = async () => {
        console.log("Getting profile...");
        setLoading(true);
        try {
            // Assuming you have a function or a way to get the token
            const token = localStorage.getItem("authToken"); // Example: Getting token from local storage
            const res = await api.get("/api/user/", {
                headers: {
                    Authorization: `Bearer ${token}` // Include the token in the request header
                }
            });
            const data = res.data;
            setCurrUser(data);
            setCurrUserId(data.id);
            setRole(data.group_names[0]);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching profile:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        // Check if the current path is not /login or /register
        if (location.pathname !== "/login" && location.pathname !== "/register") {
            getProfile();
        } else {
            // Set everything to null if on /login or /register
            setCurrUser(null);
            setCurrUserId(null);
            setRole(null);
            setLoading(false); // Consider setting to false immediately as no loading is expected
        }
    }, [location.pathname]); // Depend on pathname to re-run effect when it changes

    return (
        <UserContext.Provider value={{ currUser, currUserId, role, loading, getProfile }}>
            {children}
        </UserContext.Provider>
    );
};