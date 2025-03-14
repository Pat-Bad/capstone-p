import { useEffect, useState } from "react";
import { Col, Container, Row, Spinner, Alert } from "react-bootstrap";

const DiaryGetter = () => {
  const [diary, setDiary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  const getDiary = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/vocalmemo/diary-entries",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.message || "Errore nel caricamento dei vocal memo"
        );
      }
      const data = await response.json();
      setDiary(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDiary();
  }, []);

  if (loading) {
    return (
      <Container
        fluid
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Spinner
          animation="border"
          variant="primary"
        />
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid>
        <Row>
          <Col className="d-flex justify-content-center">
            <Alert variant="danger">{error}</Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row>
        <Col className="d-flex flex-wrap justify-content-around">
          {diary.map((audio) => (
            <div
              key={audio.id}
              className="my-3"
            >
              <audio controls>
                <source
                  src={audio.url}
                  type="audio/mpeg"
                />
                Your browser does not support the audio element.
              </audio>
              <p>{audio.dataRegistrazione}</p> {/* Formattazione della data */}
            </div>
          ))}
        </Col>
      </Row>
    </Container>
  );
};

export default DiaryGetter;
