import React, { useState, useEffect } from 'react';
import api from "../api";

const DropdownSearch = () => {
  const [leagues, setLeagues] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [otherPlayer, setOtherPlayer] = useState(null);

  useEffect(() => {
    const fetchLeaguesAndTeams = async () => {
      try {
        const leaguesResponse = await api.get('api/leagues/');
        setLeagues(leaguesResponse.data);
        const teamsResponse = await api.get('api/teams/');
        setTeams(teamsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchLeaguesAndTeams();
  }, []);

  const handleLeagueChange = (e) => {
    setSelectedLeague(e.target.value);
    // Reset players when league changes
    setSelectedPlayer('');
    setOtherPlayer(null);
  };

  const handlePlayerChange = (e) => {
    setSelectedPlayer(e.target.value);
    const team = teams.find(team => team.player1 === parseInt(e.target.value) || team.player2 === parseInt(e.target.value));
    console.log('team:', team)
    if (team) {
      const otherPlayerId = team.player1 === parseInt(e.target.value) ? team.player2 : team.player1;
      const otherPlayerDetails = otherPlayerId ? { ...team.player1_obj, ...team.player2_obj }.find(player => player.id === otherPlayerId) : null;
      setOtherPlayer(otherPlayerDetails);
    }
  };

  // Filter teams by the selected league and league type
  const filteredTeams = teams.filter(team => team.league === parseInt(selectedLeague) && leagues.find(league => league.id === team.league)?.type === "D");


  return (
    <div>
      <select onChange={handleLeagueChange}>
        <option value="">Select a League</option>
        {leagues.map((league) => (
          <option key={league.id} value={league.id}>
            {league.name}
          </option>
        ))}
      </select>
      <select onChange={handlePlayerChange}>
        <option value="">Select a Player</option>
        {filteredTeams.flatMap(team => [team.player1_obj, team.player2_obj]).filter(Boolean).map((player) => (
          <option key={player.id} value={player.id}>
            {player.name + ' ' + player.surname}
          </option>
        ))}
      </select>
      {otherPlayer && (
        <div>
          <p>Other Player in Team:</p>
          <p>{otherPlayer.name} {otherPlayer.surname}</p>
        </div>
      )}
    </div>
  );
};

export default DropdownSearch;