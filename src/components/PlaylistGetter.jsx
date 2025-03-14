import { useEffect, useState } from "react";
import { Col, Container, Row, Button } from "react-bootstrap";
import { BsFillPlayFill, BsPauseFill } from "react-icons/bs";
import PlaylistModifierModal from "../components/PlaylistModifierModal"; // Assumendo che il modal sia un componente separato
import {
  EmailShareButton,
  WhatsappShareButton,
  FacebookShareButton,
} from "react-share";
import { FaEnvelope, FaWhatsapp, FaFacebook } from "react-icons/fa";

const PlaylistGetter = () => {
  const [playlists, setPlaylists] = useState([]);
  const [currentVideoIndices, setCurrentVideoIndices] = useState({});
  const [playStates, setPlayStates] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  const token = localStorage.getItem("token");

  // Funzione per ottenere le playlist
  const getPlaylists = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/playlist/with-audio",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      const data = await response.json();
      console.log("Playlist data:", data);

      if (response.ok) {
        setPlaylists(data);

        // Inizializza gli indici correnti e gli stati di play
        const indices = {};
        const initialPlayStates = {};
        data.forEach((playlist) => {
          indices[playlist.id] = 0;
          initialPlayStates[playlist.id] = false;
        });
        setCurrentVideoIndices(indices);
        setPlayStates(initialPlayStates);
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

  const handleModifyClick = (playlist) => {
    setSelectedPlaylist(playlist);
    setShowModal(true);
  };

  // Funzioni di navigazione per video
  const handlePrevious = (playlistId) => {
    setCurrentVideoIndices((prev) => ({
      ...prev,
      [playlistId]: Math.max(0, prev[playlistId] - 1),
    }));

    // Reset play state
    setPlayStates((prev) => ({
      ...prev,
      [playlistId]: false,
    }));
  };

  const handleNext = (playlistId, maxIndex) => {
    const nextIndex = Math.min(maxIndex, currentVideoIndices[playlistId] + 1);
    setCurrentVideoIndices((prev) => ({
      ...prev,
      [playlistId]: nextIndex,
    }));

    // Reset play state per far partire il prossimo video
    setPlayStates((prev) => ({
      ...prev,
      [playlistId]: true,
    }));
  };

  // Estrai l'ID del video da un URL di YouTube
  const extractVideoId = (url) => {
    if (!url) return null;

    // Gestisce sia i formati "watch?v=" che "youtu.be/"
    const watchRegex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(watchRegex);

    return match && match[1] ? match[1] : null;
  };

  // Funzione per gestire play/pause
  const togglePlayPause = (playlistId) => {
    setPlayStates((prev) => ({
      ...prev,
      [playlistId]: !prev[playlistId],
    }));
  };

  const deletePlaylist = async (playlistId) => {
    if (!token) {
      alert("Devi essere loggato per eliminare la playlist.");
      return;
    }
    const confirmDelete = window.confirm(
      "Sei sicuro di voler eliminare questa playlist?"
    );
    if (!confirmDelete) return; // Se l'utente annulla, non fare nulla

    try {
      const response = await fetch(
        `http://localhost:8080/api/playlist/${playlistId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Rimuovi la playlist dalla lista
        setPlaylists((prevPlaylists) =>
          prevPlaylists.filter((playlist) => playlist.id !== playlistId)
        );
        setCurrentVideoIndices((prevIndices) => {
          const updatedIndices = { ...prevIndices };
          delete updatedIndices[playlistId];
          return updatedIndices;
        });
        setPlayStates((prevPlayStates) => {
          const updatedPlayStates = { ...prevPlayStates };
          delete updatedPlayStates[playlistId];
          return updatedPlayStates;
        });
      } else {
        console.error(
          "Errore nell'eliminazione della playlist:",
          await response.text()
        );
      }
    } catch (error) {
      console.error("Errore nel tentativo di eliminare la playlist:", error);
    }
  };

  // Funzione per passare automaticamente al prossimo video
  const handleVideoEnd = (playlistId, maxIndex) => {
    const nextIndex = Math.min(maxIndex, currentVideoIndices[playlistId] + 1);
    setCurrentVideoIndices((prev) => ({
      ...prev,
      [playlistId]: nextIndex,
    }));

    // Impostiamo play su true per far partire il prossimo video automaticamente
    setPlayStates((prev) => ({
      ...prev,
      [playlistId]: true,
    }));
  };

  return (
    <Container
      fluid
      className="px-4 mt-4"
    >
      <Row className="row-cols-1 row-cols-md-2 row-cols-lg-3 g-5">
        {playlists.map((playlist) => {
          const currentIndex = currentVideoIndices[playlist.id] || 0;
          const youtubeUrls = playlist.youtubeUrls || [];
          const youtubeUrl = youtubeUrls[currentIndex];
          const videoId = extractVideoId(youtubeUrl);
          const isPlaying = playStates[playlist.id] || false;

          return (
            <Col key={playlist.id}>
              <div>
                <h5 className="mt-5 mb-3 ps-5">{playlist.nomePlaylist}</h5>

                {/* Audio del VocalMemo */}
                <div style={{ marginBottom: "10px" }}>
                  <audio
                    id={`audio-${playlist.id}`}
                    controls
                    style={{ width: "260px", height: "40px" }}
                  >
                    <source
                      src={playlist.url}
                      type="audio/mpeg"
                    />
                    Your browser does not support the audio element.
                  </audio>
                  <Button
                    size="sm"
                    onClick={() => deletePlaylist(playlist.id)}
                    disabled={!token}
                  >
                    Delete
                  </Button>
                </div>
                {videoId ? (
                  <>
                    <div
                      style={{
                        position: "relative",
                        paddingBottom: "56.25%", // 16:9 aspect ratio
                        height: 0,
                        overflow: "hidden",
                        marginBottom: "10px",
                        backgroundColor: "#000",
                      }}
                    >
                      <iframe
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          border: "none",
                        }}
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=${
                          isPlaying ? 1 : 0
                        }&controls=1&modestbranding=1&rel=0`}
                        title={`YouTube video player - ${playlist.nomePlaylist}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        onEnded={() =>
                          handleVideoEnd(playlist.id, youtubeUrls.length - 1)
                        }
                      ></iframe>

                      <div
                        style={{
                          position: "absolute",
                          bottom: "10px",
                          right: "10px",
                          background: "rgba(0, 0, 0, 0.7)",
                          color: "white",
                          padding: "5px 10px",
                          borderRadius: "4px",
                          zIndex: 1000,
                          fontSize: "14px",
                        }}
                      >
                        {currentIndex + 1} / {youtubeUrls.length}
                      </div>
                    </div>

                    {youtubeUrls.length > 1 && (
                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <Button
                          variant="outline-dark"
                          size="sm"
                          onClick={() => handlePrevious(playlist.id)}
                          disabled={currentIndex === 0}
                        >
                          Precedente
                        </Button>

                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => togglePlayPause(playlist.id)}
                        >
                          {isPlaying ? <BsPauseFill /> : <BsFillPlayFill />}
                        </Button>

                        <Button
                          variant="outline-dark"
                          size="sm"
                          onClick={() =>
                            handleNext(playlist.id, youtubeUrls.length - 1)
                          }
                          disabled={currentIndex === youtubeUrls.length - 1}
                        >
                          Successivo
                        </Button>
                        <div>
                          <Button
                            size="sm"
                            onClick={() => deletePlaylist(playlist.id)}
                            disabled={!token}
                          >
                            Delete
                          </Button>
                          <Button
                            size="sm"
                            className="m-1"
                            onClick={() => handleModifyClick(playlist)}
                          >
                            Modify playlist
                          </Button>
                          <div className="d-flex">
                            <EmailShareButton
                              url={`http://localhost:8080/playlist/${playlist.id}`}
                              subject={`Check out my playlist: ${playlist.nomePlaylist}`}
                              body={`Hey! Here's a playlist I made: ${playlist.nomePlaylist}. Enjoy!`}
                            >
                              <FaEnvelope size={20} />
                            </EmailShareButton>

                            <WhatsappShareButton
                              url={`http://localhost:8080/playlist/${playlist.id}`}
                              title={`Check out this playlist: ${playlist.nomePlaylist}`}
                            >
                              <FaWhatsapp size={20} />
                            </WhatsappShareButton>

                            <FacebookShareButton
                              url={`http://localhost:8080/playlist/${playlist.id}`}
                              quote={`Check out this awesome playlist: ${playlist.nomePlaylist}`}
                            >
                              <FaFacebook size={20} />
                            </FacebookShareButton>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p>Nessun video disponibile</p>
                )}
              </div>
            </Col>
          );
        })}
      </Row>

      {selectedPlaylist && (
        <PlaylistModifierModal
          show={showModal}
          handleClose={() => setShowModal(false)}
          playlist={selectedPlaylist}
          updatePlaylist={(updatedPlaylist) => {
            setPlaylists((prevPlaylists) =>
              prevPlaylists.map((p) =>
                p.id === updatedPlaylist.id ? updatedPlaylist : p
              )
            );
          }}
        />
      )}
    </Container>
  );
};

export default PlaylistGetter;
