import React from "react";
import { Card } from "react-bootstrap";

const AvailableTerm = ({ term, isSelected, onSelect }) => {
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    const options = { hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleTimeString([], options);
  };

  const handleClick = () => {
    onSelect(isSelected ? null : term);
  };

  return (
    <Card
      onClick={handleClick}
      style={{
        cursor: "pointer",
        borderColor: isSelected ? "#006400" : "#ddd", // Lighter green
        borderWidth: "2px",
        borderStyle: "solid",
        marginBottom: "10px",
      }}
    >
      <Card.Body>
        <p>
          <strong>Date:</strong> {formatDate(term.start_date)}
        </p>
        <p>
          <strong>Time:</strong> {formatTime(term.start_date)} - {formatTime(term.end_date)}
        </p>
      </Card.Body>
    </Card>
  );
};

export default AvailableTerm;