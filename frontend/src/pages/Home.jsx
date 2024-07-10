import React, { useState, useEffect } from "react";
import { useUser } from '../context/UserContext';
import DropdownSearch from "../components/Dropdownsearch";
import "../styles/Home.css";

function Home() {
    const { currUser, role, authorised } = useUser();
    const [selectedMatch, setSelectedMatch] = useState('');
    
    useEffect(() => {
      // This effect will re-run whenever currUser, role, or authorised changes.
      console.log('Home updated:', { currUser, role, authorised });
      // Here you can add logic to adjust navigation items based on the current user's state
    }, [currUser, role, authorised]); // Dependencies array
  
  
    const handleMatchChange = (match) => {
        setSelectedMatch(match);
        console.log("Selected Match in Home:", match); // For demonstration
      };
    

    return (
        <div>
            <h1>Home</h1>
            <p>Welcome to the home page {currUser.username} !</p>
            <p>Your role is {currUser.id} ! </p>

            <DropdownSearch onMatchChange={handleMatchChange} />

            <p>Selected Match: {selectedMatch}</p>


        </div>
    );
};

export default Home;