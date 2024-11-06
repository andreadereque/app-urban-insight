import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const NavigationBar = () => {
  return (
    <Navbar style={{ backgroundColor: '#2A3A67' }} expand="lg">
      <div style={{ margin: '0 20px' }}>
        <Navbar.Brand style={{ color: '#FFC914', fontWeight: 'bold', fontSize: '1.5em' }} href="#">
          Urban Insight Dashboard
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
          <Nav.Link as={Link} to="/app-info" style={navLinkStyle}>
              Inicio
            </Nav.Link>
            <Nav.Link as={Link} to="/" style={navLinkStyle}>
              Análisis de Restaurantes
            </Nav.Link>
            <Nav.Link as={Link} to="/idealista" style={navLinkStyle}>
              Análisis de Espacios Comerciales
            </Nav.Link>
            <Nav.Link as={Link} to="/interactive-maps" style={navLinkStyle}>
              Perfil del Consumidor
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </div>
    </Navbar>
  );
};

// Estilo para los enlaces de navegación
const navLinkStyle = {
  color: '#F5F7FA', // Color blanco suave para los enlaces
  fontWeight: 'bold',
  marginLeft: '15px',
  transition: 'color 0.3s ease',
};

// Agregar efecto hover
const NavLinkHoverStyle = {
  '&:hover': {
    color: '#FF6F61', // Color Coral Suave al pasar el mouse
  },
};

export default NavigationBar;
