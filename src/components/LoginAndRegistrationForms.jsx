import { useState } from "react";
import { Alert, Button, Form, Spinner } from "react-bootstrap";
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
  const [showAlert, setShowAlert] = useState(false);
  const [errorAlert, setErrorAlert] = useState(false);

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
      .then((response) => response.text()) //va bene solo text, al contrario del login da cui devo prendere il token
      .then((data) => {
        console.log(data);
        setShowAlert(true);
      })

      .catch((error) => {
        console.error("Error during registration:", error), setErrorAlert(true);
      })

      .finally(() => setLoading(false));
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
      .then((response) => response.json()) //qui mi serve l'oggetto da cui estrarre il token
      .then((data) => {
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        navigate("/playlist");
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error during login:", error), setErrorAlert(true);
      })

      .finally(() => setLoading(false));
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
                placeholder="Email"
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
              Register and try to login 😊
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
              Login 🎶
            </Button>
          </Form>
        </div>
        {errorAlert && (
          <Alert
            variant="danger"
            onClose={() => setErrorAlert(false)}
            dismissible
          >
            Whoops, something went wrong. Please try again.
          </Alert>
        )}
        {showAlert && (
          <Alert
            style={{
              backgroundColor: "rgb(38, 155, 198, 0.5)",
              border: "2px solid #4B67A1",
              width: "50%",
              margin: "0 auto",
              textAlign: "center",
            }}
            onClose={() => setShowAlert(false)}
            dismissible
          >
            Registration successful! Check your inbox 🖖
          </Alert>
        )}
        {loading && (
          <div className="d-flex justify-content-center">
            <Spinner
              animation="border"
              style={{
                borderColor: "#5FA2C5",
                borderRadius: "50%",
                width: "50px",
                height: "50px",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginAndRegistrationForms;
