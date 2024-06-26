import React, { useState, useEffect } from "react";
import { getProfile } from '../api';
import api from "../api";
import "../styles/Home.css";
import { useProfile } from "../contexts/ProfileContext";

function Home() {
    const { profile, loading, error } = useProfile();

    if (loading) return <div>Loading profile...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            {profile && (
                <div>
                    <h2>Welcome {profile.user.username}</h2>
                    <p>Your acces is:  {profile.user_type}</p>
                    
                </div>
            )}
        </div>
    );
};

export default Home;