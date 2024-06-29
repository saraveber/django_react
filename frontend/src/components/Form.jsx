import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";
import LoadingIndicator from "./LoadingIndicator";

function Form({ route, method }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState(""); // New state for new password
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Adjust the name based on the method
    let name;
    switch (method) {
        case "login":
            name = "Login";
            break;
        case "register":
            name = "Register";
            break;
        case "changePassword":
            name = "Change Password";
            break;
        default:
            name = "Submit";
    }

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        const payload = method === "changePassword" ? { current_password: password, new_password: newPassword} : { username, password };

        try {   
            const res = await api.post(route, payload);
            if (method === "login") {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                navigate("/");
            } else if (method === "changePassword") {
                alert("Password changed successfully.");
                navigate("/");
            } else {
                navigate("/login");
            }
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="form-container">
                <h1>{name}</h1>
                <input
                    className="form-input"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                />
                <input
                    className="form-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Current Password"
                />
                {method === "changePassword" && (
                    <input
                        className="form-input"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New Password"
                    />
                )}

                {loading && <LoadingIndicator />}
                <button className="form-button" type="submit">
                    {name}
                </button>
            </form>
        </div>
    );
}

export default Form;