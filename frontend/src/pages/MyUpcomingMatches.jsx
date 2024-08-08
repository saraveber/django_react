import React, { useEffect, useState } from 'react';
import { useUser } from "../context/UserContext";
import { Container, Row, Col, ListGroup, Card, Spinner } from 'react-bootstrap';
import api from "../api"; // Import the API instance

const MyUpcomingMatches = () => {
    const { currUser, role, authorised } = useUser();
    const [matches, setMatches] = useState([]);

    useEffect(() => {
        fetchMyAssignedMatches();
    }, []);

    const fetchMyAssignedMatches = async () => {
        try {
          const response = await api.get(`/api/assignedmatches/?id=${currUser.id}`);
          setMatches(response.data);
        } catch (error) {
          console.error("Error fetching assigned matches:", error);
        }
      };

    const getTeamNames = (match) => {
        const hostPlayer1 = match.match_obj.team_host_obj.player1_obj;
        const hostPlayer2 = match.match_obj.team_host_obj.player2_obj;
        const guestPlayer1 = match.match_obj.team_guest_obj.player1_obj;
        const guestPlayer2 = match.match_obj.team_guest_obj.player2_obj;
        if (hostPlayer2) {
            return `${hostPlayer1.name} ${hostPlayer1.surname} and ${hostPlayer2.name} ${hostPlayer2.surname} : ${guestPlayer1.name} ${guestPlayer1.surname} and ${guestPlayer2.name} ${guestPlayer2.surname}`;
        }
        return `${hostPlayer1.name} ${hostPlayer1.surname} : ${guestPlayer1.name} ${guestPlayer1.surname}`;
    };

    return (
        <Container>
            <h1 className="my-4">My Upcoming Matches</h1>
            {matches.length === 0 ? (
                <div className="alert alert-info">No upcoming matches.</div>
            ) : (
                <Row>
                    {matches.map((match) => (
                        <Col md={6} lg={4} key={match.id} className="mb-4">
                            <Card>
                                <Card.Header>
                                    <h5><strong>{getTeamNames(match)}</strong></h5>
                                </Card.Header>
                                <Card.Body>
                                    <Card.Title>Match Details</Card.Title>
                                    <ListGroup variant="flush">
                                        <ListGroup.Item>
                                            <strong>Date:</strong> {new Date(match.start_date).toLocaleDateString()}
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <strong>Time:</strong> {new Date(match.start_date).toLocaleTimeString()} - {new Date(match.end_date).toLocaleTimeString()}
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <strong>Tennis Field:</strong> {match.tennis_field}
                                        </ListGroup.Item>
                                        {match.is_cancelled && (
                                            <ListGroup.Item>
                                                <strong>Cancellation Details:</strong> 
                                                {match.reason_for_cancellation || 'No reason provided'}
                                            </ListGroup.Item>
                                        )}
                                    </ListGroup>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default MyUpcomingMatches;
