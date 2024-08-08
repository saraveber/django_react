import React, { useState } from 'react';
import api from "../api";
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

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

  const resetForm = () => {
    setPlayer({
      name: '',
      surname: '',
      email: '',
      phone_number: '',
      gender: '',
      birthdate: ''
    });
  };

  const createPlayer = (name, surname, email, phone_number, gender, birthdate) => {
    api.post("api/players/", { name, surname, email, phone_number, gender, birthdate })
      .then((res) => {
        if (res.status === 201) {
          alert("Player saved!");
          resetForm();
        }
        else alert("Failed to make player.");
      })
      .catch((err) => alert(err));
  };

  return (
    <Container>
      <Row className="justify-content-md-center mt-5">
        <Col md={6}>
          <h1 className="text-center mb-4">Dodaj igralca</h1>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="name" className="mb-3">
              <Form.Label>Ime</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={player.name}
                onChange={handleChange}
                placeholder="Vnesite ime"
                required
              />
            </Form.Group>
            <Form.Group controlId="surname" className="mb-3">
              <Form.Label>Priimek</Form.Label>
              <Form.Control
                type="text"
                name="surname"
                value={player.surname}
                onChange={handleChange}
                placeholder="Vnesite priimek"
                required
              />
            </Form.Group>
            <Form.Group controlId="email" className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={player.email}
                onChange={handleChange}
                placeholder="Vnesite email"
                required
              />
            </Form.Group>
            <Form.Group controlId="phone_number" className="mb-3">
              <Form.Label>Telefonska številka</Form.Label>
              <Form.Control
                type="text"
                name="phone_number"
                value={player.phone_number}
                onChange={handleChange}
                placeholder="Vnesite telefonsko številko"
                required
              />
            </Form.Group>
            <Form.Group controlId="gender" className="mb-3">
              <Form.Label>Spol</Form.Label>
              <Form.Control
                as="select"
                name="gender"
                value={player.gender}
                onChange={handleChange}
                required
              >
                <option value="">Izberi</option>
                <option value="M">Moški</option>
                <option value="F">Ženska</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="birthdate" className="mb-3">
              <Form.Label>Rojstni datum</Form.Label>
              <Form.Control
                type="date"
                name="birthdate"
                value={player.birthdate}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Dodaj igralca
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default PlayerForm;