import { useState, useEffect } from "react";
import api from "../api";
import Calendar from '../components/Calendar';
import UserSelectionDropDown from '../components/UserSelectionDropDown';
//import { useProfile } from "../contexts/ProfileContext";

function MyTerms() {
    const [users, setUsers] = useState([]); 
    const [CurrUserId, setCurrUserId] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState(null); 
    const [CurrUser,setCurrUser] = useState(null);
    const [role,setRole] = useState(null);
    const [loading,setLoading] = useState(true);
    

    useEffect(() => {
        getProfile();
        setLoading(false);
    }, []); // This useEffect runs once on component mount to get the profile

    useEffect(() => {
        if (role) {  
            getUsers();
        }
    }, [role]); // This useEffect runs whenever role or CurrUser changes and both are not null

    const getUsers = () => {
        if (role === "admin" || role === "staff") {
            api
            .get('api/users/get-all-players/')
            .then((res) => res.data)
            .then((data) => {
                setUsers(data);
                console.log("Users:", data);
            })
            .catch((error) => {
                // Handle the error
                console.error("Error fetching users:", error);
            });
        } else {
            console.log("Role is not admin or staff");
        }
    };


    const getProfile = async () => {
        console.log("Getting profile...");
        api
        .get("/api/user/")
        .then((res) => res.data)
        .then((data) => {
            setCurrUser(data);
            setCurrUserId(data.id);
            setRole(data.group_names[0]);
            
        })
        .catch((error) => {
            console.error("Error fetching profile:", error);
        });
    };

    const handleUserChange = (event) => {
        setSelectedUserId(event.target.value);
      };
    // if role = null we return loading
    // if role = player than we return the calander with the user
    // if role = admin or staff we return dropdown of all users and od selected user
    // if role = user we return you are not authorized
    if (loading) {
        return <div>Loading...</div>;
    }
    if (role === null) {
        return <div>Loading...</div>;
    }
    if (role === "player") {
        return (
            <div>
                <div>

                    <Calendar CurrUserId={CurrUserId} role={role}/>
                </div>
            </div>
        );
    }
        

    if (role === "admin" || role === "staff") {
        return (
            <div>
                <UserSelectionDropDown
                    CurrUserId={selectedUserId} 
                    users={users} 
                    handleUserChange={handleUserChange} 
                />
                {selectedUserId && ( 
                <Calendar 
                    CurrUserId={selectedUserId} 
                    role={role} 
                />
                )}
            </div>
        
        );
    }
    if (role === "user") {
        return <div>You are not authorized</div>;
    }
        
}
export default MyTerms;