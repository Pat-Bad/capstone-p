import { Container, Nav, Navbar } from "react-bootstrap";
import { NavLink } from "react-router-dom";

const MyNavbar = () => {
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
            <Nav.Link
              as={NavLink}
              to="/"
            >
              Login
            </Nav.Link>
            <Nav.Link
              as={NavLink}
              to="/profile"
            >
              Profile
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MyNavbar;
