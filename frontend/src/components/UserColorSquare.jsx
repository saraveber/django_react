import React, { useEffect, useState } from "react";

const UserColorSquare = ({ currUserId, playerList, colorDict }) => {


  useEffect(() => {
    console.log("CurrUserId playerList:", currUserId);
  },[currUserId, playerList, colorDict]);

  return (
    
      <div className="mt-3">
          {playerList.map((player, index) => {
              const opacity = player.user === currUserId ? 1 : 0.3;
              return (
                  <div key={index} style={{ display: "inline-block" }}>
                      <div
                          style={{
                              position: "relative",
                              width: "30px",
                              height: "30px",
                              display: "inline-block",
                              borderLeft: `6px solid ${colorDict[player.user]}`, 
                          }}>
                          <div
                              style={{
                                  backgroundColor: colorDict[player.user],
                                  width: "100%",
                                  height: "100%",
                                  opacity: opacity,
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                              }}
                          ></div>
                      </div>
                      <div
                          style={{
                              display: "inline-block",
                              marginLeft: "5px"
                          }}>
                          {player.name} {player.surname}
                      </div>
                  </div>
              );
          })}
      </div>
  );
};
export default UserColorSquare;
