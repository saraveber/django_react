import React, { useState, useEffect } from "react";
import api from "../api";
import "../styles/Home.css";

function Home() {
    const [CurrUser,setCurrUser] = useState(null);
    const [role,setRole] = useState(null);
    const [loading,setLoading] = useState(true);

    useEffect(() => {
        getProfile();
    }, []); 

    useEffect(() => {
        if (role) {
            setLoading(false);
        }
    }, [role]); 

    
    const getProfile = async () => {
        console.log("Getting profile...");
        api
        .get("/api/user/")
        .then((res) => res.data)
        .then((data) => {
            setCurrUser(data);
            setRole(data.group_names[0]);
            
        })
        .catch((error) => {
            console.error("Error fetching profile:", error);
        });
    };
    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Home</h1>
            <p>Welcome to the home page {CurrUser.username}!</p>
            <p>Your role is {role}! </p>
        </div>
    );
};

export default Home;