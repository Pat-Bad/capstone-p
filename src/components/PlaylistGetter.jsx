import React, { useEffect, useState } from "react";
import { Col, Container, Row, Button } from "react-bootstrap";
import {
  BsFillPlayFill,
  BsPauseFill,
  BsFastForwardFill,
  BsRewindFill,
} from "react-icons/bs";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdModeEdit } from "react-icons/md";
import PlaylistModifierModal from "../components/PlaylistModifierModal";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal"; // Import the new modal
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
  const [showDeleteModal, setShowDeleteModal] = useState(false); // State for delete modal
  const [playlistToDelete, setPlaylistToDelete] = useState(null); // Track which playlist to delete

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

  const handleDeleteClick = (playlistId) => {
    if (!token) {
      alert("Devi essere loggato per eliminare la playlist.");
      return;
    }
    setPlaylistToDelete(playlistId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/playlist/${playlistToDelete}`,
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
          prevPlaylists.filter((playlist) => playlist.id !== playlistToDelete)
        );
        setCurrentVideoIndices((prevIndices) => {
          const updatedIndices = { ...prevIndices };
          delete updatedIndices[playlistToDelete];
          return updatedIndices;
        });
        setPlayStates((prevPlayStates) => {
          const updatedPlayStates = { ...prevPlayStates };
          delete updatedPlayStates[playlistToDelete];
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
    } finally {
      setShowDeleteModal(false);
      setPlaylistToDelete(null);
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
    <Container className="pt-5 pt-md-4 pt-lg-5 mt-2 mt-md-3">
      <Row>
        {playlists.map((playlist) => {
          const currentIndex = currentVideoIndices[playlist.id] || 0;
          const youtubeUrls = playlist.youtubeUrls || [];
          const youtubeUrl = youtubeUrls[currentIndex];
          const videoId = extractVideoId(youtubeUrl);
          const isPlaying = playStates[playlist.id] || false;

          return (
            <Col
              className="m-1"
              key={playlist.id}
              style={{
                border: "3px solid #A1539E",
                borderRadius: "25px",
              }}
            >
              <div>
                <div className="d-flex justify-content-between align-items-center my-2 ">
                  <h5 className="ps-3">{playlist.nomePlaylist}</h5>
                  <div className="d-flex">
                    <Button
                      style={{
                        color: "black",
                        backgroundColor: "transparent",
                        border: "none",
                        padding: "5px",
                      }}
                      onClick={() => handleDeleteClick(playlist.id)}
                      disabled={!token}
                    >
                      <RiDeleteBin6Line />
                    </Button>
                    <Button
                      style={{
                        color: "black",
                        backgroundColor: "transparent",
                        border: "none",
                        padding: "5px",
                      }}
                      onClick={() => handleModifyClick(playlist)}
                    >
                      <MdModeEdit />
                    </Button>
                  </div>
                </div>

                {/* Audio del VocalMemo */}
                <div>
                  <audio
                    id={`audio-${playlist.id}`}
                    controls
                  >
                    <source
                      src={playlist.url}
                      type="audio/mpeg"
                    />
                    Your browser does not support the audio element.
                  </audio>
                </div>
                {videoId ? (
                  <>
                    <div>
                      <iframe
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "1%",
                          height: "1%",
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
                      <div className="d-flex my-2 d-flex justify-content-center">
                        <Button
                          variant="outline-dark"
                          className="me-2"
                          size="sm"
                          onClick={() => handlePrevious(playlist.id)}
                          disabled={currentIndex === 0}
                        >
                          <BsRewindFill />
                        </Button>

                        <Button
                          variant="outline-dark"
                          size="sm"
                          className="me-2"
                          onClick={() => togglePlayPause(playlist.id)}
                        >
                          {isPlaying ? <BsPauseFill /> : <BsFillPlayFill />}
                        </Button>

                        <Button
                          variant="outline-dark"
                          size="sm"
                          className="me-2"
                          onClick={() =>
                            handleNext(playlist.id, youtubeUrls.length - 1)
                          }
                          disabled={currentIndex === youtubeUrls.length - 1}
                        >
                          <BsFastForwardFill />
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <p>No video available</p>
                )}
              </div>
              <div className="text-end">
                <EmailShareButton
                  className="px-1"
                  url={`http://localhost:8080/playlist/${playlist.id}`}
                  subject={`Check out my playlist: ${playlist.nomePlaylist}`}
                  body={`Hey! Here's a playlist I made: ${playlist.nomePlaylist}. Enjoy!`}
                >
                  <FaEnvelope
                    size={20}
                    color="white"
                  />
                </EmailShareButton>

                <WhatsappShareButton
                  className="px-1"
                  url={`http://localhost:8080/playlist/${playlist.id}`}
                  title={`Check out this playlist: ${playlist.nomePlaylist}`}
                >
                  <FaWhatsapp
                    size={20}
                    color="green"
                  />
                </WhatsappShareButton>

                <FacebookShareButton
                  className="px-1"
                  url={`http://localhost:8080/playlist/${playlist.id}`}
                  quote={`Check out this awesome playlist: ${playlist.nomePlaylist}`}
                >
                  <FaFacebook
                    size={20}
                    color="blue"
                  />
                </FacebookShareButton>
              </div>
            </Col>
          );
        })}

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

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          playlistName={
            playlists.find((playlist) => playlist.id === playlistToDelete)
              ?.nomePlaylist || ""
          }
        />
      </Row>
    </Container>
  );
};

export default PlaylistGetter;
