import { useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";

const LoginAndRegistrationForms = () => {
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loginData, setLoginData] = useState({ username: "", password: "" });

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
      })
      .catch((error) => console.error("Error during registration:", error));
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();

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
      })
      .catch((error) => console.error("Error during login:", error));
  };

  return (
    <Container>
      <Row className="justify-content-md-between">
        <Col className="col-5">
          <h5>Register</h5>
          <Form onSubmit={handleRegisterSubmit}>
            <div className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                name="username"
                value={registerData.username}
                onChange={handleRegisterChange}
              />
            </div>
            <div className="mb-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                name="email"
                value={registerData.email}
                onChange={handleRegisterChange}
              />
            </div>
            <div className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                name="password"
                value={registerData.password}
                onChange={handleRegisterChange}
              />
            </div>
            <Button
              variant="primary"
              type="submit"
            >
              Register
            </Button>
          </Form>
        </Col>
        <Col className="col-5">
          <h5>Login</h5>
          <Form onSubmit={handleLoginSubmit}>
            <div className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                name="username"
                value={loginData.username}
                onChange={handleLoginChange}
              />
            </div>
            <div className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
              />
            </div>
            <Button
              variant="primary"
              type="submit"
            >
              Login
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginAndRegistrationForms;
