// ProfileContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProfile } from '../api'; // Adjust the import path according to your project structure


const ProfileContext = createContext();

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profileData = await getProfile();
                setProfile(profileData);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch profile:', error);
                setError('Failed to load profile.');
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    return (
        <ProfileContext.Provider value={{ profile, loading, error }}>
            {children}
        </ProfileContext.Provider>
    );
};