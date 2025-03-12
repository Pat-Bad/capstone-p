//qui farò la get dei vocal memo, che presento come le playlist

import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";

const DiaryGetter = () => {
  const [diary, setDiary] = useState([]);
  const token = localStorage.getItem("token");

  const getDiary = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/vocalmemo", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setDiary(data);
      } else {
        console.error("Errore nel caricamento dei vocal memo:", data);
      }
    } catch (error) {
      console.error("Errore nel caricamento dei vocal memo:", error);
    }
  };

  useEffect(() => {
    getDiary();
  }, []);

  return (
    <Container fluid>
      <Row>
        <Col className="d-flex flex-wrap justify-content-around">
          {diary.map((audio) => (
            <div key={audio.id}>
              <audio controls>
                <source
                  src={audio.url}
                  type="audio/mpeg"
                />
                Your browser does not support the audio element.
              </audio>
              <p>{audio.dataRegistrazione}</p>
            </div>
          ))}
        </Col>
      </Row>
    </Container>
  );
};

export default DiaryGetter;
