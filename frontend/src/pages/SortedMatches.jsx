import React, { useState, useEffect } from "react";
import { Card, Form } from "react-bootstrap";
import { useUser } from "../context/UserContext";
import "../styles/Home.css";
import api from "../api";
import MatchAccordion from "../components/MatchAccordion";

const SortedMatches = () => {
  const { currUser, role, authorised } = useUser();
  const [leagues, setLeagues] = useState([]);
  const [sortedMatches, setSortedMatches] = useState({
    group1: [],
    group2: [],
  });

  useEffect(() => {
    console.log("Home updated:", { currUser, role, authorised });

    // Fetch sorted matches data
    const fetchSortedMatches = async () => {
      try {
        const response = await api.get("/api/matches/sorted/?league_id=1");

        console.log("Sorted matches:", response.data);
        setSortedMatches(response.data);
      } catch (error) {
        console.error("Error fetching sorted matches:", error);
      }
    };

    fetchSortedMatches();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responses = await api.get("api/leagues/");
        setLeagues(responses.data);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
    fetchData();
  }, []);

  const [selectedGroup, setSelectedGroup] = useState("termsMatch");

  const handleCardClick = (group) => {
    setSelectedGroup(group);
  };

  return (
    <div className="container mt-3">
      <div className="row mt-3">
        <div className="col">
        <Card
            onClick={() => handleCardClick('termsMatch')}
            style={{
              cursor: 'pointer',
              borderColor: selectedGroup === 'termsMatch' ? '#007bff' : '#ddd',
              borderWidth: '2px',
              borderStyle: 'solid',
            }}
            className="text-center"
          >
            <Card.Body className="d-flex align-items-center justify-content-center">
              <Card.Title>Terms Match</Card.Title>
            </Card.Body>
          </Card>
        </div>
        <div className="col">
          <Card
            onClick={() => handleCardClick('termsDontMatch')}
            style={{
              cursor: 'pointer',
              borderColor: selectedGroup === 'termsDontMatch' ? '#007bff' : '#ddd',
              borderWidth: '2px',
              borderStyle: 'solid',
            }}
            className="text-center"
          >
            <Card.Body className="d-flex align-items-center justify-content-center">
              <Card.Title>Terms Don't Match</Card.Title>
            </Card.Body>
          </Card>
        </div>
      </div>
      <div className="row mt-3">
        <div className="col">
          {selectedGroup === "termsMatch" && (
            <MatchAccordion
              matches={sortedMatches["group2"]}
              leagues={leagues}
            />
          )}
          {selectedGroup === "termsDontMatch" && (
            <MatchAccordion
              matches={sortedMatches["group1"]}
              leagues={leagues}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SortedMatches;
