import React, { useState, useEffect } from 'react';
import api from '../api'; // Assuming you have an api module for making HTTP requests
import { Button, Container, Row, Col, Table, ListGroup, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Results = () => {
    const [leagues, setLeagues] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedLeague, setSelectedLeague] = useState(null);
    const [rounds, setRounds] = useState(0);
    const [newRoundData, setNewRoundData] = useState({
        endDate: '',
    });

    useEffect(() => {
        getData();
    }, []);

    const getData = async () => {
        setLoading(true);
        try {
            const [leaguesResponse, teamsResponse, roundsResponse, matchesResponse] = await Promise.all([
                api.get('/api/leagues/'),
                api.get('/api/teams/'),
                api.get('/api/rounds/'),
                api.get('/api/matches/'),
            ]);

            const leaguesData = leaguesResponse.data;
            const teamsData = teamsResponse.data;
            const roundsData = roundsResponse.data;
            const matchesData = matchesResponse.data;

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

                const leagueRounds = roundsData;
                const leagueMatches = matchesData.filter(match => match.league === league.id);

                const roundsWithMatches = leagueRounds.map(round => {
                    const matchesForRound = leagueMatches
                        .filter(match => match.round_number === round.round_number)
                        .map(match => ({
                            ...match,
                            team_host: {
                                ...match.team_host,
                                player1_obj: teamsData.find(team => team.id === match.team_host)?.player1_obj || null,
                                player2_obj: teamsData.find(team => team.id === match.team_host)?.player2_obj || null,
                            },
                            team_guest: {
                                ...match.team_guest,
                                player1_obj: teamsData.find(team => team.id === match.team_guest)?.player1_obj || null,
                                player2_obj: teamsData.find(team => team.id === match.team_guest)?.player2_obj || null,
                            },
                        }));
                    
                    return {
                        ...round,
                        matches: matchesForRound,
                    };
                });

                return {
                    ...league,
                    teams: leagueTeams,
                    rounds: roundsWithMatches,
                };
            });

            setLeagues(combinedData);
            setSelectedLeague(combinedData.length > 0 ? combinedData[0] : null);

            const maxRounds = Math.max(...combinedData.map(league => league.rounds.length));
            setRounds(maxRounds);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };


    const generateRandomMatches = async (leagueId, roundNumber, teams) => {
        const matches = [];
        const usedTeams = new Set();

        while (usedTeams.size < teams.length - 1) {
            const randomTeam1 = getRandomTeam(teams, usedTeams);
            const randomTeam2 = getRandomTeam(teams, usedTeams);

            const match = {
                league: leagueId,
                round_number: roundNumber,
                team_host: randomTeam1.id,
                team_guest: randomTeam2.id,
            };

            try {
                const response = await api.post('/api/matches/', match);
                matches.push(response.data);
            } catch (error) {
                console.error('Error saving match:', error.response.data);
            }
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

        setLoading(true);
        try {
            const newRounds = [];

            for (let i = 0; i < 2; i++) {
                const roundNumber = rounds + i + 1;
                const newRound = {
                    round_number: roundNumber,
                    start_date: new Date(),
                    end_date: newRoundData.endDate,
                };

                await api.post('/api/rounds/', newRound);
                newRounds.push(newRound);
            }

            for (const league of leagues) {
                for (const round of newRounds) {
                    await generateRandomMatches(league.id, round.round_number, league.teams);
                }
            }

            setRounds(rounds + 2);
            getData();
        } catch (error) {
            console.error('Error generating rounds:', error);
        } finally {
            setLoading(false);
        }
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
                            {selectedLeague.rounds && selectedLeague.rounds.length > 0 && (
                                <>
                                    <h3>New Matches</h3>
                                    {selectedLeague.rounds.map(round => (
                                        <div key={round.round_number}>
                                            <h4>Round {round.round_number}</h4>
                                            <Table striped bordered hover>
                                                <thead>
                                                    <tr>
                                                        <th>Match</th>
                                                        <th>Team 1</th>
                                                        <th>Team 2</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {round.matches.map((match, index) => (
                                                        <tr key={index}>
                                                            <td>{index + 1}</td>
                                                            <td>
                                                                {match.team_host.player1_obj ? `${match.team_host.player1_obj.name} ${match.team_host.player1_obj.surname}` : 'N/A'}
                                                                {selectedLeague.type !== 'S' && match.team_host.player2_obj ? ` & ${match.team_host.player2_obj.name} ${match.team_host.player2_obj.surname}` : ''}
                                                            </td>
                                                            <td>
                                                                {match.team_guest.player1_obj ? `${match.team_guest.player1_obj.name} ${match.team_guest.player1_obj.surname}` : 'N/A'}
                                                                {selectedLeague.type !== 'S' && match.team_guest.player2_obj ? ` & ${match.team_guest.player2_obj.name} ${match.team_guest.player2_obj.surname}` : ''}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                    ))}
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
