import React, { useEffect, useState } from "react";

const UserColorSquare = ({selectedPlayer, otherPlayers, mainColor, colorDict}) => {  
  


  const squareStyle = {
    width: "50px",
    height: "50px",
    backgroundColor: selectedPlayer != null ? mainColor : "transparent", // Set to blue if selectedPlayer is not null
    display: "inline-block",
    marginRight: "10px",
    verticalAlign: "middle",
  };

  return (
    <div>
      <div>
        <div style={squareStyle}></div>
        {selectedPlayer != null && (
          <span>
            {selectedPlayer.name} {selectedPlayer.surname}
          </span>
        )}
      </div>
      {otherPlayers.map((player, index) => (
        <div
          key={index}
          style={{ display: "flex", alignItems: "center", margin: "5px 0" }}
        >
          <div
            style={{
              width: "50px",
              height: "50px",
              backgroundColor: colorDict[player.user] || "grey",
              marginRight: "10px",
            }}
          ></div>
          <span>
            {player.name} {player.surname}
          </span>
        </div>
      ))}
      
    </div>
  );
};
export default UserColorSquare;
