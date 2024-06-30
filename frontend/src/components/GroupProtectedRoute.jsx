import { Navigate ,useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import { useState, useEffect } from "react";

function GroupProtectedRoute({ children, requiredGroups }) {
    const [isAuthorized, setIsAuthorized] = useState(null);
    const [userGroups, setUserGroups] = useState([]);
    const navigate = useNavigate(); // Use the useNavigate hook

    useEffect(() => {
        auth().catch(() => setIsAuthorized(false));
    }, []);


    const refreshToken = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        try {
            const res = await api.post("/api/token/refresh/", {
                refresh: refreshToken,
            });
            if (res.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access)
                setIsAuthorized(true)
            } else {
                setIsAuthorized(false)
            }
        } catch (error) {
            console.log(error);
            setIsAuthorized(false);
        }
    };

    const getProfile = async () => {
        console.log("Getting profile...");
        api
        .get("/api/user/")
        .then((res) => res.data)
        .then((data) => {
            setUserGroups(data.group_names);
            
        })
        .catch((error) => {
            console.error("Error fetching profile:", error);
        });
    };

    const auth = async () => {
        // Similar to ProtectedRoute but includes group verification
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
            setIsAuthorized(false);
            return;
        }
        const decoded = jwtDecode(token);
        const tokenExpiration = decoded.exp;
        const now = Date.now() / 1000;

        if (tokenExpiration < now) {
            await refreshToken();
        } else {
            setIsAuthorized(true)

            getProfile().then(() => {
                console.log("User groups:", userGroups);
                // Assuming getProfile has already set user groups via setCurrUser or similar
                // setUserGroups is assumed to be adjusted within getProfile or elsewhere after fetching
            }).catch(error => {
                console.error("Failed to fetch user profile:", error);
            });
            // find who is currently logged in
            

            setUserGroups(decoded.groups || []); // Assuming the groups are stored in the token
        }
    };

    const hasRequiredGroup = () => {
        return requiredGroups.some(group => userGroups.includes(group));
    };

    if (isAuthorized === null) {
        return <div>Loading...</div>; // Or any other loading indicator
    }
    if (!isAuthorized) {
        return <Navigate to="/login" />;
    } else if (!hasRequiredGroup()) {
        console.log("User does not have the required groups");
        console.log("User groups:", userGroups);    
        // navigate to previos page
        
    } else {
        return children;
    }
}

export default GroupProtectedRoute;