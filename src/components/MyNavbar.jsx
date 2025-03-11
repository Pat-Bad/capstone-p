import { Container, Nav, Navbar, NavLink } from "react-bootstrap";

const MyNavbar = () => {
  <Navbar
    collapseOnSelect
    expand="lg"
    className="bg-body-tertiary"
  >
    <Container>
      <Navbar.Brand href="#home">Capstone</Navbar.Brand>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav">
        <Nav className="me-auto">
          <Nav.Link href="#features">PlaylistCreator</Nav.Link>
          <Nav.Link href="#pricing">AudioRecorder</Nav.Link>
          <NavLink to="/login">Login</NavLink>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>;
};

export default MyNavbar;
