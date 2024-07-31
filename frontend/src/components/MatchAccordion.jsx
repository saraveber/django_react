import React from "react";
import { Accordion, Card, Button } from 'react-bootstrap';
import AvailableTerm from "../components/AvailableTerm";

function MatchAccordion({ matches, leagues }) {

  const formatTeamPlayers = (team) => {
    return [team.player1_obj, team.player2_obj]
      .map((player) => (player ? `${player.name} ${player.surname}` : ""))
      .filter(Boolean)
      .join(", ");
  };

  return (


        <Accordion defaultActiveKey="0">
      {matches.map((match, index) => {
        const league = leagues.find((l) => l.id === match.league);
        const team1 = formatTeamPlayers(match.team_host_obj);
        const team2 = formatTeamPlayers(match.team_guest_obj);
        return (
          <Accordion.Item eventKey={index.toString()} key={match.id}>
          <Accordion.Header>
            {league ? league.name : "League not found"}: {team1} vs {team2}
          </Accordion.Header>
          <Accordion.Body>
            <div>
              <h5>Terms that work for all players:</h5>
            </div>
            {match.overlap_terms.map((term, termIndex) => (
              <AvailableTerm key={termIndex} term={term} />
            ))}
          </Accordion.Body>
        </Accordion.Item>
        );
      })}
    </Accordion>

   


  );
}

export default MatchAccordion