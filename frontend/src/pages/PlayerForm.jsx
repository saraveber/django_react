import React, { useState } from 'react';
import api from "../api";

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
    e.preventDefault();
    console.log("Submitting form...");
    createPlayer(player.name, player.surname, player.email, player.phone_number, player.gender, player.birthdate);
  };

  const createPlayer = (name, surname, email, phone_number, gender, birthdate) => {
    api.post("api/players/", { name, surname, email, phone_number, gender, birthdate })
      .then((res) => {
        if (res.status === 201) console.log("Player saved!");
        else alert("Failed to make player.");
      })
      .catch((err) => alert(err));
  };

  return (
    <form onSubmit={handleSubmit} className="player-form">
      <h1>Dodaj igralca</h1>
      <div className="mb-3">
        <label htmlFor="name" className="form-label">Ime</label>
        <input
          type="text"
          id="name"
          name="name"
          value={player.name}
          onChange={handleChange}
          className="form-control"
          required
        />
      </div>
      <div className="mb-3">
        <label htmlFor="surname" className="form-label">Priimek</label>
        <input
          type="text"
          id="surname"
          name="surname"
          value={player.surname}
          onChange={handleChange}
          className="form-control"
          required
        />
      </div>
      <div className="mb-3">
        <label htmlFor="email" className="form-label">Email</label>
        <input
          type="text"
          id="email"
          name="email"
          pattern="[a-zA-Z0-9_\-.]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-.]+"
          value={player.email}
          onChange={handleChange}
          className="form-control"
          required
        />
      </div>
      <div className="mb-3">
        <label htmlFor="phone_number" className="form-label">Telefonska številka</label>
        <input
          type="text"
          id="phone_number"
          name="phone_number"
          value={player.phone_number}
          onChange={handleChange}
          className="form-control"
          required
        />
      </div>
      <div className="mb-3">
        <label htmlFor="gender" className="form-label">Spol</label>
        <select
          id="gender"
          name="gender"
          value={player.gender}
          onChange={handleChange}
          className="form-control"
          required
        >
          <option value="">Izberi</option>
          <option value="M">Moški</option>
          <option value="F">Ženska</option>
        </select>
      </div>
      <div className="mb-3">
        <label htmlFor="birthdate" className="form-label">Rojstni datum</label>
        <input
          type="date"
          id="birthdate"
          name="birthdate"
          value={player.birthdate}
          onChange={handleChange}
          className="form-control"
          required
        />
      </div>
      <button type="submit" className="btn btn-primary">Add Player</button>
    </form>
  );
};

export default PlayerForm;