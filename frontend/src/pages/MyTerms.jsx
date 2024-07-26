import { useState, useEffect } from "react";
import api from "../api";
import { useUser } from "../context/UserContext";
import Calendar from "../components/Calendar";
import CalendarReact from "../components/CalendarReact";
import DropdownInTerms from "../components/DropdownInTerms";
import UserColorSquare from "../components/UserColorSquare";

// Assuming colorDict is defined outside the component for global access
const colorDict = { 0: "#A459D1", 1: "#F266AB", 2: "#FFB84C" };
const mainColor = "#0d6efd";


function MyTerms() {
  const { currUser, role, authorised } = useUser();

  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const [otherPlayers, setOtherPlayers] = useState([]);
  const [currentColorDict, setCurrentColorDict] = useState({});
  const [userIdList, setUserIdList] = useState([]);



  useEffect(() => {
    let currOtherPlayers = [];
    // add players to OtherPlayers
    if (selectedMatch != null) {
      // add selectedMatch.team_guest_obj.player1_obj if electedMatch.team_guest_obj.player1 and player1_obj is not selectedPlayer
      if (
        selectedMatch.team_guest_obj.player1 &&
        selectedMatch.team_guest_obj.player1_obj.id !== selectedPlayer.id
      ) {
        currOtherPlayers.push(selectedMatch.team_guest_obj.player1_obj);
      }
      // add selectedMatch.team_guest_obj.player2_obj if electedMatch.team_guest_obj.player2 and player2_obj is not selectedPlayer
      if (
        selectedMatch.team_guest_obj.player2 &&
        selectedMatch.team_guest_obj.player2_obj.id !== selectedPlayer.id
      ) {
        currOtherPlayers.push(selectedMatch.team_guest_obj.player2_obj);
      }
      // add selectedMatch.team_host_obj.player1_obj if electedMatch.team_host_obj.player1 and player1_obj is not selectedPlayer
      if (
        selectedMatch.team_host_obj.player1 &&
        selectedMatch.team_host_obj.player1_obj.id !== selectedPlayer.id
      ) {
        currOtherPlayers.push(selectedMatch.team_host_obj.player1_obj);
      }
      // add selectedMatch.team_host_obj.player2_obj if electedMatch.team_host_obj.player2 and player2_obj is not selectedPlayer
      if (
        selectedMatch.team_host_obj.player2 &&
        selectedMatch.team_host_obj.player2_obj.id !== selectedPlayer.id
      ) {
        currOtherPlayers.push(selectedMatch.team_host_obj.player2_obj);
      }

      console.log("Other players:", currOtherPlayers);

      setOtherPlayers(currOtherPlayers);
    } else {
      setOtherPlayers([]);
    }

    // set colorDict based on the number of otherPlayers
    const newColorDict = {};
    const OtherUserIdList = [];
    currOtherPlayers.forEach((player, index) => {
      newColorDict[player.user] = colorDict[index];
      OtherUserIdList.push(player.user);
    });
    setCurrentColorDict(newColorDict);
    setUserIdList(OtherUserIdList);


  }, [selectedMatch]);



useEffect(() => { 
    console.log("currentId in MyTerms:", currUser.id);
    console.log("OtherUserIdList:", userIdList);
    console.log("Current color dict:", currentColorDict);
    console.log("Other players:", otherPlayers);
  }, [currUser, userIdList, currentColorDict, otherPlayers]);





  if (role === null) {
    return <div>Loading...</div>;
  }
  if (role === "player") {
    return (
      <div>
        <div>
          <Calendar CurrUserId={currUser.id} role={role} />
        </div>
      </div>
    );
  }

  if (role === "admin" || role === "staff") {
    return (
      <div>
        <DropdownInTerms
          selectedMatch={selectedMatch}
          setSelectedMatch={setSelectedMatch}
          selectedPlayer={selectedPlayer}
          setSelectedPlayer={setSelectedPlayer}
        />
       <div className="container mt-3">
  <div className="row">
    

    {selectedPlayer && (
      <div className="col-md-10">
        <CalendarReact
          CurrUserId={selectedPlayer.user}
          OnlyShowUserIdList={userIdList}
          colorDict={currentColorDict} // colorDict = {id:color} "#2CD3E1"
          role={role}
          selectedMatch={selectedMatch}
        />
      </div>
    )}
<div className="col-md-2">
      <UserColorSquare
        selectedPlayer={selectedPlayer}
        otherPlayers={otherPlayers}
        mainColor={mainColor}
        colorDict={currentColorDict}
      />
    </div>

  </div>
</div>
      </div>
    );
  }
  if (role === "user") {
    return <div>You are not authorized</div>;
  }
}
export default MyTerms;
