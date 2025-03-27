import { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  ListGroup,
  Spinner,
  Alert,
} from "react-bootstrap";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const token = localStorage.getItem("token");
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

  useEffect(() => {
    if (show && playlist.youtubeUrls.length > 0) {
      fetchVideoTitles();
    }
  }, [show, playlist.youtubeUrls]);

  const fetchVideoTitles = async () => {
    const videoIds = playlist.youtubeUrls
      .map((url) => extractVideoId(url))
      .filter(Boolean); //per togliere null, undefined e false dall array di risultati

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
    setLoading(true);

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
        console.error("Error in searching YouTube", data);
        setError(true);
      }
    } catch (error) {
      console.error("Error in searching YouTube", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  //controlla che non ci sia gia il video nella playlist
  //uso some() sull'array per controllare. Torna true se il video esiste, false altrimenti
  const addVideoToPlaylist = (video) => {
    const isNewVideosDuplicate = newVideos.some((v) => v.url === video.url);
    const isExistingPlaylistDuplicate = playlist.youtubeUrls.some(
      (url) => url === video.url
    );
    if (!isNewVideosDuplicate && !isExistingPlaylistDuplicate) {
      setNewVideos([...newVideos, video]);
    } else {
      console.warn("Video già presente nella playlist");
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
    setLoading(true);
    try {
      console.log("Initial playlist:", playlist);
      // Rimuovi i video selezionati
      for (let videoUrl of videosToRemove) {
        const response = await fetch(
          `https://patprojects-1c802b2b.koyeb.app/api/playlist/${playlist.id}/modify-video`,
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
        const responseData = await response.json();
        console.log("Remove video response:", responseData);

        if (!response.ok) {
          console.error("Error removing video", await response.json());
          return;
        }
      }

      // Aggiungi i nuovi video
      for (let video of newVideos) {
        const response = await fetch(
          `https://patprojects-1c802b2b.koyeb.app/api/playlist/${playlist.id}/modify-video`,
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
        const responseData = await response.json();
        console.log("Add video response:", responseData);
        if (!response.ok) {
          console.error("Error adding video", await response.json());
          return;
        }
      }
      const playlistResponse = await fetch(
        `https://patprojects-1c802b2b.koyeb.app/api/playlist/${playlist.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      updatePlaylist({
        ...playlist,
        youtubeUrls: [
          ...playlist.youtubeUrls.filter((url) => !videosToRemove.has(url)),
          ...newVideos.map((video) => video.url),
        ],
      });

      handleClose();
    } catch (error) {
      console.error("Error in saving changes", error);
      // Optionally show an error message to the user
    } finally {
      setLoading(false);
    }
  };
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
        <Modal.Title>Modify Playlist</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Control
          type="text"
          placeholder="Search on YouTube"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button
          className="mt-2"
          onClick={searchYouTube}
        >
          Search
        </Button>
        {error && (
          <Alert
            variant="danger"
            dismissible
            onClose={() => setError(false)}
            style={{
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
              transform: "translate(-50%, -50%)",
              zIndex: "9999",
            }}
          />
        )}

        <ListGroup className="mt-3">
          {searchResults &&
            searchResults.map((video) => (
              <ListGroup.Item key={video.id}>
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
                  <div>
                    <h6>{video.title}</h6>
                  </div>
                  <Button
                    variant="success"
                    size="sm"
                    className="ms-2"
                    onClick={() => addVideoToPlaylist(video)}
                  >
                    Add
                  </Button>
                </div>
              </ListGroup.Item>
            ))}
        </ListGroup>

        {/* Video da aggiungere, mostro solo se ne è selezionato almeno 1 */}

        <h6 className="mt-4">Music to add</h6>
        <ListGroup>
          {newVideos.length > 0 &&
            newVideos.map((video, index) => (
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

        {/* Video esistenti nella playlist */}
        <h6 className="mt-4">Already in your playlist 🔥</h6>
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
                  <h6>{[videoId]}</h6>
                  <Form.Check
                    type="checkbox"
                    label="remove"
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
          Close
        </Button>
        <Button
          variant="primary"
          onClick={saveChanges}
        >
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PlaylistModifierModal;
