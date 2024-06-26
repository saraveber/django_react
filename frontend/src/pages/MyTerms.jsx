
import { useState, useEffect } from "react";
import api from "../api";
import Calendar from '../components/Calendar';
import { useProfile } from "../contexts/ProfileContext";

function MyTerms() {
    const { profile, loading, error } = useProfile();
    // if profile.user_type is admin or staff get all users with user_type player
    if (profile.user_type === "admin" || profile.user_type === "staff") {
        const [users, setUsers] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);

        useEffect(() => {
            const fetchUsers = async () => {
                try {
                    const usersData = await api.getUsers();
                    setUsers(usersData);
                    setLoading(false);
                } catch (error) {
                    console.error('Failed to fetch users:', error);
                    setError('Failed to load users.');
                    setLoading(false);
                }
            };

            fetchUsers();
        }, []);

        if (loading) return <div>Loading users...</div>;
        if (error) return <div>{error}</div>;

        return (
            <div>
                <h2>Users</h2>
                <ul>
                    {users.map(user => (
                        <li key={user.id}>{user.username}</li>
                    ))}
                </ul>
            </div>
        );
    }

    if (loading) return <div>Loading profile...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <div>
                <h2>Welcome {profile.user.username}</h2>
                <p>Your acces is:  {profile.user_type}</p>
            </div>
            <div>
                <Calendar />            
            </div>
        </div>
    );
}
export default MyTerms;