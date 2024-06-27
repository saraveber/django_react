// React Component
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

  // State to track the selected checkboxes
  const [selectedCheckboxes, setSelectedCheckboxes] = useState({
    maleSingle: null,
    femaleSingle: null,
    maleDouble: null,
    femaleDouble: null,
    mixedDouble: null,
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

  const filteredPlayers = players.filter((player) =>
    `${player.name} ${player.surname}`.toLowerCase().includes(searchTerm.toLowerCase())
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
    if (selectedPlayer) {
      setSelectedCheckboxes((prevSelected) => ({
        ...prevSelected,
        [category]: id === prevSelected[category] ? null : id,
      }));
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
        {showSearchResults && filteredPlayers.length > 0 && (
          <ul className="search-results">
            {filteredPlayers.map((player) => (
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
                    disabled={!selectedPlayer} // Disable checkbox if no player selected
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
                    disabled={!selectedPlayer} // Disable checkbox if no player selected
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
                    disabled={!selectedPlayer} // Disable checkbox if no player selected
                  />
                  <label htmlFor={`maleDouble_${league.id}`}>
                    {league.name}
                  </label>
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
                    disabled={!selectedPlayer} // Disable checkbox if no player selected
                  />
                  <label htmlFor={`femaleDouble_${league.id}`}>
                    {league.name}
                  </label>
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
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerTeamForm;
