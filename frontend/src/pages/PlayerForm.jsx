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
          <h1 className="text-center mb-4">Add player</h1>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="name" className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={player.name}
                onChange={handleChange}
                placeholder="Name"
                required
              />
            </Form.Group>
            <Form.Group controlId="surname" className="mb-3">
              <Form.Label>Surname</Form.Label>
              <Form.Control
                type="text"
                name="surname"
                value={player.surname}
                onChange={handleChange}
                placeholder="Surname"
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
                placeholder="Email"
                required
              />
            </Form.Group>
            <Form.Group controlId="phone_number" className="mb-3">
              <Form.Label>Phone number</Form.Label>
              <Form.Control
                type="text"
                name="phone_number"
                value={player.phone_number}
                onChange={handleChange}
                placeholder="Phone number"
                required
              />
            </Form.Group>
            <Form.Group controlId="gender" className="mb-3">
              <Form.Label>Gender</Form.Label>
              <Form.Control
                as="select"
                name="gender"
                value={player.gender}
                onChange={handleChange}
                required
              >
                <option value="">Izberi</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="birthdate" className="mb-3">
              <Form.Label>Birthday</Form.Label>
              <Form.Control
                type="date"
                name="birthdate"
                value={player.birthdate}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Add player
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default PlayerForm;