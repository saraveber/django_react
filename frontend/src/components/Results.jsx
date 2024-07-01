import React, { useState, useEffect } from 'react';
import api from '../api'; // Assuming you have an api module for making HTTP requests
import { Button, Container, Row, Col, Table, ListGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Results = () => {
    const [leagues, setLeagues] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedLeague, setSelectedLeague] = useState(null);
    const [newRound, setNewRound] = useState(false);

    useEffect(() => {
        getData();
    }, []);

    const getData = async () => {
        setLoading(true);
        try {
            // Fetch leagues and teams data concurrently
            const [leaguesResponse, teamsResponse, playersResponse] = await Promise.all([
                api.get('/api/leagues/'),
                api.get('/api/teams/'),
                api.get('/api/players/'),
            ]);

            // Get data from response
            const leaguesData = leaguesResponse.data;
            const teamsData = teamsResponse.data;
            const playersData = playersResponse.data;

            // Create a player lookup map
            const playerLookup = playersData.reduce((acc, player) => {
                acc[player.id] = `${player.name} ${player.surname}`;
                return acc;
            }, {});

            const combinedData = leaguesData.map(league => {
                // Filter and map teams for the current league
                const leagueTeams = teamsData
                    .filter(team => team.league === league.id)
                    .map(team => ({
                        ...team,
                        player1_name: playerLookup[team.player1] || 'N/A',
                        player2_name: team.player2 ? playerLookup[team.player2] : 'N/A'
                    }));

                // Create matches (pairs of teams)
                const matches = generateRandomMatches(leagueTeams, playersData);

                return {
                    ...league,
                    teams: leagueTeams,
                    matches: matches
                };
            });

            setLeagues(combinedData);
            setSelectedLeague(combinedData.length > 0 ? combinedData[0] : null); // Select the first league by default
        } catch (error) {
            console.error('Error fetching data:', error);
            // Handle error state if needed
        } finally {
            setLoading(false);
        }
    };

    // Function to generate random matches
    const generateRandomMatches = (teams, playersData) => {
        const matches = [];
        const usedTeams = new Set(); // To track used teams

        // Iterate through teams and pick random teams
        while (usedTeams.size < teams.length - 1) {
            const randomTeam1 = getRandomTeam(teams, usedTeams);
            const randomTeam2 = getRandomTeam(teams, usedTeams);

            matches.push({
                team1: {
                    ...randomTeam1,
                    players: getTeamPlayers(randomTeam1, playersData)
                },
                team2: {
                    ...randomTeam2,
                    players: getTeamPlayers(randomTeam2, playersData)
                }
            });
        };

        return matches;
    };

    // Function to get random team not already used
    const getRandomTeam = (teams, usedTeams) => {
        const availableTeams = teams.filter(team => !usedTeams.has(team.id));
        const randomIndex = Math.floor(Math.random() * availableTeams.length);
        const randomTeam = availableTeams[randomIndex];

        if (randomTeam) {
            usedTeams.add(randomTeam.id); // Mark team as used
        }

        return randomTeam;
    };

    // Function to get players' names from team
    const getTeamPlayers = (team, playersData) => {
        const players = [];
        if (team.player1) {
            const player1 = playersData.find(player => player.id === team.player1);
            if (player1) {
                players.push(`${player1.name} ${player1.surname}`);
            }
        }
        if (team.player2) {
            const player2 = playersData.find(player => player.id === team.player2);
            if (player2) {
                players.push(`${player2.name} ${player2.surname}`);
            }
        }
        return players.length > 0 ? players.join(' & ') : 'N/A';
    };

    const handleLeagueClick = (league) => {
        setSelectedLeague(league);
    };

    const handleAddNewRound = async () => {
        setNewRound(true);
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
                                        <th>Player 2</th>
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
                                            <td>{team.player1_name}</td>
                                            <td>{team.player2_name ? team.player2_name : '-'}</td>
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
                                                    <td>{match.team1.player1_name} {match.team1.player2_name ? `& ${match.team1.player2_name}` : ''}</td>
                                                    <td>{match.team2 ? `${match.team2.player1_name} ${match.team2.player2_name ? `& ${match.team2.player2_name}` : ''}` : 'N/A'}</td>
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
