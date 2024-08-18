import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { Accordion, Card, Button } from "react-bootstrap";
import CalendarResource from "./CalanderResource"; // Assuming you have this component
import { getOtherPlayers } from "../utils/playerUtils";

function MatchAccordionTermsDontMatch({ matches, leagues }) {
  const { currUser, role, authorised } = useUser();
    const [activeKey, setActiveKey] = useState("0");

    const [selectedMatch, setSelectedMatch] = useState(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    const [players, setPlayers] = useState([]);
    const [colorDict, setColorDict] = useState({});

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
      if(selectedMatch != null) {
          const { players, colorDict } = getOtherPlayers(
              selectedMatch,
              selectedPlayer
          );
          setPlayers(players);
          setColorDict(colorDict);
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
                            onClick={() => handleAccordionClick(index, match)}>
                            {league ? league.name : "League not found"}: {team1}{" "}
                            vs {team2}
                        </Accordion.Header>
                        <Accordion.Body>
                            <div className="container mt-3">
                                <div className="row">
                                    {selectedMatch && (
                                        <div className="container mt-3">
                                            <CalendarResource
                                                initialCurrUserId={
                                                    selectedPlayer
                                                        ? selectedPlayer.user
                                                        : null
                                                }
                                                playerList={players}
                                                colorDict={colorDict}
                                                role={role}
                                            />
                                        </div>
                                    )}
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
