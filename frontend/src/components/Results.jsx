import React, { useState, useEffect } from 'react';
import api from '../api'; // Assuming you have an api module for making HTTP requests
import { Button, Container, Row, Col, Table, ListGroup, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Results = () => {
    const [leagues, setLeagues] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedLeague, setSelectedLeague] = useState(null);
    const [newRound, setNewRound] = useState(false);
    const [newRoundData, setNewRoundData] = useState({
        endDate: '',
        playoffRound: null,
        numberOfPlayers: null,
    });

    useEffect(() => {
        getData();
    }, []);

    const getData = async () => {
        setLoading(true);
        try {
            const [leaguesResponse, teamsResponse] = await Promise.all([
                api.get('/api/leagues/'),
                api.get('/api/teams/'),
            ]);

            const leaguesData = leaguesResponse.data;
            const teamsData = teamsResponse.data;

            const combinedData = leaguesData.map(league => {
                const leagueTeams = teamsData.filter(team => team.league === league.id);

                leagueTeams.sort((a, b) => {
                    if (a.points === b.points) {
                        return b.wins - a.wins;
                    }
                    return b.points - a.points;
                });

                leagueTeams.forEach((team, index) => {
                    team.place = index + 1;
                });

                const matches = generateRandomMatches(leagueTeams);

                return {
                    ...league,
                    teams: leagueTeams,
                    matches: matches
                };
            });

            setLeagues(combinedData);
            setSelectedLeague(combinedData.length > 0 ? combinedData[0] : null);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateRandomMatches = (teams) => {
        const matches = [];
        const usedTeams = new Set();

        while (usedTeams.size < teams.length - 1) {
            const randomTeam1 = getRandomTeam(teams, usedTeams);
            const randomTeam2 = getRandomTeam(teams, usedTeams);

            matches.push({
                team1: randomTeam1,
                team2: randomTeam2
            });
        }

        return matches;
    };

    const getRandomTeam = (teams, usedTeams) => {
        const availableTeams = teams.filter(team => !usedTeams.has(team.id));
        const randomIndex = Math.floor(Math.random() * availableTeams.length);
        const randomTeam = availableTeams[randomIndex];

        if (randomTeam) {
            usedTeams.add(randomTeam.id);
        }

        return randomTeam;
    };

    const handleLeagueClick = (league) => {
        setSelectedLeague(league);
    };

    const handleAddNewRound = async () => {
        if (!newRoundData.endDate) {
            alert("Please select an end date for the new round.");
            return;
        }

        setNewRound(true);

        api.get("api/rounds/")
            .then((res) => res.data)
            .then((data) => {
                const max_rounds = data.length;

                const newRound = {
                    league: selectedLeague.id,
                    round_number: max_rounds + 1,
                    end_date: newRoundData.endDate,
                    playoff_round: newRoundData.playoffRound,
                    number_of_players: newRoundData.numberOfPlayers,
                };

                try {
                    setLoading(true);
                    api.post("api/rounds/", newRound)
                        .then((res) => {
                            if (res.status === 201) console.log("Round saved!");
                            else alert("Failed to make round.");
                        })
                        .catch((err) => alert(err));
                } finally {
                    setLoading(false);
                }
            })
            .catch((err) => alert(err));
    };

    const handleDateChange = (event) => {
        setNewRoundData({ ...newRoundData, endDate: event.target.value });
    };

    return (
        <Container>
            <Row className="justify-content-md-center mt-5">
                <Col md="auto">
                    <h1>Match Results</h1>
                </Col>
            </Row>
            <Row className="justify-content-md-center mt-3">
                <Col md="auto">
                    Choose end date for next round:
                    <Form.Control 
                        type="date" 
                        value={newRoundData.endDate} 
                        onChange={handleDateChange} 
                        placeholder="Select end date" 
                    />
                </Col>
                <Col md="auto">
                    <Button variant="primary" onClick={handleAddNewRound} disabled={loading}>
                        {loading ? 'Loading...' : 'Add New Round'}
                    </Button>
                </Col>
            </Row>
            <Row className="mt-3">
                <Col md="auto">
                    <ListGroup>
                        {leagues.map(league => (
                            <ListGroup.Item
                                key={league.id}
                                action
                                active={selectedLeague && selectedLeague.id === league.id}
                                onClick={() => handleLeagueClick(league)}
                            >
                                {league.name}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Col>
                <Col>
                    {selectedLeague && (
                        <div>
                            <h2>{selectedLeague.name}</h2>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Place</th>
                                        <th>Player 1</th>
                                        {selectedLeague.type !== 'S' && <th>Player 2</th>}
                                        <th>Matches Played</th>
                                        <th>Wins</th>
                                        <th>Losses</th>
                                        <th>Points</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedLeague.teams.map(team => (
                                        <tr key={team.id}>
                                            <td>{team.place}</td>
                                            <td>{team.player1_obj ? `${team.player1_obj.name} ${team.player1_obj.surname}` : 'N/A'}</td>
                                            {selectedLeague.type !== 'S' && (
                                                <td>{team.player2_obj ? `${team.player2_obj.name} ${team.player2_obj.surname}` : '-'}</td>
                                            )}
                                            <td>{team.number_of_played_matches}</td>
                                            <td>{team.wins}</td>
                                            <td>{team.losses}</td>
                                            <td>{team.points}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                            {newRound && selectedLeague.matches && selectedLeague.matches.length > 0 && (
                                <>
                                    <h3>New Matches</h3>
                                    <Table striped bordered hover>
                                        <thead>
                                            <tr>
                                                <th>Match</th>
                                                <th>Team 1</th>
                                                <th>Team 2</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedLeague.matches.map((match, index) => (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>
                                                        {match.team1.player1_obj ? `${match.team1.player1_obj.name} ${match.team1.player1_obj.surname}` : 'N/A'}
                                                        {selectedLeague.type !== 'S' && match.team1.player2_obj ? ` & ${match.team1.player2_obj.name} ${match.team1.player2_obj.surname}` : ''}
                                                    </td>
                                                    <td>
                                                        {match.team2.player1_obj ? `${match.team2.player1_obj.name} ${match.team2.player1_obj.surname}` : 'N/A'}
                                                        {selectedLeague.type !== 'S' && match.team2.player2_obj ? ` & ${match.team2.player2_obj.name} ${match.team2.player2_obj.surname}` : ''}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </>
                            )}
                        </div>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default Results;
