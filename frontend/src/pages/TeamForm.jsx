import React, { useState, useEffect } from 'react';
import api from '../api'; // Assuming you have an api module for making HTTP requests
import { Container, Row, Col, Form, Button, ListGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const PlayerTeamForm = () => {
  const [maleSingles, setMaleSingles] = useState([]);
  const [femaleSingles, setFemaleSingles] = useState([]);
  const [maleDoubles, setMaleDoubles] = useState([]);
  const [femaleDoubles, setFemaleDoubles] = useState([]);
  const [mixedDoubles, setMixedDoubles] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showSearchResults, setShowSearchResults] = useState(false); 

  const [playerLeagues, setPlayerLeagues] = useState({
    singles: false,
    doubles: false,
    mixed: false,
  });

  const [selectedCheckboxes, setSelectedCheckboxes] = useState({
    maleSingle: null,
    femaleSingle: null,
    maleDouble: null,
    femaleDouble: null,
    mixedDouble: null,
  });

  const [doublesSearch, setDoublesSearch] = useState({
    maleDouble: '',
    femaleDouble: '',
    mixedDouble: '',
  });
  const [doublesSelectedPlayers, setDoublesSelectedPlayers] = useState({
    maleDouble: null,
    femaleDouble: null,
    mixedDouble: null,
  });
  const [showDoublesSearchResults, setShowDoublesSearchResults] = useState({
    maleDouble: false,
    femaleDouble: false,
    mixedDouble: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [maleSinglesResponse, femaleSinglesResponse, maleDoublesResponse, femaleDoublesResponse, mixedDoublesResponse, playersResponse] = await Promise.all([
          api.get('/api/leagues/', { params: { type: 'S', gender: 'M' } }),
          api.get('/api/leagues/', { params: { type: 'S', gender: 'F' } }),
          api.get('/api/leagues/', { params: { type: 'D', gender: 'M' } }),
          api.get('/api/leagues/', { params: { type: 'D', gender: 'F' } }),
          api.get('/api/leagues/', { params: { type: 'D', gender: 'X' } }),
          api.get('/api/players/'),
        ]);

        setMaleSingles(maleSinglesResponse.data);
        setFemaleSingles(femaleSinglesResponse.data);
        setMaleDoubles(maleDoublesResponse.data);
        setFemaleDoubles(femaleDoublesResponse.data);
        setMixedDoubles(mixedDoublesResponse.data);
        setPlayers(playersResponse.data);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const filteredPlayers = (searchTerm, gender = null) => 
    players.filter((player) =>
      `${player.name} ${player.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) && 
      (!gender || player.gender === gender)
  );

  const handleSearchChange = (event) => {
    setSelectedPlayer(null);
    setSearchTerm(event.target.value);
    setShowSearchResults(true);
  };

  useEffect(() => {
    setPlayerLeagues({
      singles: false,
      doubles: false,
      mixed: false,
    });
  }, [selectedPlayer]);

  const handlePlayerClick = async (player) => {
    setSelectedPlayer(player);
    setSearchTerm(`${player.name} ${player.surname}`);
    setShowSearchResults(false); // Hide search results when a player is clicked

    try {
      const response = await api.get(`/api/leagues/?player_id=${player.id}`);
      const leaguesPlayer = response.data;
      for (var i in leaguesPlayer) {
        if (leaguesPlayer[i].type === "S") {
          setPlayerLeagues(prevState => ({
            ...prevState,
            singles: true,
          }));
        }
        else if (leaguesPlayer[i].gender === "X") {
          setPlayerLeagues(prevState => ({
            ...prevState,
            mixed: true,
          }));
        }
        else if (leaguesPlayer[i].type === "D" && leaguesPlayer[i].gender !== "X") {
          setPlayerLeagues(prevState => ({
            ...prevState,
            doubles: true,
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleCheckboxChange = (category, id) => {
    setSelectedCheckboxes((prevSelected) => ({
      ...prevSelected,
      [category]: id === prevSelected[category] ? null : id,
    }));
  };

  const handleDoublesSearchChange = (event, category) => {
    setDoublesSearch((prevSearch) => ({
      ...prevSearch,
      [category]: event.target.value,
    }));
    setShowDoublesSearchResults((prevShow) => ({
      ...prevShow,
      [category]: true,
    }));
    setDoublesSelectedPlayers((prevSelected) => ({
      ...prevSelected,
      [category]: null,
    }));
  };

  const handleDoublesPlayerClick = async (player, category, league) => {
    setDoublesSearch((prevSearch) => ({
      ...prevSearch,
      [category]: `${player.name} ${player.surname}`,
    }));
    setShowDoublesSearchResults((prevShow) => ({
      ...prevShow,
      [category]: false,
    }));
    
    try {
      const response = await api.get(`/api/leagues/?player_id=${player.id}`);
      const leaguesPlayer = response.data;
      for (var i in leaguesPlayer) {
        if (leaguesPlayer[i].type === league.type && leaguesPlayer[i].gender === league.gender) {
          alert("This player is already enrolled in this league");
          setDoublesSearch((prevSearch) => ({
            ...prevSearch,
            [category]: "",
          }));
          return;
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }

    setDoublesSelectedPlayers((prevSelected) => ({
      ...prevSelected,
      [category]: player,
    }));
  };

  const createTeam = (league, player1, player2 = null) => {
    api.post("api/teams/", {
      league: league,
      player1: player1.id,
      player2: player2 ? player2.id : null,
      type: player2 ? "D" : "S",
    })
      .then((res) => {
        if (res.status === 201) console.log("Team saved!");
        else alert("Failed to make team.");
      })
      .catch((err) => alert(err));
  }

  const handleSubmit = async () => {
    if (!selectedPlayer) {
      alert('Please select a player');
      return;
    }

    const selectedLeagues = Object.values(selectedCheckboxes).filter(id => id !== null);
    if (selectedLeagues.length === 0) {
      alert('Please select at least one league');
      return;
    }

    try {
      selectedLeagues.forEach((league) => {
        if (selectedCheckboxes.maleDouble === league) {
          if (doublesSelectedPlayers.maleDouble) {
            createTeam(league, selectedPlayer, doublesSelectedPlayers.maleDouble);
          } else {
            alert("Choose partner for male doubles")
          }
        } else if (selectedCheckboxes.femaleDouble === league) {
          if (doublesSelectedPlayers.femaleDouble) {
            createTeam(league, selectedPlayer, doublesSelectedPlayers.femaleDouble);
          } else {
            alert("Choose partner for female doubles");
          }
        } else if (selectedCheckboxes.mixedDouble === league) {
          if (doublesSelectedPlayers.mixedDouble) {
            createTeam(league, selectedPlayer, doublesSelectedPlayers.mixedDouble);
          } else {
            alert("Choose partner for mixed doubles");
          }
        } else {
          createTeam(league, selectedPlayer);
        }
      });

      // Reset form after successful submission
      setSelectedPlayer(null);
      setSelectedCheckboxes({
        maleSingle: null,
        femaleSingle: null,
        maleDouble: null,
        femaleDouble: null,
        mixedDouble: null,
      });
      setSearchTerm('');
      setDoublesSearch({
        maleDouble: '',
        femaleDouble: '',
        mixedDouble: '',
      });
      setDoublesSelectedPlayers({
        maleDouble: null,
        femaleDouble: null,
        mixedDouble: null,
      });
      setShowDoublesSearchResults({
        maleDouble: false,
        femaleDouble: false,
        mixedDouble: false,
      });
    }
    catch (error) {
      console.error('Error creating team:', error);
      alert('Failed to create team');
    }
  };

  return (
    <Container className="mt-4">
      <Row className="d-flex justify-content-center">
        <Col md={4}>
          <Form.Group className="my-4">
            <Form.Control
              type="text"
              placeholder="Search players..."
              value={selectedPlayer ? `${selectedPlayer.name} ${selectedPlayer.surname}` : searchTerm}
              onChange={handleSearchChange}
            />
            {showSearchResults && filteredPlayers(searchTerm).length > 0 && (
              <ListGroup className="mt-2">
                {filteredPlayers(searchTerm).map((player) => (
                  <ListGroup.Item
                    key={player.id}
                    action
                    onClick={() => handlePlayerClick(player)}
                  >
                    {player.name} {player.surname}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Form.Group>
        </Col>
      </Row>
      <Row>
        {/* Singles Column */}
        <Col md={6}>
          <h3 className="text-center">Singles</h3>
          <Form.Group className="mb-3">
            <h4>Male Singles</h4>
            <ListGroup>
              {maleSingles.map((league) => (
                <ListGroup.Item key={league.id}>
                  <Form.Check
                    type="checkbox"
                    id={`maleSingle_${league.id}`}
                    label={league.name}
                    checked={selectedCheckboxes.maleSingle === league.id}
                    onChange={() => handleCheckboxChange('maleSingle', league.id)}
                    disabled={!selectedPlayer || selectedPlayer.gender === 'F' || playerLeagues.singles}
                  />
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <h4>Female Singles</h4>
            <ListGroup>
              {femaleSingles.map((league) => (
                <ListGroup.Item key={league.id}>
                  <Form.Check
                    type="checkbox"
                    id={`femaleSingle_${league.id}`}
                    label={league.name}
                    checked={selectedCheckboxes.femaleSingle === league.id}
                    onChange={() => handleCheckboxChange('femaleSingle', league.id)}
                    disabled={!selectedPlayer || selectedPlayer.gender === 'M' || playerLeagues.singles}
                  />
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Form.Group>
        </Col>
  
        {/* Doubles Column */}
        <Col md={6}>
          <h3 className="text-center">Doubles</h3>
          <Form.Group className="mb-3">
            <h4>Male Doubles</h4>
            <ListGroup>
              {maleDoubles.map((league) => (
                <ListGroup.Item key={league.id}>
                  <Form.Check
                    type="checkbox"
                    id={`maleDouble_${league.id}`}
                    label={league.name}
                    checked={selectedCheckboxes.maleDouble === league.id}
                    onChange={() => handleCheckboxChange('maleDouble', league.id)}
                    disabled={!selectedPlayer || selectedPlayer.gender === 'F' || playerLeagues.doubles}
                  />
                  {selectedCheckboxes.maleDouble === league.id && (
                    <div className="mt-2">
                      <Form.Control
                        type="text"
                        placeholder="Search doubles partner..."
                        value={doublesSelectedPlayers.maleDouble ? `${doublesSelectedPlayers.maleDouble.name} ${doublesSelectedPlayers.maleDouble.surname}` : doublesSearch.maleDouble}
                        onChange={(e) => handleDoublesSearchChange(e, 'maleDouble')}
                      />
                      {showDoublesSearchResults.maleDouble && filteredPlayers(doublesSearch.maleDouble, 'M').length > 0 && (
                        <ListGroup className="mt-2">
                          {filteredPlayers(doublesSearch.maleDouble, 'M').map((player) => (
                            <ListGroup.Item
                              key={player.id}
                              action
                              onClick={() => handleDoublesPlayerClick(player, 'maleDouble', league)}
                            >
                              {player.name} {player.surname}
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      )}
                    </div>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <h4>Female Doubles</h4>
            <ListGroup>
              {femaleDoubles.map((league) => (
                <ListGroup.Item key={league.id}>
                  <Form.Check
                    type="checkbox"
                    id={`femaleDouble_${league.id}`}
                    label={league.name}
                    checked={selectedCheckboxes.femaleDouble === league.id}
                    onChange={() => handleCheckboxChange('femaleDouble', league.id)}
                    disabled={!selectedPlayer || selectedPlayer.gender === 'M' || playerLeagues.doubles}
                  />
                  {selectedCheckboxes.femaleDouble === league.id && (
                    <div className="mt-2">
                      <Form.Control
                        type="text"
                        placeholder="Search doubles partner..."
                        value={doublesSelectedPlayers.femaleDouble ? `${doublesSelectedPlayers.femaleDouble.name} ${doublesSelectedPlayers.femaleDouble.surname}` : doublesSearch.femaleDouble}
                        onChange={(e) => handleDoublesSearchChange(e, 'femaleDouble')}
                      />
                      {showDoublesSearchResults.femaleDouble && filteredPlayers(doublesSearch.femaleDouble, 'F').length > 0 && (
                        <ListGroup className="mt-2">
                          {filteredPlayers(doublesSearch.femaleDouble, 'F').map((player) => (
                            <ListGroup.Item
                              key={player.id}
                              action
                              onClick={() => handleDoublesPlayerClick(player, 'femaleDouble', league)}
                            >
                              {player.name} {player.surname}
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      )}
                    </div>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <h4>Mixed Doubles</h4>
            <ListGroup>
              {mixedDoubles.map((league) => (
                <ListGroup.Item key={league.id}>
                  <Form.Check
                    type="checkbox"
                    id={`mixedDouble_${league.id}`}
                    label={league.name}
                    checked={selectedCheckboxes.mixedDouble === league.id}
                    onChange={() => handleCheckboxChange('mixedDouble', league.id)}
                    disabled={!selectedPlayer || playerLeagues.mixed}
                  />
                  {selectedCheckboxes.mixedDouble === league.id && (
                    <div className="mt-2">
                      <Form.Control
                        type="text"
                        placeholder="Search doubles partner..."
                        value={doublesSelectedPlayers.mixedDouble ? `${doublesSelectedPlayers.mixedDouble.name} ${doublesSelectedPlayers.mixedDouble.surname}` : doublesSearch.mixedDouble}
                        onChange={(e) => handleDoublesSearchChange(e, 'mixedDouble')}
                      />
                      {showDoublesSearchResults.mixedDouble && filteredPlayers(doublesSearch.mixedDouble, selectedPlayer.gender === 'M' ? 'F' : 'M').length > 0 && (
                        <ListGroup className="mt-2">
                          {filteredPlayers(doublesSearch.mixedDouble, selectedPlayer.gender === 'M' ? 'F' : 'M').map((player) => (
                            <ListGroup.Item
                              key={player.id}
                              action
                              onClick={() => handleDoublesPlayerClick(player, 'mixedDouble', league)}
                            >
                              {player.name} {player.surname}
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      )}
                    </div>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Form.Group>
        </Col>
      </Row>
      <Row className="d-flex justify-content-center">
        <Button variant="primary" className="mt-3 w-25" onClick={handleSubmit}>Submit</Button>
      </Row>
    </Container>
  ); 
};

export default PlayerTeamForm;
