import React, { useState } from 'react';
import api from "../api";
import '../styles/PlayerForm.css';

const PlayerForm = () => {
  const [player, setPlayer] = useState({
    name: '',
    surname: '',
    email: '',
    phone_number: '',
    gender: '',
    birthdate: ''
  });

  const handleChange = (e) => {
    setPlayer({
      ...player,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    console.log("Submitting form...");
    createPlayer(player.name, player.surname, player.email, player.phone_number, player.gender, player.birthdate);
  };

  const createPlayer = (name, surname, email, phone_number, gender, birthdate) => {

    api.post("api/players/", { name, surname, email, phone_number, gender, birthdate})
      .then((res) => {
        if (res.status === 201) console.log("Player saved!");
        else alert("Failed to make player.");
      })
      .catch((err) => alert(err));
  };

  return (
    
    <form onSubmit={handleSubmit} className="player-form">
    <h1>Dodaj igralca</h1>
      <div className="form-group">
        <label>Ime</label>
        <input type="text" name="name" value={player.name} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label>Priimek</label>
        <input type="text" name="surname" value={player.surname} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label>Email</label>
        <input type="text" name="email" pattern="[a-zA-Z0-9_\-.]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-.]+" value={player.email} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label>Telefonska številka</label>
        <input type="text" name="phone_number" value={player.phone_number} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label>Spol</label>
        <select name="gender" value={player.gender} onChange={handleChange} required>
          <option value="">Izberi</option>
          <option value="M">Moški</option>
          <option value="F">Ženska</option>
        </select>
      </div>
      <div className="form-group">
        <label>Rojstni datum</label>
        <input type="date" name="birthdate" value={player.birthdate} onChange={handleChange} required />
      </div>
      <button type="submit" className="submit-button">Add Player</button>
    </form>
  );
};

export default PlayerForm;
