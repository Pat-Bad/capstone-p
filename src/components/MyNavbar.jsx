import { useState, useEffect } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

const MyNavbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  //controllo subito se è loggato
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <Navbar
      collapseOnSelect
      expand="lg"
      className="border border-1 border-dark"
    >
      <Container fluid>
        <Navbar.Brand href="/">Patricia's Capstone project</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link
              as={Link}
              to="/"
              onClick={isLoggedIn ? handleLogout : undefined}
            >
              {isLoggedIn ? "Logout" : "Login"}
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/playlist"
            >
              PlaylistCreator
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/diary"
            >
              Diary
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/profile"
            >
              Profile
            </Nav.Link>
          </Nav>

          {isLoggedIn && (
            <Nav className="ms-auto">
              <Nav.Link
                as={Link}
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
