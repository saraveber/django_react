import React, { useEffect, useState } from "react";
import api from "../api";

function DropdownInTerms() {
  const [players, setPlayers] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [matches, setMatches] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);

  const [showSecondDropdownAndTable, setShowSecondDropdownAndTable] =
    useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responses = await Promise.all([
          api.get("api/leagues/"),
          api.get("api/players/"),
          api.get("api/rounds/?is_active=true"),
        ]);
        setLeagues(responses[0].data);
        setPlayers(responses[1].data);
        setRounds(responses[2].data);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchMatches = async () => {
      if (selectedPlayer) {
        try {
          let apiUrl = `api/matches/?player_id=${selectedPlayer.id}&is_active_round=true`;
          if (selectedLeague) {
            apiUrl += `&league_id=${selectedLeague.id}`;
          }
          const response = await api.get(apiUrl);
          setMatches(response.data);
        } catch (error) {
          console.error("Error fetching matches:", error);
        }
      } else {
        setMatches([]);
      }
    };
    fetchMatches();
    setSelectedMatch(null);

  }, [selectedPlayer, selectedLeague]);

  useEffect(() => {
    const fetchLeagues = async () => {
      if (selectedPlayer) {
        try {
          const response = await api.get(
            `api/leagues/?player_id=${selectedPlayer.id}`
          );
          setLeagues(response.data);
        } catch (error) {
          console.error("Error fetching leagues for player:", error);
        }
      }
    };
    fetchLeagues();
  }, [selectedPlayer]);

  const handleDropdownChange = (event) => {
    const playerId = event.target.value;
    const player = players.find((p) => p.id.toString() === playerId);
    setSelectedPlayer(player);
  };

  const handleLeagueDropdownChange = (event) => {
    const leagueId = event.target.value;
    const league = leagues.find((l) => l.id.toString() === leagueId);
    setSelectedLeague(league);
  };

  const handleCheckboxChange = (event) => {
    const matchId = event.target.value;
    // Check if the checkbox for the currently selected match is being unchecked
    if (
      selectedMatch &&
      parseInt(selectedMatch.id, 10) === parseInt(matchId, 10)
    ) {
      setSelectedMatch(null); // Uncheck and set no match as selected
    } else {
      const match = matches.find((m) => m.id.toString() === matchId);
      setSelectedMatch(match); // Update with the newly selected match
    }
  };

  const formatTeamPlayers = (team, selectedPlayerId) => {
    const players = [team.player1_obj, team.player2_obj]
      .map((player) => (player ? `${player.name} ${player.surname}` : ""))
      .filter(Boolean);
    const selectedIndex = players.findIndex(
      (_, index) =>
        team[`player${index + 1}_obj`] &&
        team[`player${index + 1}_obj`].id === selectedPlayerId
    );

    if (selectedIndex > 0) {
      [players[0], players[1]] = [players[1], players[0]];
    }
    return players.join(", ");
  };

  const toggleDropdownAndTable = () => {
    setShowSecondDropdownAndTable(!showSecondDropdownAndTable);
  };

  return (
    <div className="container mt-3">
      <div className="row">
        <div className="col-6">
          <select
            className="form-control"
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
        <div className="col-6">
          <button
            className="btn btn-primary"
            onClick={toggleDropdownAndTable}
            style={{ width: "100%" }}
            disabled={!selectedPlayer}
          >
            {showSecondDropdownAndTable
              ? "Close active, unassigned, unfinished matches"
              : "Show active, unassigned, unfinished matches"}
          </button>
        </div>
      </div>

      {showSecondDropdownAndTable && (
        <div className="mt-3">
          <div className="row">
            <div className="col">
              <select
                className="form-control"
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
          </div>
          <div className="row mt-3">
            <div className="col">
              <table className="table">
                <thead className="thead-dark">
                  <tr>
                    <th>League</th>
                    <th>Team 1</th>
                    <th>Team 2</th>
                    <th>Select</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((match) => {
                    const league = leagues.find((l) => l.id === match.league);
                    const isSelectedPlayerInHost =
                      selectedPlayer &&
                      ((match.team_host_obj.player1 &&
                        match.team_host_obj.player1_obj.id ===
                          parseInt(selectedPlayer.id, 10)) ||
                        (match.team_host_obj.player2 &&
                          match.team_host_obj.player2_obj.id ===
                            parseInt(selectedPlayer.id, 10)));
                    const team1 = isSelectedPlayerInHost
                      ? formatTeamPlayers(
                          match.team_host_obj,
                          selectedPlayer.id
                        )
                      : formatTeamPlayers(
                          match.team_guest_obj,
                          selectedPlayer.id
                        );
                    const team2 = isSelectedPlayerInHost
                      ? formatTeamPlayers(
                          match.team_guest_obj,
                          selectedPlayer.id
                        )
                      : formatTeamPlayers(
                          match.team_host_obj,
                          selectedPlayer.id
                        );

                    return (
                      <tr key={match.id}>
                        <td>{league ? league.name : "League not found"}</td>
                        <td>{team1}</td>
                        <td>{team2}</td>
                        <td>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="selectedMatch"
                            value={match.id}
                            checked={
                              !!selectedMatch &&
                              parseInt(selectedMatch.id, 10) ===
                                parseInt(match.id, 10)
                            }
                            onChange={handleCheckboxChange}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DropdownInTerms;
