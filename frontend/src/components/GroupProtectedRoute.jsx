import { Navigate ,useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN, USER_KEY} from "../constants";
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
        const user = JSON.parse(localStorage.getItem(USER_KEY));
        setUserGroups(user.group_names);
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
            setIsAuthorized(true);
            getProfile().then(() => {
                console.log("User groups:", userGroups);
            }).catch(error => {
                console.error("Failed to fetch user profile:", error);
            });
            // find who is currently logged in
            
        }
    };

    const hasRequiredGroup = () => {
        return requiredGroups.some(group => userGroups.includes(group));
    };

    if (isAuthorized === null) {
        return <div>Loading...</div>; // Or any other loading indicator
    }
    console.log("User groups:", userGroups);
    if (!isAuthorized) {
        console.log("NotLogged in");
        return <Navigate to="/login" />;
    } else if (!hasRequiredGroup()) {
        console.error("Unauthorized access");
        return <Navigate to="/" />;
    } else {
        console.log("Authorized access");
        return children;
    }
}

export default GroupProtectedRoute;