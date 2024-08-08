import { useState, useEffect } from "react";
import api from "../api";
import { useUser } from "../context/UserContext";
import Calendar from "../components/Calendar";
import CalendarReact from "../components/CalendarReact";
import DropdownInTerms from "../components/DropdownInTerms";
import UserColorSquare from "../components/UserColorSquare";
import { getOtherPlayers } from "../utils/playerUtils";

// Assuming colorDict is defined outside the component for global access

const mainColor = "#0d6efd";

function MyTerms() {
  const { currUser, role, authorised } = useUser();

  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const [otherPlayers, setOtherPlayers] = useState([]);
  const [currentColorDict, setCurrentColorDict] = useState({});
  const [userIdList, setUserIdList] = useState([]);

  useEffect(() => {
    const { currOtherPlayers, newColorDict, OtherUserIdList } = getOtherPlayers(
      selectedMatch,
      selectedPlayer
    );
    setOtherPlayers(currOtherPlayers);
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
        <div className="container mt-3">
          <div className="row">
            <div className="col-md-12">
              <CalendarReact
                CurrUserId={currUser.id}
                OnlyShowUserIdList={[]}
                colorDict={[]}
                role={role}
              />
            </div>
          </div>
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
                mainColor={"#0d6efd"}
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
