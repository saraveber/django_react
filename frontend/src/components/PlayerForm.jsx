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

    api.post("api/players/", {name,surname,email,phone_number,gender,birthdate,leagues })
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
        <input type="text" name="name" value={player.name} onChange={handleChange}  />
      </div>
      <div>
        <label>Surname</label>
        <input type="text" name="surname" value={player.surname} onChange={handleChange}  />
      </div>
      <div>
        <label>Email</label>
        <input type="email" name="email" value={player.email} onChange={handleChange}  />
      </div>
      <div>
        <label>Phone Number</label>
        <input type="text" name="phone_number" value={player.phone_number} onChange={handleChange}  />
      </div>
      <div>
        <label>Gender</label>
        <select name="gender" value={player.gender} onChange={handleChange} >
          <option value="">Select</option>
          <option value="M">Male</option>
          <option value="F">Female</option>
          <option value="O">Other</option>
        </select>
      </div>
      <div>
        <label>Birthdate</label>
        <input type="date" name="birthdate" value={player.birthdate} onChange={handleChange}  />
      </div>
      <div>
        <label>Leagues</label>
        <input type="text" name="leagues" value={player.leagues} onChange={handleChange}  />
      </div>
      <button type="submit">Add Player</button>
    </form>
  );
};

export default PlayerForm;
