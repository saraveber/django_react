import React from 'react';

function MatchTable({ matches, leagues, selectedMatch, handleCheckboxChange, selectedPlayer }) {
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

  return (
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
              match.team_host_obj.player1_obj?.id ===
                parseInt(selectedPlayer.id, 10)) ||
              (match.team_host_obj.player2 &&
                match.team_host_obj.player2_obj?.id ===
                  parseInt(selectedPlayer.id, 10)));
          const team1 = isSelectedPlayerInHost
            ? formatTeamPlayers(match.team_host_obj, selectedPlayer.id)
            : formatTeamPlayers(match.team_guest_obj, selectedPlayer.id);
          const team2 = isSelectedPlayerInHost
            ? formatTeamPlayers(match.team_guest_obj, selectedPlayer.id)
            : formatTeamPlayers(match.team_host_obj, selectedPlayer.id);
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
                    parseInt(selectedMatch.id, 10) === parseInt(match.id, 10)
                  }
                  onChange={handleCheckboxChange}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default MatchTable;