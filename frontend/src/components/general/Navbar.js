import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav } from 'react-bootstrap';

const NavigationBar = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Navbar.Brand href="#">Urban Insight Dashboard</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link as={Link} to="/">Restaurant Map</Nav.Link>
          <Nav.Link as={Link} to="/nationality-analysis">Nationality Analysis</Nav.Link>
          <Nav.Link as={Link} to="/interactive-maps">Interactive Maps</Nav.Link>

        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavigationBar;
