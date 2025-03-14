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
    <Container className="mt-5 ">
      <Row className="mt-5 w-100 mb-5 align-content-center">
        <Col className="col-6">
          <h3>Register</h3>
          <Form onSubmit={handleRegisterSubmit}>
            <div className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                name="username"
                value={registerData.username}
                onChange={handleRegisterChange}
                className="w-50"
              />
            </div>
            <div className="mb-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                name="email"
                className="w-50"
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
                className="w-50"
                value={registerData.password}
                onChange={handleRegisterChange}
              />
            </div>
            <Button
              variant="primary"
              type="submit"
              className="mt-4"
            >
              Register and try to login 😊
            </Button>
          </Form>
        </Col>
        <Col className="col-6">
          <h4>Login</h4>
          <Form onSubmit={handleLoginSubmit}>
            <div className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                name="username"
                className="w-50"
                value={loginData.username}
                onChange={handleLoginChange}
              />
            </div>
            <div>
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                name="password"
                className="w-50"
                value={loginData.password}
                onChange={handleLoginChange}
              />
            </div>
            <Button
              variant="primary"
              type="submit"
              className="mt-3"
            >
              Login 🎶
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginAndRegistrationForms;
