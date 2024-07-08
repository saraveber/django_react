import React, { useState, useEffect } from "react";
import api from "../api";

const DropdownSearch = ({ onMatchChange }) => {
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
    fetchTeamsForLeague();
  }, [selectedLeague]);

  const fetchTeam2 = async () => {
    if (selectedTeam !== "") {
      try {
        const matches = await api.get(
          `/api/matches/?team_id=${selectedTeam}&league_id=${selectedLeague}`
        );
        setMatches(matches.data);
      } catch (error) {
        console.error("Error fetching matches:", error);
      }
    }
  };

  useEffect(() => {
    fetchTeam2();
  }, [selectedTeam]);

  const handleLeagueChange = (e) => {
    setSelectedLeague(e.target.value);
    setSelectedTeam("");
    setSelectedMatch("");
  };
  const handleTeamChange = (e) => {
    setSelectedTeam(e.target.value);
    setSelectedMatch("");
  };

  const handleMatchChange = (event) => {
    const newSelectedMatch = event.target.value;
    setSelectedMatch(newSelectedMatch);
    onMatchChange(newSelectedMatch); // Notify the parent component
  };

  function getTeamName(team) {
    const { player1_obj, player2_obj } = team;
    return player2_obj === null
      ? `${player1_obj.name} ${player1_obj.surname}`
      : `${player1_obj.name} ${player1_obj.surname} & ${player2_obj.name} ${player2_obj.surname}`;
  }

  function getMatchOptionText(match, selectedTeam) {
    const isGuestTeamSelected = match.team_guest === parseInt(selectedTeam, 10);
    const teamObj = isGuestTeamSelected
      ? match.team_host_obj
      : match.team_guest_obj;
    const player1Text = `${teamObj.player1_obj.name} ${teamObj.player1_obj.surname}`;
    const player2Text = teamObj.player2
      ? ` & ${teamObj.player2_obj.name} ${teamObj.player2_obj.surname}`
      : "";
    return player1Text + player2Text;
  }

  return (
    <div className="d-flex justify-content-between">
      <select
        className="form-select mb-3 flex-grow-1 mx-2"
        onChange={handleLeagueChange}
      >
        <option value="">Select a League</option>
        {leagues.map((league) => (
          <option key={league.id} value={league.id}>
            {league.name}
          </option>
        ))}
      </select>
      <select
        className="form-select mb-3 flex-grow-1 mx-2"
        onChange={handleTeamChange}
        disabled={!selectedLeague} // Disable if no league is selected
      >
        <option value="">Select a Team</option>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {getTeamName(team)}
          </option>
        ))}
      </select>
      <select
        className="form-select mb-3 flex-grow-1 ms-2"
        onChange={handleMatchChange} 
        disabled={!selectedTeam} // Disable if no team is selected
      >
        <option value="">Select a Match</option>
        {matches.map((match) => (
          <option key={match.id} value={match.id}>
            {getMatchOptionText(match, selectedTeam)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DropdownSearch;
