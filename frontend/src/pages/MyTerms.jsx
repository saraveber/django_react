import { useState, useEffect } from "react";
import api from "../api";
import { useUser } from "../context/UserContext";
import CalendarResource from "../components/CalanderResource";
import CalendarReact from "../components/CalendarReact";
import DropdownInTerms from "../components/DropdownInTerms";
import UserColorSquare from "../components/UserColorSquare";
import { getOtherPlayers } from "../utils/playerUtils";

function MyTerms() {
  const { currUser, role, authorised } = useUser();
  const [currPlayer, setCurrPlayer] = useState(null);

  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);


  const [players, setPlayers] = useState([]);
  const [colorDict, setColorDict] = useState({});


  useEffect(() => {
    if (selectedPlayer !== null) {
      const { players, colorDict } = getOtherPlayers(
        selectedMatch,
        selectedPlayer
      );
      setPlayers(players);  
      setColorDict(colorDict);
    }
  }, [selectedMatch, selectedPlayer]);

  useEffect(() => {
    console.log("currUser", currUser);

    const fetchTerms = async () => {
        if (currUser) {
            
        try {
            const res = await api.get(`/api/players/?user=${currUser.id}`);
            console.log("IT WORKS");
            console.log(res.data);
            setCurrPlayer(res.data[0]);
        } catch (error) {
            console.error(`Error fetching terms for player ${currUser.id}:`, error);
        }
      
    };
  };

    fetchTerms();
}, [currUser]);


  if (role === null) {
    return <div>Loading...</div>;
  }
  if (role === "player") {
    return (
      <div>
        <div className="container mt-3">
          {currPlayer && (  
          <CalendarResource
              initialCurrUserId={currPlayer.user}
              playerList={[currPlayer]}
              colorDict={{ [currPlayer.user]: "#007bff" }}
              role={role}
            />
          )}
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
        {selectedPlayer && (
        <div className="container mt-3">
          <CalendarResource
            initialCurrUserId={selectedPlayer ? selectedPlayer.user : null}
            playerList={players}
            colorDict={colorDict}
            role={role}
          />
        </div>
        )}

      </div>
    );
  }
  if (role === "user") {
    return <div>You are not authorized</div>;
  }
}

export default MyTerms;