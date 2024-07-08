import React from 'react';

// Assuming colorDict is defined outside the component for global access
const colorDict = {1: "#A459D1", 2: "#F266AB", 3: "#FFB84C","currid" : "#0d6efd"};

const UserColorSquare = ({ username, colorId }) => {
  const squareStyle = {
    width: '50px',
    height: '50px',
    backgroundColor: colorDict[colorId],
    display: 'inline-block',
    marginRight: '10px',
    verticalAlign: 'middle'
  };

  return (
    <div>
      <div style={squareStyle}></div>
      <span>{username}</span>
    </div>
  );
};

export default UserColorSquare;