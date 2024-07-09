import React, { useEffect, useState } from "react";
import api from "../api"; // Import the 'api' module or define it before using it
function DropdownInTerms() {
  const [players, setPlayers] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [matches, setMatches] = useState([]);
  const [rounds, setRounds] = useState([]);

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [showPlayers, setShowPlayers] = useState([]); // Added state to show/hide players
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const response = await api.get("api/leagues/");
        setLeagues(response.data);
        console.log("League:", response.data);
      } catch (error) {
        console.error("Error fetching leagues:", error);
      }
    };

    const fetchPlayers = async () => {
      try {
        const response = await api.get("api/players/");
        setPlayers(response.data);
        console.log("Player:", response.data);
      } catch (error) {
        console.error("Error fetching players:", error);
      }
    };

    const fetchRounds = async () => {
      try {
        const response = await api.get("api/rounds/?is_active=true");
        setRounds(response.data);
        console.log("Rounds:", response.data);
      } catch (error) {
        console.error("Error fetching rounds:", error);
      }
    };
    fetchLeagues();
    fetchPlayers();
    fetchRounds();
  }, []);

  // useffect that loads all matches when player is sellected and is not null. only fetches matches with player_id = player.id
  useEffect(() => {
    if (selectedPlayer) {
      const fetchMatches = async () => {
        try {
          //TODO: ADD OTHER FILTERS BASED ON FINISHED MATCHES, ACTIVE MATCHES, ETC
          let apiUrl = `api/matches/?player_id=${selectedPlayer.id}&is_active_round=true`;
          if (selectedLeague) {
            apiUrl += `&league_id=${selectedLeague.id}`;
          }
          const response = await api.get(apiUrl);
          setMatches(response.data);
          console.log("Matches:", response.data);
        } catch (error) {
          console.error("Error fetching matches:", error);
        }
      };
      fetchMatches();
    } else {
      setMatches([]);
    }
  }, [selectedPlayer, selectedLeague]);

  // add useEfect that loads leagues when player is selected and is not null. only fetches leagues with player_id = player.id
  useEffect(() => {
    if (selectedPlayer) {
      const fetchLeagues = async () => {
        try {
          const response = await api.get(
            `api/leagues/?player_id=${selectedPlayer.id}`
          );
          setLeagues(response.data);
        } catch (error) {
          console.error("Error fetching leagues:", error);
        }
      };
      fetchLeagues();
    }
  }, [selectedPlayer]);

  const handleDropdownChange = (event) => {
    const playerId = event.target.value;
    const player = players.find((p) => p.id.toString() === playerId);
    setSelectedPlayer(player);
    console.log("Selected player:", player);
  };

  const handleLeagueDropdownChange = (event) => {
    const leagueId = event.target.value;
    const league = leagues.find((l) => l.id.toString() === leagueId);
    setSelectedLeague(league);
    console.log("Selected league:", league);
  };

  const handleRadioChange = (event) => {
    const matchId = event.target.value;
    const selectedMatch = matches.find(
      (match) => match.id.toString() === matchId
    );
    setSelectedMatch(selectedMatch);
  };

  const formatTeamPlayers = (team, selectedPlayerId) => {
    const players = [team.player1_obj, team.player2_obj].map(player => 
      player ? `${player.name} ${player.surname}` : ""
    ).filter(Boolean);
    const selectedIndex = players.findIndex((_, index) => 
      team[`player${index + 1}_obj`] && team[`player${index + 1}_obj`].id === selectedPlayerId
    );
  
    if (selectedIndex > 0) {
      [players[0], players[1]] = [players[1], players[0]];
    }
    return players.join(", ");
  };

  return (
    <div>
      <div>
        <select
          onChange={handleDropdownChange}
          value={selectedPlayer ? selectedPlayer.id : ""}
        >
          <option value="">Select a player</option>
          {players.map((player) => (
            <option key={player.id} value={player.id}>
              {player.name} {player.surname}
            </option>
          ))}
        </select>
      </div>

      <div>
        <select
          onChange={handleLeagueDropdownChange}
          value={selectedLeague ? selectedLeague.id : ""}
        >
          <option value="">Select a league</option>
          {leagues.map((league) => (
            <option key={league.id} value={league.id}>
              {league.name}
            </option>
          ))}
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>League</th>
            <th>Team 1</th>
            <th>Team 2</th>
            <th>Select</th> {/* Added header for radio buttons */}
          </tr>
        </thead>

        <tbody>
          {matches.map((match) => {
            const league = leagues.find((l) => l.id === match.league);

            // Determine if selectedPlayer is in team_host
            const isSelectedPlayerInHost =
              selectedPlayer &&
              ((match.team_host_obj.player1 &&
                match.team_host_obj.player1_obj.id ===
                  parseInt(selectedPlayer.id, 10)) ||
                (match.team_host_obj.player2 &&
                  match.team_host_obj.player2_obj.id ===
                    parseInt(selectedPlayer.id, 10)));

  
            // Adjust order based on selectedPlayer's team
            const team1 = isSelectedPlayerInHost
              ? formatTeamPlayers(match.team_host_obj, selectedPlayer.id)
              : formatTeamPlayers(match.team_guest_obj, selectedPlayer.id);
            const team2 = isSelectedPlayerInHost
              ? formatTeamPlayers(match.team_guest_obj, selectedPlayer.id)
              : formatTeamPlayers(match.team_host_obj, selectedPlayer.id);

            console.log(team1);

            return (
              <tr key={match.id}>
                <td>{league ? league.name : "League not found"}</td>
                <td>{team1}</td>
                <td>{team2}</td>
                <td>
                  {/* Radio button for selecting a match */}
                  <input
                    type="radio"
                    name="selectedMatch"
                    value={match.id}
                    onChange={handleRadioChange} // You need to define this function to handle radio changes
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default DropdownInTerms;
