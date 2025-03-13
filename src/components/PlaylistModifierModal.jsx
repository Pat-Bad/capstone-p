import { useState, useEffect } from "react";
import { Modal, Button, Form, ListGroup } from "react-bootstrap";

const PlaylistModifierModal = ({
  show,
  handleClose,
  playlist,
  updatePlaylist,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [videosToRemove, setVideosToRemove] = useState(new Set());
  const [newVideos, setNewVideos] = useState([]);
  const [videoTitles, setVideoTitles] = useState({});

  const token = localStorage.getItem("token");
  const apiKey = "AIzaSyBEF92yCCShFYsMInsOI-7QJpnX-XVEJO0";

  useEffect(() => {
    if (show && playlist.youtubeUrls.length > 0) {
      fetchVideoTitles();
    }
  }, [show, playlist.youtubeUrls]);

  // Recupera i titoli dei video esistenti nella playlist
  const fetchVideoTitles = async () => {
    const videoIds = playlist.youtubeUrls
      .map((url) => extractVideoId(url))
      .filter(Boolean);

    if (videoIds.length === 0) return;

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoIds.join(
          ","
        )}&key=${apiKey}`
      );
      const data = await response.json();

      if (response.ok) {
        const titlesMap = {};
        data.items.forEach((video) => {
          titlesMap[video.id] = video.snippet.title;
        });
        setVideoTitles(titlesMap);
      } else {
        console.error("Errore nel recupero dei titoli dei video", data);
      }
    } catch (error) {
      console.error("Errore nella chiamata all'API di YouTube", error);
    }
  };

  // Ricerca video su YouTube
  const searchYouTube = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&type=video&key=${apiKey}`
      );
      const data = await response.json();

      if (response.ok) {
        setSearchResults(
          data.items.map((video) => ({
            id: video.id.videoId,
            title: video.snippet.title,
            description: video.snippet.description,
            thumbnail: video.snippet.thumbnails.medium.url,
            url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
          }))
        );
      } else {
        console.error("Errore nella ricerca su YouTube", data);
      }
    } catch (error) {
      console.error("Errore nella chiamata all'API di YouTube", error);
    }
  };

  // Aggiunge video alla lista temporanea
  const addVideoToPlaylist = (video) => {
    if (!newVideos.some((v) => v.url === video.url)) {
      setNewVideos([...newVideos, video]);
    }
  };

  // Rimuove video dalla playlist
  const toggleVideoRemoval = (videoUrl) => {
    setVideosToRemove((prev) => {
      const newSet = new Set(prev);
      newSet.has(videoUrl) ? newSet.delete(videoUrl) : newSet.add(videoUrl);
      return newSet;
    });
  };

  // Salva le modifiche (aggiunta/rimozione video)
  const saveChanges = async () => {
    for (let videoUrl of videosToRemove) {
      await fetch(
        `http://localhost:8080/api/playlist/${playlist.id}/modify-video`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            playlistId: playlist.id,
            youtubeUrl: videoUrl,
            action: "remove",
          }),
        }
      );
    }

    for (let video of newVideos) {
      await fetch(
        `http://localhost:8080/api/playlist/${playlist.id}/modify-video`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            playlistId: playlist.id,
            youtubeUrl: video.url,
            action: "add",
          }),
        }
      );
    }

    updatePlaylist(); // Aggiorna le playlist
    handleClose();
    window.location.reload(); // Ricarica la pagina per vedere le modifiche
  };

  // Estrai ID video da un URL di YouTube
  const extractVideoId = (url) => {
    const match = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
    );
    return match ? match[1] : null;
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Modifica Playlist</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Ricerca video */}
        <Form.Control
          type="text"
          placeholder="Cerca su YouTube"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button
          className="mt-2"
          onClick={searchYouTube}
        >
          Cerca
        </Button>

        {/* Risultati della ricerca */}
        <ListGroup className="mt-3">
          {searchResults.map((video) => (
            <ListGroup.Item key={video.id}>
              <div className="d-flex align-items-center">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  style={{ width: "80px", height: "45px", marginRight: "10px" }}
                />
                <div>
                  <h6>{video.title}</h6>
                  <p>{video.description.slice(0, 100)}...</p>
                </div>
                <Button
                  variant="success"
                  size="sm"
                  className="ms-2"
                  onClick={() => addVideoToPlaylist(video)}
                >
                  Aggiungi
                </Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>

        {/* Video aggiunti recentemente */}
        {newVideos.length > 0 && (
          <>
            <h6 className="mt-4">Video da aggiungere</h6>
            <ListGroup>
              {newVideos.map((video, index) => (
                <ListGroup.Item key={index}>
                  <div className="d-flex align-items-center">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      style={{
                        width: "80px",
                        height: "45px",
                        marginRight: "10px",
                      }}
                    />
                    <h6>{video.title}</h6>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </>
        )}

        {/* Video esistenti nella playlist */}
        <h6 className="mt-4">Video nella playlist</h6>
        <ListGroup>
          {playlist.youtubeUrls.map((url, index) => {
            const videoId = extractVideoId(url);
            return (
              <ListGroup.Item key={index}>
                <div className="d-flex align-items-center">
                  <img
                    src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                    alt={url}
                    style={{
                      width: "80px",
                      height: "45px",
                      marginRight: "10px",
                    }}
                  />
                  <h6>{videoTitles[videoId] || "Caricamento..."}</h6>
                  <Form.Check
                    type="checkbox"
                    label="Rimuovi"
                    onChange={() => toggleVideoRemoval(url)}
                  />
                </div>
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={handleClose}
        >
          Chiudi
        </Button>
        <Button
          variant="primary"
          onClick={saveChanges}
        >
          Salva
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PlaylistModifierModal;
