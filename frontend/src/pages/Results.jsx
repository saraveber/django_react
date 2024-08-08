import React, { useState, useEffect } from 'react';
import api from '../api'; // Assuming you have an api module for making HTTP requests
import { useUser } from "../context/UserContext";
import { Button, Container, Row, Col, Table, ListGroup, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Results = () => {
    const { currUser, role, authorised } = useUser();
    const [leagues, setLeagues] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedLeague, setSelectedLeague] = useState(null);
    const [totalRounds, setTotalRounds] = useState(8); // Total number of rounds to generate
    const [displayedRounds, setDisplayedRounds] = useState(0); // Number of rounds to display initially
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

            const activeRoundsCount = roundsData.filter(round => round.is_active).length;
            setDisplayedRounds(activeRoundsCount)

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
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateRoundRobinMatches = async (leagueId, teams) => {
        const matches = [];
        const teamCount = teams.length;
    
        // If odd number of teams, add a dummy team for bye
        const isOdd = teamCount % 2 !== 0;
        if (isOdd) {
            teams.push({ id: -1, name: 'Bye' }); // -1 denotes a bye week
        }
    
        const half = teams.length / 2;
    
        for (let roundNumber = 1; roundNumber <= totalRounds; roundNumber++) {
            const roundMatches = [];
    
            for (let i = 0; i < half; i++) {
                const team1 = teams[i];
                const team2 = teams[teams.length - 1 - i];
    
                if (team1.id !== -1 && team2.id !== -1) {
                    const match = {
                        league: leagueId,
                        round_number: roundNumber,
                        team_host: team1.id,
                        team_guest: team2.id,
                        gem_result: null,
                        set_result: null,
                    };
    
                    try {
                        const response = await api.post('/api/matches/', match);
                        roundMatches.push(response.data);
                    } catch (error) {
                        console.error('Error saving match:', error.response.data);
                    }
                }
            }
    
            matches.push(...roundMatches);
    
            // Rotate teams, keep the first team in place
            teams.splice(1, 0, teams.pop());
        }
    
        return matches;
    };
    
    const handleAddNewRound = async () => {
        if (!newRoundData.endDate) {
            alert("Please select an end date for the new round.");
            return;
        }
    
        setLoading(true);
        try {

            const currentDate = new Date();
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');  // Adding 1 to month index, padding with 0 if necessary
            const day = String(currentDate.getDate()).padStart(2, '0');  // Padding with 0 if necessary
            const formattedDate = `${year}-${month}-${day}`;

            if (displayedRounds == 0) {

                const newRounds = [];
                for (let i = 0; i < totalRounds; i++) {
                    const roundNumber = i + 1;
                    const newRound = {
                        round_number: roundNumber,
                        start_date: roundNumber <= 2 ? formattedDate : null,
                        end_date: roundNumber <= 2 ? newRoundData.endDate : null,
                        is_active: roundNumber <= 2 ? true : false,
                    };
        
                    try {
                        await api.post('/api/rounds/', newRound);
                    } catch (error) {
                        console.error('Error saving match:', error.response.data);
                    }

                    newRounds.push(newRound);
                }
        
                for (const league of leagues) {
                    await generateRoundRobinMatches(league.id, league.teams);
                }
            }
            else {
                await api.put(`/api/rounds/${displayedRounds+1}/`, {is_active: true, start_date: formattedDate, end_date: newRoundData.endDate});
                await api.put(`/api/rounds/${displayedRounds+2}/`, {is_active: true, start_date: formattedDate, end_date: newRoundData.endDate});
            }
    
            getData();
        } catch (error) {
            console.error('Error generating rounds:', error);
        } finally {
            setLoading(false);
        }
    };    

    const handleLeagueClick = (league) => {
        setSelectedLeague(league);
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
            {role === 'staff' || role === 'admin' ? (
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
            ) : null}
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
                                    {selectedLeague.rounds.slice(0, displayedRounds).map(round => (
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
