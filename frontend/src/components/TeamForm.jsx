import React, { useState, useEffect } from 'react';
import api from '../api'; // Assuming you have an api module for making HTTP requests
import '../styles/TeamForm.css'; // Import the CSS file for styling

const PlayerTeamForm = () => {
  const [maleSingles, setMaleSingles] = useState([]);
  const [femaleSingles, setFemaleSingles] = useState([]);
  const [maleDoubles, setMaleDoubles] = useState([]);
  const [femaleDoubles, setFemaleDoubles] = useState([]);
  const [mixedDoubles, setMixedDoubles] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showSearchResults, setShowSearchResults] = useState(false); // State to control visibility of search results

  const [selectedCheckboxes, setSelectedCheckboxes] = useState({
    maleSingle: null,
    femaleSingle: null,
    maleDouble: null,
    femaleDouble: null,
    mixedDouble: null,
  });

  // State to control search for doubles players
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
        setPlayers(playersResponse.data); // Assuming response.data is an array of player objects

      } catch (error) {
        console.error('Error fetching data:', error);
        // Handle error state if needed
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
    setSelectedPlayer(null); // Reset selected player when typing in search field
    setSearchTerm(event.target.value);
    setShowSearchResults(true); // Show search results when typing
  };

  const handlePlayerClick = (player) => {
    setSelectedPlayer(player);
    setSearchTerm(`${player.name} ${player.surname}`);
    setShowSearchResults(false); // Hide search results when a player is clicked
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

  const handleDoublesPlayerClick = (player, category) => {
    setDoublesSelectedPlayers((prevSelected) => ({
      ...prevSelected,
      [category]: player,
    }));
    setDoublesSearch((prevSearch) => ({
      ...prevSearch,
      [category]: `${player.name} ${player.surname}`,
    }));
    setShowDoublesSearchResults((prevShow) => ({
      ...prevShow,
      [category]: false,
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
          createTeam(league, selectedPlayer, doublesSelectedPlayers.maleDouble);
        } else if (selectedCheckboxes.femaleDouble === league) {
          createTeam(league, selectedPlayer, doublesSelectedPlayers.femaleDouble);
        } else if (selectedCheckboxes.mixedDouble === league) {
          createTeam(league, selectedPlayer, doublesSelectedPlayers.mixedDouble);
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
      //alert('Teams successfully created!');
    }
    catch (error) {
      console.error('Error creating team:', error);
      alert('Failed to create team');
    }
  };

  return (
    <div className="PlayerTeamForm">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search players..."
          value={selectedPlayer ? `${selectedPlayer.name} ${selectedPlayer.surname}` : searchTerm}
          onChange={handleSearchChange}
        />
        {showSearchResults && filteredPlayers(searchTerm).length > 0 && (
          <ul className="search-results">
            {filteredPlayers(searchTerm).map((player) => (
              <li key={player.id} onClick={() => handlePlayerClick(player)}>
                {player.name} {player.surname}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="columns">
        {/* Singles Column */}
        <div className="column">
          <h3>Singles</h3>
          <div className="checkbox-container">
            <h4>Male Singles</h4>
            <ul>
              {maleSingles.map((league) => (
                <li key={league.id}>
                  <input
                    type="checkbox"
                    id={`maleSingle_${league.id}`}
                    checked={selectedCheckboxes.maleSingle === league.id}
                    onChange={() => handleCheckboxChange('maleSingle', league.id)}
                    disabled={!selectedPlayer || selectedPlayer.gender === 'F'}
                  />
                  <label htmlFor={`maleSingle_${league.id}`}>
                    {league.name}
                  </label>
                </li>
              ))}
            </ul>
          </div>
          <div className="checkbox-container">
            <h4>Female Singles</h4>
            <ul>
              {femaleSingles.map((league) => (
                <li key={league.id}>
                  <input
                    type="checkbox"
                    id={`femaleSingle_${league.id}`}
                    checked={selectedCheckboxes.femaleSingle === league.id}
                    onChange={() => handleCheckboxChange('femaleSingle', league.id)}
                    disabled={!selectedPlayer || selectedPlayer.gender === 'M'} // Disable checkbox if no player selected
                  />
                  <label htmlFor={`femaleSingle_${league.id}`}>
                    {league.name}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Doubles Column */}
        <div className="column">
          <h3>Doubles</h3>
          <div className="checkbox-container">
            <h4>Male Doubles</h4>
            <ul>
              {maleDoubles.map((league) => (
                <li key={league.id}>
                  <input
                    type="checkbox"
                    id={`maleDouble_${league.id}`}
                    checked={selectedCheckboxes.maleDouble === league.id}
                    onChange={() => handleCheckboxChange('maleDouble', league.id)}
                    disabled={!selectedPlayer || selectedPlayer.gender === 'F'} // Disable checkbox if no player selected
                  />
                  <label htmlFor={`maleDouble_${league.id}`}>
                    {league.name}
                  </label>
                  {selectedCheckboxes.maleDouble === league.id && (
                    <div className="doubles-search-container">
                      <input
                        type="text"
                        placeholder="Search doubles partner..."
                        value={doublesSelectedPlayers.maleDouble ? `${doublesSelectedPlayers.maleDouble.name} ${doublesSelectedPlayers.maleDouble.surname}` : doublesSearch.maleDouble}
                        onChange={(e) => handleDoublesSearchChange(e, 'maleDouble')}
                      />
                      {showDoublesSearchResults.maleDouble && filteredPlayers(doublesSearch.maleDouble, 'M').length > 0 && (
                        <ul className="search-results">
                          {filteredPlayers(doublesSearch.maleDouble, 'M').map((player) => (
                            <li key={player.id} onClick={() => handleDoublesPlayerClick(player, 'maleDouble')}>
                              {player.name} {player.surname}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="checkbox-container">
            <h4>Female Doubles</h4>
            <ul>
              {femaleDoubles.map((league) => (
                <li key={league.id}>
                  <input
                    type="checkbox"
                    id={`femaleDouble_${league.id}`}
                    checked={selectedCheckboxes.femaleDouble === league.id}
                    onChange={() => handleCheckboxChange('femaleDouble', league.id)}
                    disabled={!selectedPlayer || selectedPlayer.gender === 'M'} // Disable checkbox if no player selected
                  />
                  <label htmlFor={`femaleDouble_${league.id}`}>
                    {league.name}
                  </label>
                  {selectedCheckboxes.femaleDouble === league.id && (
                    <div className="doubles-search-container">
                      <input
                        type="text"
                        placeholder="Search doubles partner..."
                        value={doublesSelectedPlayers.femaleDouble ? `${doublesSelectedPlayers.femaleDouble.name} ${doublesSelectedPlayers.femaleDouble.surname}` : doublesSearch.femaleDouble}
                        onChange={(e) => handleDoublesSearchChange(e, 'femaleDouble')}
                      />
                      {showDoublesSearchResults.femaleDouble && filteredPlayers(doublesSearch.femaleDouble, 'F').length > 0 && (
                        <ul className="search-results">
                          {filteredPlayers(doublesSearch.femaleDouble, 'F').map((player) => (
                            <li key={player.id} onClick={() => handleDoublesPlayerClick(player, 'femaleDouble')}>
                              {player.name} {player.surname}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="checkbox-container">
            <h4>Mixed Doubles</h4>
            <ul>
              {mixedDoubles.map((league) => (
                <li key={league.id}>
                  <input
                    type="checkbox"
                    id={`mixedDouble_${league.id}`}
                    checked={selectedCheckboxes.mixedDouble === league.id}
                    onChange={() => handleCheckboxChange('mixedDouble', league.id)}
                    disabled={!selectedPlayer} // Disable checkbox if no player selected
                  />
                  <label htmlFor={`mixedDouble_${league.id}`}>
                    {league.name}
                  </label>
                  {selectedCheckboxes.mixedDouble === league.id && (
                    <div className="doubles-search-container">
                      <input
                        type="text"
                        placeholder="Search doubles partner..."
                        value={doublesSelectedPlayers.mixedDouble ? `${doublesSelectedPlayers.mixedDouble.name} ${doublesSelectedPlayers.mixedDouble.surname}` : doublesSearch.mixedDouble}
                        onChange={(e) => handleDoublesSearchChange(e, 'mixedDouble')}
                      />
                      {showDoublesSearchResults.mixedDouble && 
                        filteredPlayers(doublesSearch.mixedDouble, selectedPlayer.gender === 'M' ? 'F' : 'M').length > 0 && (
                        <ul className="search-results">
                          {filteredPlayers(doublesSearch.mixedDouble, selectedPlayer.gender === 'M' ? 'F' : 'M').map((player) => (
                            <li key={player.id} onClick={() => handleDoublesPlayerClick(player, 'mixedDouble')}>
                              {player.name} {player.surname}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <button className="submit-button" onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default PlayerTeamForm;
