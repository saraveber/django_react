import React, { useState } from "react";
import { Accordion, Card, Button } from 'react-bootstrap';
import AvailableTerm from "./AvailableTerm";

function MatchAccordionTermsDontMatch({ matches, leagues }) {
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [activeKey, setActiveKey] = useState("0");

  const formatTeamPlayers = (team) => {
    return [team.player1_obj, team.player2_obj]
      .map((player) => (player ? `${player.name} ${player.surname}` : ""))
      .filter(Boolean)
      .join(", ");
  };

  const handleSelectTerm = (term) => {
    setSelectedTerm(term === selectedTerm ? null : term);
  };

  const handleReserve = () => {
    if (selectedTerm) {
      // Add reservation logic here
      console.log("Reserved term:", selectedTerm);
    }
  };

  const handleAccordionClick = (index) => {
    if (activeKey === index.toString()) {
      setActiveKey(null); // Close the accordion if it's already open
    } else {
      setSelectedTerm(null);
      setActiveKey(index.toString());
    }
  };

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
              onClick={() => handleAccordionClick(index)}
            >
              {league ? league.name : "League not found"}: {team1} vs {team2}
            </Accordion.Header>
            <Accordion.Body>
              
            </Accordion.Body>
          </Accordion.Item>
        );
      })}
    </Accordion>
  );
}

export default MatchAccordionTermsDontMatch;