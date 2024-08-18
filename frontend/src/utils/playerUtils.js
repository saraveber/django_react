export const getOtherPlayers = (selectedMatch, selectedPlayer = -1) => {
  let players = selectedPlayer !== -1 && selectedPlayer !== null ? [selectedPlayer] : [];
  const colorDict = { 0: "#A459D1", 1: "#F266AB", 2: "#FFB84C", 3: "#2CD3E1" };
  
  console.log("selectedMatch:", selectedMatch);


  if (selectedMatch != null) {
    if (
      selectedMatch.team_guest_obj.player1 &&
      selectedMatch.team_guest_obj.player1_obj.id !== (selectedPlayer ? selectedPlayer.id : -1)
    ) {
      players.push(selectedMatch.team_guest_obj.player1_obj);
    }
    if (
      selectedMatch.team_guest_obj.player2 &&
      selectedMatch.team_guest_obj.player2_obj.id !== (selectedPlayer ? selectedPlayer.id : -1)
    ) {
      players.push(selectedMatch.team_guest_obj.player2_obj);
    }
    if (
      selectedMatch.team_host_obj.player1 &&
      selectedMatch.team_host_obj.player1_obj.id !== (selectedPlayer ? selectedPlayer.id : -1)
    ) {
      players.push(selectedMatch.team_host_obj.player1_obj);
    }
    if (
      selectedMatch.team_host_obj.player2 &&
      selectedMatch.team_host_obj.player2_obj.id !== (selectedPlayer ? selectedPlayer.id : -1)
    ) {
      players.push(selectedMatch.team_host_obj.player2_obj);
    }
  }

  let NewColorDict = {};
  players.forEach((player, index) => {
    NewColorDict[player.user] = colorDict[index];
  });
  console.log("NewColorDict:", NewColorDict);
  console.log("players:", players);

  return { players: players, colorDict: NewColorDict};
};