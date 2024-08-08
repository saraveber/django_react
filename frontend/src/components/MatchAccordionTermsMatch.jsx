import React, { useState } from "react";
import { Accordion, Card, Button } from 'react-bootstrap';
import AvailableTerm from "./AvailableTerm";

function MatchAccordionTermsMatch({ matches, leagues }) {
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
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {match.overlap_terms.map((term, termIndex) => (
                  <div key={termIndex} style={{ flex: "1 1 calc(33.333% - 10px)" }}>
                    <AvailableTerm
                      term={term}
                      isSelected={selectedTerm === term}
                      onSelect={handleSelectTerm}
                    />
                  </div>
                ))}
              </div>
              <Button
                variant="success"
                onClick={handleReserve}
                disabled={!selectedTerm}
                style={{ marginTop: "10px" }}
              >
                Assign a match
              </Button>
            </Accordion.Body>
          </Accordion.Item>
        );
      })}
    </Accordion>
  );
}

export default MatchAccordionTermsMatch;