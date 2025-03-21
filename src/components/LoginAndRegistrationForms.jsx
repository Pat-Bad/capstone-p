import { useState } from "react";
import { Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";
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

    fetch("https://patprojects-1c802b2b.koyeb.app/api/auth/register", {
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
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    fetch("https://patprojects-1c802b2b.koyeb.app/api/auth/login", {
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
    <div className="container">
      <div className="row g-3 justify-content-center">
        <div className="col-md-5 p-4 ">
          <h2 className="mb-3">Register</h2>
          <Form onSubmit={handleRegisterSubmit}>
            <span className="d-flex">
              <Form.Group className="mb-3 w-50">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter username"
                  name="username"
                  value={registerData.username}
                  onChange={handleRegisterChange}
                />
              </Form.Group>
              <Form.Group className="mb-3 w-50 ps-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Password"
                  name="password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                />
              </Form.Group>
            </span>
            <Form.Group className="mb-3 ">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                name="email"
                value={registerData.email}
                onChange={handleRegisterChange}
              />
            </Form.Group>
            <Button
              type="submit"
              disabled={loading}
              className="mt-4 fs-5"
              style={{
                backgroundColor: "#269BC6",
                border: "2px solid #4B67A1",
              }}
            >
              {loading ? (
                <Spinner
                  animation="border"
                  size="sm"
                  style={{ marginRight: "10px" }}
                />
              ) : null}
              {loading ? "Processing..." : "Register and try to login 😊"}
            </Button>
          </Form>
        </div>

        <div className="col-md-5 p-4">
          <h2 className="mb-3">Login</h2>
          <Form onSubmit={handleLoginSubmit}>
            <Form.Group className="mb-3 w-75">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                name="username"
                value={loginData.username}
                onChange={handleLoginChange}
              />
            </Form.Group>
            <Form.Group className="mb-3 w-75">
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
              type="submit"
              disabled={loading}
              className="mt-4 fs-5"
              style={{
                backgroundColor: "#269BC6",
                border: "2px solid #4B67A1",
              }}
            >
              {loading ? (
                <Spinner
                  animation="border"
                  size="sm"
                  style={{ marginRight: "10px" }}
                />
              ) : null}
              {loading ? "Processing..." : "Login 🎶"}
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default LoginAndRegistrationForms;
