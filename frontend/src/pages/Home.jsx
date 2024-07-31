import React, { useState, useEffect } from "react";
import { useUser } from '../context/UserContext';
import "../styles/Home.css";
import api from "../api";


function Home() {
    const { currUser, role, authorised } = useUser();
    const [leagues, setLeagues] = useState([]);
    const [sortedMatches, setSortedMatches] = useState({ group1: [], group2: [] });

    useEffect(() => {
        console.log('Home updated:', { currUser, role, authorised });

        // Fetch sorted matches data
        const fetchSortedMatches = async () => {
            try {
            const response = await api.get('/api/matches/sorted/?league_id=1');

            console.log('Sorted matches:', response.data);
            setSortedMatches(response.data);
            } catch (error) {
            console.error('Error fetching sorted matches:', error);
            }
        };

        fetchSortedMatches();

    }, [currUser, role, authorised]);

    useEffect(() => {
        const fetchData = async () => {
          try {
            const responses = await api.get("api/leagues/");
            setLeagues(responses.data);
          } catch (error) {
            console.error("Error fetching initial data:", error);
          }
        };
        fetchData();
      }, []);

    return (
        <div>

            <p>Welcome to the home page {currUser.username}!</p>
        </div>

    );
}

export default Home;