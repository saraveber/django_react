import React, { useEffect, useState } from 'react';
import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { USER_KEY} from "../constants";
import { LinkContainer } from 'react-router-bootstrap';
import "../styles/Navigation.css"
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function Navigation() {
  const [role, setRole] = useState(null);
  const [currUser, setCurrUser] = useState({});



  useEffect(() => {
      getProfile();
  }, []);


  const getProfile = async () => {
      const user = JSON.parse(localStorage.getItem(USER_KEY));
      setCurrUser(user);
      setRole(user.group_names[0]);
  };

    return (
        <Navbar key='md' expand='md' className="bg-primary mb-3" variant="dark">
          <Container fluid>
            {role === null  ? (
              <>
                <Navbar.Toggle aria-controls={`navbar-expand-'md'`} />
                <Navbar.Collapse id={`navbar-expand-'md'`}>
                  <Nav className="justify-content-end flex-grow-1 pe-3">
                    <LinkContainer to="/login">
                      <Nav.Link>Login</Nav.Link>
                    </LinkContainer>
                    <LinkContainer to="/register">
                      <Nav.Link>Register</Nav.Link>
                    </LinkContainer>
                  </Nav>
                </Navbar.Collapse>
              </>
            ) : role === "admin" || role === "staff" ? (
              <>
                <Navbar.Brand href="/">Pozdrav {role}!</Navbar.Brand>
                <Navbar.Toggle aria-controls={`navbar-expand-'md'`} />
                <Navbar.Collapse id={`navbar-expand-'md'`}>
                  <Nav className="justify-content-end flex-grow-1 pe-3">
                    <LinkContainer to="/my-terms">
                      <Nav.Link>Edit Player Terms</Nav.Link>
                    </LinkContainer>
                    <LinkContainer to="/players">
                      <Nav.Link>Add Players</Nav.Link>
                    </LinkContainer>
                    <LinkContainer to="/player-team">
                      <Nav.Link>Add Teams</Nav.Link>
                    </LinkContainer>
                    <NavDropdown title={<i className="bi bi-gear-fill"></i>} id={`navbarDropdown-expand-'md'`} align="end">
                      <LinkContainer to="/change-password">
                        <NavDropdown.Item>Change Password</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/logout">
                        <NavDropdown.Item>LogOut</NavDropdown.Item>
                      </LinkContainer>
                      <NavDropdown.Divider />
                      <NavDropdown.Item href="#action5">Something else here</NavDropdown.Item>
                    </NavDropdown>
                  </Nav>
                </Navbar.Collapse>
              </>
            ) : role === "player" ? (
              <>
                <Navbar.Brand href="#">Pozdrav {currUser.first_name} {currUser.last_name}!</Navbar.Brand>
                <Navbar.Toggle aria-controls={`navbar-expand-'md'`} />
                <Navbar.Collapse id={`navbar-expand-'md'`}>
                  <Nav className="justify-content-end flex-grow-1 pe-3">
                    <LinkContainer to="/my-terms">
                      <Nav.Link>My Terms</Nav.Link>
                    </LinkContainer>
                    <NavDropdown title={<i className="bi bi-gear-fill"></i>} id={`navbarDropdown-expand-'md'`} align = "end">
                      <LinkContainer to="/change-password">
                        <NavDropdown.Item>Change Password</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/logout">
                        <NavDropdown.Item>LogOut</NavDropdown.Item>
                      </LinkContainer>
                      <NavDropdown.Divider />
                      <NavDropdown.Item href="#action5">Something else here</NavDropdown.Item>
                    </NavDropdown>
                  </Nav>
                </Navbar.Collapse>
              </>
            ) : null}
          </Container>
        </Navbar>
      );
      

}
export default Navigation;