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
  const formatDate = (dateString) => {
    const date = new Date(dateString);

    const day = date.getDate();
    const month = date.toLocaleString("en-GB", { month: "long" });
    const year = date.getFullYear();

    // Funzione per aggiungere il suffisso corretto al giorno
    const getOrdinalSuffix = (day) => {
      if (day > 3 && day < 21) return "th";
      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
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
              style={{
                border: "5px solid #9385B6",
                borderRadius: "25px",
                backgroundColor: "rgba(147, 133, 182, 0.6)",
                padding: "20px",
              }}
              key={audio.id}
              className="my-3"
            >
              <p>{formatDate(audio.dataRegistrazione)}</p>
              <audio controls>
                <source
                  src={audio.url}
                  type="audio/mpeg"
                />
                Your browser does not support the audio element.
              </audio>
              {/* Formattazione della data */}
            </div>
          ))}
        </Col>
      </Row>
    </Container>
  );
};

export default DiaryGetter;
