import React, { useState, useEffect } from "react";
import {  USER_KEY} from "../constants";
import api from "../api";
import "../styles/Home.css";

function Home() {
    const [role, setRole] = useState(null);
    const [currUser, setCurrUser] = useState({});



    useEffect(() => {
        getProfile();
    }, []);


    const getProfile = async () => {
        const user = JSON.parse(localStorage.getItem(USER_KEY));
        setCurrUser(user);
        setRole(user.group_names[0]);
    };

    return (
        <div>
            <h1>Home</h1>
            <p>Welcome to the home page {currUser.username} !</p>
            <p>Your role is {role} ! </p>
        </div>
    );
};

export default Home;