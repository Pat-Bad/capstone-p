import { useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const LoginAndRegistrationForms = () => {
  const navigate = useNavigate();
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    fetch("http://localhost:8080/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registerData),
    })
      .then((response) => response.text())
      .then((data) => {
        console.log(data);
        console.log("Registration successful", data);
        setLoading(false);
      })
      .catch((error) => console.error("Error during registration:", error));
    setLoading(false);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    fetch("http://localhost:8080/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        console.log("Login successful", data);

        navigate("/playlist");
        setLoading(false);
      })
      .catch((error) => console.error("Error during login:", error));
    setLoading(false);
  };

  return (
    <Container
      fluid
      className="py-4"
    >
      <Row className="g-0">
        <Col
          xs={12}
          md={6}
          className="p-3"
        >
          <h2 className="my-4">Register</h2>
          <Form onSubmit={handleRegisterSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                name="username"
                value={registerData.username}
                onChange={handleRegisterChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                name="email"
                value={registerData.email}
                onChange={handleRegisterChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                name="password"
                value={registerData.password}
                onChange={handleRegisterChange}
              />
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              className="mt-3"
              disabled={loading}
            >
              {loading ? "Processing..." : "Register and try to login 😊"}
            </Button>
          </Form>
        </Col>
        <Col
          xs={12}
          md={6}
          className="p-3"
        >
          <h4 className="mb-3">Login</h4>
          <Form onSubmit={handleLoginSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                name="username"
                value={loginData.username}
                onChange={handleLoginChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
              />
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              className="mt-3"
              disabled={loading}
            >
              {loading ? "Processing..." : "Login 🎶"}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginAndRegistrationForms;
