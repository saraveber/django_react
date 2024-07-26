import React, { useState, useEffect } from "react";
import DropdownSearch from "./Dropdownsearch";
import api from "../api"; // Import the API instance
import "../styles/Matches.css"; // Import CSS for styling

const Matches = () => {
  const [selectedMatch, setSelectedMatch] = useState("");
  const [courtNumber, setCourtNumber] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [startHour, setStartHour] = useState("");
  const [endHour, setEndHour] = useState("");
  const [assignedMatches, setAssignedMatches] = useState([]);
  const [gemResults, setGemResults] = useState({}); // Object to store gem results for each match

  const handleMatchChange = (matchId) => {
    setSelectedMatch(matchId);
  };

  const handleCourtNumberChange = (e) => {
    setCourtNumber(e.target.value);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleStartHourChange = (e) => {
    setStartHour(e.target.value);
  };

  const handleEndHourChange = (e) => {
    setEndHour(e.target.value);
  };

  const handleGemResultChange = (matchId, index, field, value) => {
    const updatedGemResults = { ...gemResults };
    updatedGemResults[matchId][index][field] = value;
    setGemResults(updatedGemResults);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMatch || !selectedDate || !startHour || !endHour) {
      alert("Please fill out all fields.");
      return;
    }

    const startDateTime = `${selectedDate}T${startHour}:00`;
    const endDateTime = `${selectedDate}T${endHour}:00`;

    const assignedMatchData = {
      match: selectedMatch,
      start_date: startDateTime,
      end_date: endDateTime,
      tennis_field: courtNumber,
      team_who_cancelled: null,
      reason_for_cancellation: null,
    };

    try {
      const response = await api.post("/api/assignedmatches/", assignedMatchData);
      alert("Match assigned successfully!");
      await api.put(`/api/matches/${selectedMatch}/`, {is_assigned: true});
      // Reset form fields
      setSelectedMatch("");
      setCourtNumber(1);
      setSelectedDate("");
      setStartHour("");
      setEndHour("");
    } catch (error) {
      console.error("Error assigning match:", error);
      alert("Failed to assign match.");
    }
    fetchAssignedMatches()
  };

  const fetchAssignedMatches = async () => {
    try {
      const response = await api.get('/api/assignedmatches/');
      setAssignedMatches(response.data);
      
      // Initialize gem results for each match fetched
      const initialGemResults = {};
      response.data.forEach(match => {
        initialGemResults[match.id] = [{ host: "", guest: "" }, { host: "", guest: "" }, { host: "", guest: "" }];
      });
      setGemResults(initialGemResults);
    } catch (error) {
      console.error("Error fetching assigned matches:", error);
    }
  };

  useEffect(() => {
    fetchAssignedMatches();
  }, []);

  const handleUpdateResults = async (assignedMatch) => {
    const matchId = assignedMatch.id
    const currentGemResults = gemResults[matchId];

    // Calculate set result based on gem results
    let hostSets = 0;
    let guestSets = 0;
    currentGemResults.forEach(result => {
        const hostGem = parseInt(result.host);
        const guestGem = parseInt(result.guest);
        if (hostGem > guestGem) {
        hostSets++;
        } else if (guestGem > hostGem) {
        guestSets++;
        }
    });
    const setResult = `${hostSets}:${guestSets}`;

    const matchResults = {
      gem_result: currentGemResults.map(result => `${result.host}:${result.guest}`).join(", "),
      set_result: setResult,
    };

    try {
      let response = await api.put(`/api/matches/${assignedMatch.match}/`, {
        gem_result: matchResults.gem_result,
        set_result: matchResults.set_result,
        is_finished: true,
      });
      alert("Match results updated successfully!");

      // Fetch current team data
        const hostTeam = assignedMatch.match_obj.team_host_obj
        const guestTeam = assignedMatch.match_obj.team_guest_obj

      // update host team results
      response = await api.put(`/api/teams/${assignedMatch.match_obj.team_host}/`, {
        number_of_played_matches: hostTeam.number_of_played_matches + 1,
        wins: hostSets > guestSets ? hostTeam.wins + 1 : hostTeam.wins,
        losses: hostSets > guestSets ? hostTeam.losses : hostTeam.losses + 1,
        points: hostSets > guestSets ? hostTeam.points + 3 : hostTeam.points + 1,
      });
      // update guest team results
      response = await api.put(`/api/teams/${assignedMatch.match_obj.team_guest}/`, {
        number_of_played_matches: guestTeam.number_of_played_matches + 1,
        wins: guestSets > hostSets ? guestTeam.wins + 1 : guestTeam.wins,
        losses: guestSets > hostSets ? guestTeam.losses : guestTeam.losses + 1,
        points: guestSets > hostSets ? guestTeam.points + 3 : guestTeam.points + 1,
      });

      fetchAssignedMatches(); // Refresh the assigned matches list
      // Reset gem results after submission
      const updatedGemResults = { ...gemResults };
      delete updatedGemResults[matchId];
      setGemResults(updatedGemResults);
    } catch (error) {
      console.error("Error updating match results:", error);
      alert("Failed to update match results.");
    }
  };

  const getTeamNames = (assignedMatch) => {
    const hostPlayer1 = assignedMatch.match_obj.team_host_obj.player1_obj.name;
    const guestPlayer1 = assignedMatch.match_obj.team_guest_obj.player1_obj.name;
    return `Match: ${hostPlayer1} vs ${guestPlayer1}`;
  };

  return (
    <div className="container">
      <h3 className="my-4">Assign Match</h3>
      <DropdownSearch onMatchChange={handleMatchChange} />

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="courtNumber" className="form-label">Court Number (1-10):</label>
          <input
            type="number"
            id="courtNumber"
            min="1"
            max="10"
            value={courtNumber}
            onChange={handleCourtNumberChange}
            className="form-control"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="matchDate" className="form-label">Match Date:</label>
          <input
            type="date"
            id="matchDate"
            value={selectedDate}
            onChange={handleDateChange}
            className="form-control"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="startHour" className="form-label">Start Hour:</label>
          <input
            type="time"
            id="startHour"
            value={startHour}
            onChange={handleStartHourChange}
            className="form-control"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="endHour" className="form-label">End Hour:</label>
          <input
            type="time"
            id="endHour"
            value={endHour}
            onChange={handleEndHourChange}
            className="form-control"
          />
        </div>

        <button type="submit" className="btn btn-primary">Assign Match</button>
      </form>

      <div className="mt-4">
        <h3>Update Match Results</h3>
        {assignedMatches.map((assignedMatch) => (
          <div key={assignedMatch.id} className="mb-3">
            <h4>{getTeamNames(assignedMatch)}</h4>
            <div className="gem-results-container">
              {gemResults[assignedMatch.id]?.map((result, index) => (
                <div key={index} className="gem-result-inputs">
                  <span>{index + 1}. gem</span>
                  <input
                    type="number"
                    value={result.host}
                    onChange={(e) => handleGemResultChange(assignedMatch.id, index, "host", e.target.value)}
                    className="form-control gem-input"
                    min="1"
                    max="10"
                  />
                  <span>:</span>
                  <input
                    type="number"
                    value={result.guest}
                    onChange={(e) => handleGemResultChange(assignedMatch.id, index, "guest", e.target.value)}
                    className="form-control gem-input"
                    min="1"
                    max="10"
                  />
                </div>
              ))}
            </div>
            {/* {console.log(assignedMatch)} */}
            {/* posli v handleUpdateResults assigned match in pol mas notr v match_obj host pa guest id in tistmu teamu s tem idjem povecas wins, loses pa points */}
            <button
              onClick={() => handleUpdateResults(assignedMatch)}
              className="btn btn-success mt-2"
              disabled={gemResults[assignedMatch.id]?.filter(result => result.host && result.guest).length < 2} // Disable button if less than 2 gem results are filled
            >
              Confirm Results
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Matches;
