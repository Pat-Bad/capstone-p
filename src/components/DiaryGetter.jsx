import { useEffect, useState } from "react";
import { Col, Container, Row, Spinner, Alert } from "react-bootstrap";
import AudioPlayer from "./AudioPlayer";

const DiaryGetter = () => {
  const [diary, setDiary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  const getDiary = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://patprojects-1c802b2b.koyeb.app/api/vocalmemo/diary-entries",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Error retrieving diary entries");
      }
      const data = await response.json();

      const sortedData = [...data].sort(
        (a, b) => new Date(b.dataRegistrazione) - new Date(a.dataRegistrazione)
      );
      const reversedData = sortedData.reverse();

      setDiary(reversedData);
    } catch (error) {
      console.log(error);
      setError(true);
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

  return (
    <Container fluid>
      <Row className="justify-content-center">
        {diary.map((audio) => (
          <Col
            key={audio.id}
            md={6}
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
            {loading && (
              <Spinner
                animation="border"
                variant="primary"
              />
            )}
            {error && (
              <Alert
                variant="danger"
                onClose={() => setError(false)}
                dismissible
              >
                Whoops, something went wrong. Please try again.
              </Alert>
            )}
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default DiaryGetter;
