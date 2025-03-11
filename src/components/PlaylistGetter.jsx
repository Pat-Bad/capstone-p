//questo componente andrà nella pagina profilo insieme al componente AudioGetter. Devo fare due get che mi restituiscano le playlist e gli audio dell'utente autenticato

import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";

const PlaylistGetter = () => {
  const [playlists, setPlaylists] = useState([]);
  const token = localStorage.getItem("token");
  const getPlaylists = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/playlist", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setPlaylists(data);
      } else {
        console.error("Errore nel caricamento delle playlist:", data);
      }
    } catch (error) {
      console.error("Errore nel caricamento delle playlist:", error);
    }
  };

  useEffect(() => {
    getPlaylists();
  }, []);

  return (
    <Container fluid>
      <Row>
        <Col className="d-flex flex-wrap justify-content-around">
          {playlists.map((playlist) => (
            <div
              className="m-3 border border-dark rounded-3 p-3"
              key={playlist.id}
            >
              <h5> {playlist.nomePlaylist}</h5>
            </div>
          ))}
        </Col>
      </Row>
    </Container>
  );
};

export default PlaylistGetter;
