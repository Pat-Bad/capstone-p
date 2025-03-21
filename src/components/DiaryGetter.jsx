import { useEffect, useState } from "react";
import { Col, Container, Row, Spinner, Alert } from "react-bootstrap";
import AudioPlayer from "./AudioPlayer";

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
      console.log("Dati ricevuti:", data);
      const sortedData = [...data].sort(
        (a, b) => new Date(a.dataRegistrazione) - new Date(b.dataRegistrazione)
      );

      setDiary([...sortedData]);
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
      <Row className="justify-content-center">
        {diary.map((audio) => (
          <Col
            key={audio.id}
            md={3}
            className="d-flex justify-content-center"
          >
            <div
              style={{
                width: "100%",
                maxWidth: "400px", // Massima larghezza per non allargare troppo

                textAlign: "center",
              }}
            >
              <AudioPlayer
                src={audio.url}
                date={formatDate(audio.dataRegistrazione)}
              />
            </div>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default DiaryGetter;
