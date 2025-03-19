import { useState, useEffect } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";

const MyNavbar = () => {
  // Stato per tracciare se l'utente è loggato
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Effetto per verificare se l'utente è già loggato al caricamento della pagina
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogout = () => {
    // Rimuovi il token dal localStorage per eseguire il logout
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/"); // Reindirizza l'utente alla homepage dopo il logout
  };

  return (
    <Navbar
      collapseOnSelect
      expand="lg"
      className="border border-1 border-dark"
    >
      <Container fluid>
        <Navbar.Brand href="/">Capstone</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link
              as={NavLink}
              to="/playlist"
            >
              PlaylistCreator
            </Nav.Link>
            <Nav.Link
              as={NavLink}
              to="/diary"
            >
              Diary
            </Nav.Link>
            {/* Condizione per mostrare Login o Logout */}
            {isLoggedIn ? (
              <Nav.Link
                as={NavLink}
                to="/"
                onClick={handleLogout}
              >
                Logout
              </Nav.Link>
            ) : (
              <Nav.Link
                as={NavLink}
                to="/"
              >
                Login
              </Nav.Link>
            )}
            <Nav.Link
              as={NavLink}
              to="/profile"
            >
              Profile
            </Nav.Link>
          </Nav>

          {/* Link Backoffice, visibile solo se l'utente è loggato */}
          {isLoggedIn && (
            <Nav className="ms-auto">
              <Nav.Link
                as={NavLink}
                to="/manager"
              >
                Backoffice
              </Nav.Link>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MyNavbar;
