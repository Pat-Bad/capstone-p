import React, { useEffect, useRef, useState } from "react";
import { Button, Col, Container, Modal, Row, Card } from "react-bootstrap";

// Funzione per cercare i video su YouTube
const searchYouTube = async (query) => {
  const apiKey = "AIzaSyBEF92yCCShFYsMInsOI-7QJpnX-XVEJO0";
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&key=${apiKey}`
  );
  const data = await response.json();
  return data.items;
};

const YouTubePlaylistCreator = () => {
  const [searchQuery, setSearchQuery] = useState(""); // Query di ricerca
  const [videos, setVideos] = useState([]); // Lista dei video trovati
  const [selectedVideos, setSelectedVideos] = useState([]); // Video selezionati per la playlist
  const [playlistName, setPlaylistName] = useState(""); // Nome della playlist
  const [playlistId, setPlaylistId] = useState(null); // ID della playlist
  const [isRecording, setIsRecording] = useState(false); // Stato di registrazione
  const [audioUrl, setAudioUrl] = useState(null); // URL dell'audio
  const [showModal, setShowModal] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Avvio e stop della registrazione del memo vocale
  useEffect(() => {
    if (isRecording) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          mediaRecorderRef.current = new MediaRecorder(stream);
          mediaRecorderRef.current.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
          };
          mediaRecorderRef.current.onstop = async () => {
            const audioBlob = new Blob(audioChunksRef.current, {
              type: "audio/mpeg",
            });
            const audioUrl = URL.createObjectURL(audioBlob);
            setAudioUrl(audioUrl);
            audioChunksRef.current = [];
            await uploadAudioToBackend(audioBlob); //carico subito
          };
          mediaRecorderRef.current.start();
        })
        .catch((err) => {
          console.error("Errore nell'accesso al microfono:", err);
        });
    } else if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }

    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, [isRecording]);

  // Funzione per caricare l'audio su Cloudinary e salvare la playlist
  const uploadAudioToBackend = async (audioBlob) => {
    const formData = new FormData();
    formData.append("file", audioBlob);
    formData.append("playlistName", playlistName);
    formData.append(
      "youtubeUrls",
      JSON.stringify(
        selectedVideos.map(
          (video) => `https://www.youtube.com/watch?v=${video.id.videoId}`
        )
      )
    );

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "http://localhost:8080/api/playlist/with-audio", //endpoint con cloudinary e db
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const playlistData = await response.json();
        console.log(playlistData);
        setPlaylistId(playlistData.id);

        console.log("Playlist creata con successo", playlistData);
      } else {
        const errorData = await response.json();
        console.error("Errore nella creazione della playlist:", errorData);
      }
    } catch (error) {
      console.error("Errore durante la creazione della playlist:", error);
    }
  };

  // Funzione per cercare i video YouTube
  const handleSearch = async () => {
    if (searchQuery) {
      const result = await searchYouTube(searchQuery);
      setVideos(result);
    }
  };

  // Funzione per aggiungere video selezionati alla playlist
  const handleAddToPlaylist = (video) => {
    setSelectedVideos((prev) => [...prev, video]);
  };

  // Funzione per rimuovere video dalla playlist
  const handleRemoveFromPlaylist = (videoId) => {
    setSelectedVideos((prev) =>
      prev.filter((video) => video.id.videoId !== videoId)
    );
  };

  return (
    <Container className="pt-5 pt-md-4 pt-lg-5 mt-2 mt-md-3">
      <Row className="mt-3">
        <Col md={6}>
          <h3 className="mb-3">Create a new playlist</h3>
          <div className="input-group mb-4">
            <input
              className="form-control py-2"
              type="text"
              placeholder="What should we call it?"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
            />
          </div>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col
          md={6}
          className="mb-4"
        >
          <div className="input-group mb-3 mt-5">
            <input
              className="form-control py-2"
              type="text"
              placeholder="Search for music..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()} //per cercare anche con invio
            />
            <Button
              className="px-4"
              style={{
                backgroundColor: "#E482BB",
                border: "2px solid #C465A9",
              }}
              onClick={handleSearch}
            >
              Search
            </Button>
          </div>

          <div className="mt-4 search-results">
            {videos.map((video) => (
              <Card
                key={`${video.id.videoId}-${video.snippet.title}`}
                className="mb-3"
                style={{
                  backgroundColor: "rgba(196, 101, 169, 0.66)",
                  border: "2px solid #C465A9",
                }}
              >
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">{video.snippet.title}</h5>
                    <Button
                      size="sm"
                      onClick={() => handleAddToPlaylist(video)}
                      style={{
                        backgroundColor: "#E482BB",
                        border: "2px solid #C465A9",
                      }}
                    >
                      Add to playlist
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        </Col>

        <Col md={6}>
          <h3 className="mb-3 mt-5">Selected music</h3>
          <div className="selected-videos">
            {selectedVideos.length === 0 ? (
              <p className="text-dark">No videos selected yet</p>
            ) : (
              selectedVideos.map((video) => (
                <Card
                  key={video.id.videoId}
                  className="mb-3"
                  style={{
                    backgroundColor: "rgba(196, 101, 169, 0.66)",
                    border: "2px solid #C465A9",
                  }}
                >
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="video-title">{video.snippet.title}</div>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() =>
                          handleRemoveFromPlaylist(video.id.videoId)
                        }
                        style={{ backgroundColor: "#C465A9", border: "none" }}
                      >
                        Remove
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              ))
            )}
          </div>
        </Col>
      </Row>

      <Row className="mt-5 mb-4">
        <Col md={4}>
          <Button
            className="w-100 py-2"
            style={{
              backgroundColor: "#269AC2",
              color: "white",
              border: "2px solid #4E66A3",
            }}
            onClick={() => setIsRecording(!isRecording)}
          >
            {isRecording ? "Stop Recording" : "Start Recording"}
          </Button>
        </Col>
        {audioUrl && (
          <Col md={8}>
            <div className="mt-2 mt-md-0">
              <audio
                controls
                className="w-100"
              >
                <source
                  src={audioUrl}
                  type="audio/mpeg"
                />
                Your browser cannot play the audio element.
              </audio>
            </div>
          </Col>
        )}
      </Row>

      <Row className="mt-5 mb-5">
        <Col className="text-center">
          <Button
            className="px-5 py-2"
            style={{
              backgroundColor: "#269AC2",
              color: "white",
              border: "2px solid #4E66A3",
            }}
            onClick={() => setShowModal(true)}
            disabled={!audioUrl || !playlistName || selectedVideos.length === 0}
          >
            Save Playlist
          </Button>
        </Col>
      </Row>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        className="custom-modal"
      >
        <Modal.Header>
          <Modal.Title>Done!</Modal.Title>
        </Modal.Header>
        <Modal.Body>Go to your profile to see the playlist 😎</Modal.Body>
        <Modal.Footer>
          <Button
            style={{ backgroundColor: "#C465A9", border: "2px solid #3DB3CF" }}
            onClick={() => setShowModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default YouTubePlaylistCreator;
