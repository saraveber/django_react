import React, { useState, useEffect } from "react";
import { Accordion, Card, Button } from "react-bootstrap";
import CalendarReact from "./CalendarReact"; // Assuming you have this component
import UserColorSquare from "./UserColorSquare"; // Assuming you have this component
import { getOtherPlayers } from "../utils/playerUtils";

function MatchAccordionTermsDontMatch({ matches, leagues }) {
  const [activeKey, setActiveKey] = useState("0");

  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const [otherPlayers, setOtherPlayers] = useState([]);
  const [currentColorDict, setCurrentColorDict] = useState({});
  const [userIdList, setUserIdList] = useState([]);

  const formatTeamPlayers = (team) => {
    return [team.player1_obj, team.player2_obj]
      .map((player) => (player ? `${player.name} ${player.surname}` : ""))
      .filter(Boolean)
      .join(", ");
  };

  const handleAccordionClick = (index, match) => {
    if (activeKey === index.toString()) {
      setActiveKey(null); // Close the accordion if it's already open
    } else {
      setActiveKey(index.toString());
      setSelectedMatch(match);
    }
  };

  useEffect(() => {
    if (selectedMatch) {
      const { currOtherPlayers, newColorDict, OtherUserIdList } =
        getOtherPlayers(selectedMatch);
      setOtherPlayers(currOtherPlayers);
      setCurrentColorDict(newColorDict);
      setUserIdList(OtherUserIdList);
    }
  }, [selectedMatch, selectedPlayer]);

  return (
    <Accordion activeKey={activeKey}>
      {matches.map((match, index) => {
        const league = leagues.find((l) => l.id === match.league);
        const team1 = formatTeamPlayers(match.team_host_obj);
        const team2 = formatTeamPlayers(match.team_guest_obj);
        const isSelected = activeKey === index.toString();
        return (
          <Accordion.Item eventKey={index.toString()} key={match.id}>
            <Accordion.Header
              onClick={() => handleAccordionClick(index, match)}
            >
              {league ? league.name : "League not found"}: {team1} vs {team2}
            </Accordion.Header>
            <Accordion.Body>
              <div className="container mt-3">
                <div className="row">
                  {isSelected && (
                    <div className="col-md-10">
                      <CalendarReact
                        CurrUserId={selectedPlayer?.user}
                        OnlyShowUserIdList={userIdList}
                        colorDict={currentColorDict} // colorDict = {id:color} "#2CD3E1"
                        role={"role"} // Replace with actual role if needed
                        selectedMatch={selectedMatch}
                      />
                    </div>
                  )}
                  <div className="col-md-2">
                    <UserColorSquare
                      selectedPlayer={selectedPlayer?.user}
                      otherPlayers={otherPlayers}
                      mainColor={"#0d6efd"}
                      colorDict={currentColorDict}
                    />
                  </div>
                </div>
              </div>
            </Accordion.Body>
          </Accordion.Item>
        );
      })}
    </Accordion>
  );
}

export default MatchAccordionTermsDontMatch;
