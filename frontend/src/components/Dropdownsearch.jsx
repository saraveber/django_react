import React, { useState, useEffect } from "react";
import api from "../api";

const DropdownSearch = () => {
  const [leagues, setLeagues] = useState([]);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedMatch, setSelectedMatch] = useState("");


  useEffect(() => {
    const fetchLeaguesAndTeams = async () => {
      try {
        const leaguesResponse = await api.get("api/leagues/");
        setLeagues(leaguesResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchLeaguesAndTeams();
  }, []);

  const fetchTeamsForLeague = async () => {
    if (selectedLeague !== "0" && selectedLeague !== "") {
      try {
        const teamsResponse = await api.get(
          `api/teams/?league=${selectedLeague}`
        );

        setTeams(teamsResponse.data);
      } catch (error) {
        console.error("Error fetching teams for league:", error);
      }
    } else {
      setTeams([]);
    }
  };

  useEffect(() => {
    console.log(selectedLeague);
    fetchTeamsForLeague();
  }, [selectedLeague]);

  const fetchTeam2 = async () => {
    if (selectedTeam !== "") {
      try {
        const matches = await api.get(`/api/matches/?team_id=${selectedTeam}&league_id=${selectedLeague}`); 
        setMatches(matches.data);
        console.log(matches.data)
        console.log(typeof selectedTeam);
        console.log(typeof matches.data[0].team_host);

      } catch (error) {
        console.error("Error fetching matches:", error);
      }  
    }
  };

  useEffect(() => {
    fetchTeam2();
  },[selectedTeam]);


  const handleLeagueChange = (e) => {
    setSelectedLeague(e.target.value);
    setSelectedTeam("");
  };
  const handleTeamChange = (e) => {
    setSelectedTeam(e.target.value);
  };

  

  return (
    <div>
      <select onChange={handleLeagueChange}>
        <option value="0">Select a League</option>
        {leagues.map((league) => (
          <option key={league.id} value={league.id}>
            {league.name}
          </option>
        ))}
      </select>
      <select onChange={handleTeamChange}>
        <option value="">Select a Team</option>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.player2 === null
              ? `${team.player1_obj.name} ${team.player1_obj.surname}`
              : `${team.player1_obj.name} ${team.player1_obj.surname} & ${team.player2_obj.name} ${team.player2_obj.surname}`}
          </option>
        ))}
      </select>
      <select>
        <option value="">Select a Match</option>
        {matches.map((match) => (
          <option key={match.id} value={match.id}>
            
            {match.team_host === parseInt(selectedTeam, 10) ? match.team_guest : match.team_host}
          </option>
        ))}
      </select>
      
      


      
    </div>
  );
};

export default DropdownSearch;
