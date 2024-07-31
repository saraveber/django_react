import React, { useEffect, useState } from "react";
import api from "../api";
import MatchTable from "./MatchTable"; // Import the new component

function DropdownInTerms({
  selectedMatch,
  setSelectedMatch,
  selectedPlayer,
  setSelectedPlayer,
}) {
  const [players, setPlayers] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [matches, setMatches] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState(null);
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
          let apiUrl = `api/matches/?player_id=${selectedPlayer.id}&is_active_round=true&is_assigned=false&is_finished=false`;
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
        setSelectedMatch(null);
      }
    };
    fetchMatches();
    setSelectedMatch(null);
  }, [selectedPlayer, selectedLeague]);

  useEffect(() => {
    const fetchLeagues = async () => {
      if (selectedPlayer) {
        try {
          let apiUrl =`api/leagues/?player_id=${selectedPlayer.id}`
          const response = await api.get(apiUrl);        
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
    if (
      selectedMatch &&
      parseInt(selectedMatch.id, 10) === parseInt(matchId, 10)
    ) {
      setSelectedMatch(null);
    } else {
      const match = matches.find((m) => m.id.toString() === matchId);
      setSelectedMatch(match);
    }
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
      {showSecondDropdownAndTable && selectedPlayer && (
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
              <MatchTable
                matches={matches}
                leagues={leagues}
                selectedMatch={selectedMatch}
                handleCheckboxChange={handleCheckboxChange}
                selectedPlayer={selectedPlayer}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DropdownInTerms;