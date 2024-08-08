export const getOtherPlayers = (selectedMatch, selectedPlayer = -1) => {
    let currOtherPlayers = [];
    const colorDict = { 0: "#A459D1", 1: "#F266AB", 2: "#FFB84C", 3: "#2CD3E1" };
    
    if (selectedMatch != null) {
      if (
        selectedMatch.team_guest_obj.player1 &&
        selectedMatch.team_guest_obj.player1_obj.id !== selectedPlayer.id
      ) {
        currOtherPlayers.push(selectedMatch.team_guest_obj.player1_obj);
      }
      if (
        selectedMatch.team_guest_obj.player2 &&
        selectedMatch.team_guest_obj.player2_obj.id !== selectedPlayer.id
      ) {
        currOtherPlayers.push(selectedMatch.team_guest_obj.player2_obj);
      }
      if (
        selectedMatch.team_host_obj.player1 &&
        selectedMatch.team_host_obj.player1_obj.id !== selectedPlayer.id
      ) {
        currOtherPlayers.push(selectedMatch.team_host_obj.player1_obj);
      }
      if (
        selectedMatch.team_host_obj.player2 &&
        selectedMatch.team_host_obj.player2_obj.id !== selectedPlayer.id
      ) {
        currOtherPlayers.push(selectedMatch.team_host_obj.player2_obj);
      }
  
      console.log("Other players:", currOtherPlayers);
    }
  
    const newColorDict = {};
    const OtherUserIdList = [];
    currOtherPlayers.forEach((player, index) => {
      newColorDict[player.user] = colorDict[index];
      OtherUserIdList.push(player.user);
    });
  
    return { currOtherPlayers, newColorDict, OtherUserIdList };
  };