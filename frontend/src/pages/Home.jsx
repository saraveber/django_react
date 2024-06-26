import React, { useState, useEffect } from "react";
import { getProfile } from '../api';
import api from "../api";
import "../styles/Home.css";


function Home() {
    const [profile, setProfile] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profileData = await getProfile();
                console.log('profileData:', profileData);
                setProfile(profileData);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch profile:', error);
                setError('Failed to load profile.');
                setLoading(false);
            }
        };
        try{
        fetchProfile();
        } catch (err){
            setError(err.maessage);
        }
    }, []); // Empty dependency array means this effect runs once on mount


    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

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