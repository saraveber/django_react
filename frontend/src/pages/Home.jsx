import React, { useState, useEffect, useRef } from "react";
import { useUser } from "../context/UserContext";
import "../styles/Home.css";


function Home() {
    const { currUser, role, authorised } = useUser();

  return (
    <div>
      <p>Welcome to the home page {currUser.username}!</p>
    </div>
  );
}

export default Home;
