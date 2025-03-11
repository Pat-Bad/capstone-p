import { Container, Nav, Navbar } from "react-bootstrap";
import { NavLink } from "react-router-dom";

const MyNavbar = () => {
  return (
    <Navbar
      collapseOnSelect
      expand="lg"
      className="bg-body-tertiary border-1 border-bottom border-dark fixed-top"
    >
      <Container fluid>
        <Navbar.Brand href="#home">Capstone</Navbar.Brand>
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
              to="/audiorecorder"
            >
              Diary
            </Nav.Link>
            <Nav.Link
              as={NavLink}
              to="/"
            >
              Login
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MyNavbar;
