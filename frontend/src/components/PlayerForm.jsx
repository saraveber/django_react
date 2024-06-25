import React, { useState } from 'react';
import axios from 'axios';
import api from "../api";

const PlayerForm = () => {
  const [player, setPlayer] = useState({
    name: '',
    surname: '',
    email: '',
    phone_number: '',
    gender: '',
    birthdate: '',
    leagues: ''
  });

  const handleChange = (e) => {
    setPlayer({
      ...player,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting form...");
    createPlayer(player.name, player.surname, player.email, player.phone_number, player.gender, player.birthdate, player.leagues);
   };

  const createPlayer = (name, surname, email, phone_number, gender, birthdate, leagues) => {
    
    console.log(name, surname, email, phone_number, gender, birthdate, leagues)

    var birtday = new Date(birthdate)
    api.post("api/players/", {name,surname,email,phone_number,gender,birtday,leagues})
      .then((res) => {
        if (res.status === 201) console.log("Player saved!");
        else alert("Failed to make player.");
      }
      )
      .catch((err) => alert(err));
  };


  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name</label>
        <input type="text" name="name" value={player.name} onChange={handleChange} required />
      </div>
      <div>
        <label>Surname</label>
        <input type="text" name="surname" value={player.surname} onChange={handleChange} required />
      </div>
      <div>
        <label>Email</label>
        <input type="text" name="email" pattern="[a-zA-Z0-9_\-.]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-.]+" value={player.email} onChange={handleChange} required />
      </div>
      <div>
        <label>Phone Number</label>
        <input type="text" name="phone_number" value={player.phone_number} onChange={handleChange} required />
      </div>
      <div>
        <label>Gender</label>
        <select name="gender" value={player.gender} onChange={handleChange} required >
          <option value="">Select</option>
          <option value="M">Male</option>
          <option value="F">Female</option>
          <option value="O">Other</option>
        </select>
      </div>
      <div>
        <label>Birthdate</label>
        <input type="date" name="birthdate" value={player.birthdate} onChange={handleChange} required />
      </div>
      <div>
        <label>Leagues</label>
        <input type="text" name="leagues" value={player.leagues} onChange={handleChange} required />
      </div>
      <button type="submit">Add Player</button>
    </form>
  );
};

export default PlayerForm;
