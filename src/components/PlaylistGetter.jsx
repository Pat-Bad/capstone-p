import React, { useEffect, useState } from "react";
import {
  Col,
  Container,
  Row,
  Button,
  Dropdown,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  BsFillPlayFill,
  BsPauseFill,
  BsFastForwardFill,
  BsRewindFill,
} from "react-icons/bs";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdModeEdit } from "react-icons/md";
import PlaylistModifierModal from "../components/PlaylistModifierModal";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState(null);
  const [videoTitles, setVideoTitles] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const token = localStorage.getItem("token");
  const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

  const getPlaylists = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://patprojects-1c802b2b.koyeb.app/api/playlist/with-audio?page=0&size=10`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include", //per evitare cors error, gli dico di includere headers e cookie da questo dominio (che è diverso da quello del backend)
        }
      );
      const data = await response.json();
      if (response.ok) {
        const playlists = data.content || [];
        setPlaylists(playlists);
        ///////////////////////////////////////////////////////////////////////////////////////////////////
        //oggetti vuoti per inizializzare lo stato quando monta il componente.
        //per ogni playlist, indice del video corrente a 0 e stato di play a false (quindi, primo video della playlist, non in riproduzione)
        //per ogni video, richiamo fetchVideoTitle per ottenere il titolo

        const indices = {};
        const initialPlayStates = {};
        const titles = {};
        for (const playlist of playlists) {
          //costrutto for...of per leggibilità del codice
          indices[playlist.id] = 0;
          initialPlayStates[playlist.id] = false;

          for (const url of playlist.youtubeUrls || []) {
            const videoId = extractVideoId(url);
            if (videoId) {
              titles[videoId] = await fetchVideoTitle(videoId);
            }
          }
        }
        setCurrentVideoIndices(indices);
        setPlayStates(initialPlayStates);
        setVideoTitles(titles);
      } else {
        console.error("Error in fetching playlists:", data);
        setError(true);
      }
    } catch (error) {
      console.error("Error in fetching playlists:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPlaylists();
  }, []);

  const handleModifyClick = (playlist) => {
    setSelectedPlaylist(playlist);
    setShowModal(true);
  };

  useEffect(() => {
    const fetchTitles = async () => {
      if (playlists.length === 0) return;

      const titles = {};
      for (const playlist of playlists) {
        for (const url of playlist.youtubeUrls || []) {
          const videoId = extractVideoId(url);
          if (videoId) {
            titles[videoId] = await fetchVideoTitle(videoId);
          }
        }
      }
      setVideoTitles(titles);
    };

    fetchTitles();
  }, [playlists]);
  const fetchVideoTitle = async (videoId) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${API_KEY}&part=snippet`
      );
      const data = await response.json();
      return data.items.length > 0
        ? data.items[0].snippet.title
        : "Title not found";
    } catch (error) {
      console.error("Error in fetching video title:", error);
      setError(true);
      setLoading(false);
    } finally {
      setLoading(false);
      setError(false);
    }
  };

  // Funzioni di navigazione per video
  const handlePrevious = (playlistId) => {
    setCurrentVideoIndices((prev) => ({
      ...prev,
      [playlistId]: Math.max(0, prev[playlistId] - 1), //non può andare sotto 0
    }));

    // Reset play state
    setPlayStates((prev) => ({
      ...prev,
      [playlistId]: false,
    }));
  };

  const handleNext = (playlistId, maxIndex) => {
    const nextIndex = Math.min(maxIndex, currentVideoIndices[playlistId] + 1); //maxindex per eveitare errore
    setCurrentVideoIndices((prev) => ({
      ...prev,
      [playlistId]: nextIndex,
    }));

    // Reset play state
    setPlayStates((prev) => ({
      ...prev,
      [playlistId]: true, //per farlo partire
    }));
  };

  // Estrae l'ID del video da un URL di YouTube
  const extractVideoId = (url) => {
    if (!url) return null;

    // Gestisce sia i formati "watch?v=" che "youtu.be/"
    const watchRegex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(watchRegex);

    return match && match[1] ? match[1] : null; //se c'è, lo ritorna
  };

  // Funzione per gestire play/pause
  const togglePlayPause = (playlistId) => {
    setPlayStates((prev) => ({
      ...prev,
      [playlistId]: !prev[playlistId],
    }));
  };

  const handleDeleteClick = (playlistId) => {
    setPlaylistToDelete(playlistId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://patprojects-1c802b2b.koyeb.app/api/playlist/${playlistToDelete}`,
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
        setError(true);
        await response.text();
      }
    } catch (error) {
      console.log("Error in deleting playlist:", error);
      setError(true);
      setLoading(false);
    } finally {
      setShowDeleteModal(false);
      setPlaylistToDelete(null);
      setLoading(false);
    }
  };

  // Funzione per passare automaticamente al prossimo video
  const handleVideoEnd = (playlistId, maxIndex) => {
    const nextIndex = Math.min(maxIndex, currentVideoIndices[playlistId] + 1);
    setCurrentVideoIndices((prev) => ({
      ...prev,
      [playlistId]: nextIndex,
    }));

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
                  <h4 className="ps-3">{playlist.nomePlaylist}</h4>
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

                <div className="d-flex">
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
                  <Dropdown className="ps-2 ">
                    <Dropdown.Toggle className="custom-btn">
                      List of songs
                    </Dropdown.Toggle>
                    <Dropdown.Menu style={{ backgroundColor: "#E280BB" }}>
                      {youtubeUrls.length > 0 ? (
                        youtubeUrls.map((url, index) => {
                          const videoId = extractVideoId(url);
                          return (
                            <Dropdown.Item
                              key={index}
                              href={`https://www.youtube.com/watch?v=${videoId}`}
                              target="_blank"
                            >
                              {videoTitles[videoId] || `Video ${index + 1}`}
                            </Dropdown.Item>
                          );
                        })
                      ) : (
                        <Dropdown.Item disabled>
                          No songs available
                        </Dropdown.Item>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
                {videoId ? (
                  <>
                    <div style={{ position: "relative" }}>
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
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        onEnded={() =>
                          handleVideoEnd(playlist.id, youtubeUrls.length - 1)
                        }
                      ></iframe>
                    </div>

                    <div className="d-flex my-2 d-flex justify-content-center mt-2">
                      <Button
                        className="me-2 custom-btn"
                        size="sm"
                        onClick={() => handlePrevious(playlist.id)}
                        disabled={currentIndex === 0}
                      >
                        <BsRewindFill />
                      </Button>

                      <Button
                        size="sm"
                        className="me-2 custom-btn"
                        onClick={() => togglePlayPause(playlist.id)}
                      >
                        {isPlaying ? <BsPauseFill /> : <BsFillPlayFill />}
                      </Button>

                      <Button
                        size="sm"
                        className="me-2 custom-btn"
                        onClick={() =>
                          handleNext(playlist.id, youtubeUrls.length - 1)
                        }
                        disabled={currentIndex === youtubeUrls.length - 1}
                      >
                        <BsFastForwardFill />
                      </Button>
                    </div>
                  </>
                ) : (
                  <p>No video available</p>
                )}
              </div>
              <div className="text-end pb-2">
                <EmailShareButton
                  className="px-1"
                  url={`https://patprojects-1c802b2b.koyeb.app/playlist/${playlist.id}`}
                  subject={`Check out my playlist: ${playlist.nomePlaylist}`}
                  body={`Hey! Here's a playlist I made: ${playlist.nomePlaylist}. Enjoy!`}
                >
                  <FaEnvelope
                    size={25}
                    color="white"
                  />
                </EmailShareButton>

                <WhatsappShareButton
                  className="px-1"
                  url={`https://patprojects-1c802b2b.koyeb.app/playlist/${playlist.id}`}
                  title={`Check out this playlist: ${playlist.nomePlaylist}`}
                >
                  <FaWhatsapp
                    size={25}
                    color="green"
                  />
                </WhatsappShareButton>

                <FacebookShareButton
                  className="px-1"
                  url={`https://patprojects-1c802b2b.koyeb.app/playlist/${playlist.id}`}
                  quote={`Check out this awesome playlist: ${playlist.nomePlaylist}`}
                >
                  <FaFacebook
                    size={25}
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

        <DeleteConfirmationModal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          playlistName={
            playlists.find((playlist) => playlist.id === playlistToDelete)
              ?.nomePlaylist || ""
          }
        />
        {error && (
          <Alert
            variant="danger"
            dismissible
            onClose={() => setError(false)}
            style={{
              width: "50%",
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: "9999",
            }}
          >
            Whoops. Something went wrong!
          </Alert>
        )}

        {loading && (
          <Spinner
            animation="border"
            variant="primary"
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",

              zIndex: "9999",
            }}
          />
        )}
      </Row>
    </Container>
  );
};

export default PlaylistGetter;
