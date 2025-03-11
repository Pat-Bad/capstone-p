import React, { useEffect, useRef, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";

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
  const [loadedPlaylists, setLoadedPlaylists] = useState([]); // Playlist caricate
  const [isRecording, setIsRecording] = useState(false); // Stato di registrazione
  const [audioUrl, setAudioUrl] = useState(null); // URL dell'audio
  const [playlistId, setPlaylistId] = useState(null); // ID della playlist
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

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
              type: "audio/mpeg", // Cambiato in MP3 per compatibilità Cloudinary
            });
            const audioUrl = URL.createObjectURL(audioBlob);
            setAudioUrl(audioUrl);
            audioChunksRef.current = [];
            await uploadToCloudinary(audioBlob);
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
  const loadPlaylists = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:8080/api/playlist", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setLoadedPlaylists(data);
      } else {
        console.error("Errore nel caricamento delle playlist:", data);
      }
    } catch (error) {
      console.error("Errore nel caricamento delle playlist:", error);
    }
  };

  const saveAudioUrlToDatabase = async (audioUrl) => {
    const userId = localStorage.getItem("userId");
    const playlistId = await handleCreatePlaylist();
    const audioData = {
      url: audioUrl,
      playlistId: playlistId,
      userId: userId,
    };

    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:8080/api/vocalmemo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(audioData),
      });
      console.log(audioData);

      if (response.ok) {
        console.log("Memo vocale salvato nel DB.");
      } else {
        const errorText = await response.text();
        console.error("Errore nel salvataggio nel DB:", errorText);
      }
    } catch (error) {
      console.error("Errore nel salvataggio nel DB:", error);
    }
  };

  const uploadToCloudinary = async (audioBlob) => {
    const formData = new FormData();
    formData.append("file", audioBlob);
    formData.append("upload_preset", "ml_default"); // Il tuo upload preset
    formData.append("resource_type", "raw"); // Per dire a Cloudinary che è un file audio

    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/duwwcpahb/upload",
        {
          method: "POST",
          body: formData,
          mode: "cors",
        }
      );
      const data = await response.json();
      const audioUrl = data.secure_url;
      await saveAudioUrlToDatabase(audioUrl);
    } catch (error) {
      console.error("Errore durante il caricamento su Cloudinary:", error);
    }
  };

  // Funzione per cercare i video
  const handleSearch = async () => {
    if (searchQuery) {
      const result = await searchYouTube(searchQuery);
      setVideos(result);
    }
  };

  // Funzione per aggiungere il video selezionato alla lista
  const handleAddToPlaylist = (video) => {
    setSelectedVideos((prev) => [...prev, video]);
  };

  // Funzione per creare la playlist e aggiungere i video
  const handleCreatePlaylist = async () => {
    if (playlistId) {
      return playlistId;
    }
    const token = localStorage.getItem("token");

    const requestData = {
      nomePlaylist: playlistName,
      youtubeUrls: selectedVideos.map(
        (video) => `https://www.youtube.com/watch?v=${video.id.videoId}`
      ),
    };

    try {
      const response = await fetch("http://localhost:8080/api/playlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const playlistData = await response.json();
        setPlaylistId(playlistData.id);
        return playlistData.id;
      } else {
        const errorData = await response.json();
        console.error("Errore nella creazione della playlist:", errorData);
      }
    } catch (error) {
      console.error("Errore ", error);
    }
  };

  const handleSelectPlaylist = (id) => {
    setPlaylistId(id);
  };

  const fetchAudio = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:8080/api/vocalmemo/${playlistId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const vocalMemo = await response.json();

      if (response.ok) {
        console.log("Memo vocale trovato:", vocalMemo);

        // Imposta l'URL Cloudinary già memorizzato nel database
        setAudioUrl(vocalMemo.url);

        // L'elemento audio verrà aggiornato automaticamente con il nuovo URL
      }
    } catch (error) {
      console.error("Errore nel recupero del memo vocale:", error);
    }
  };

  return (
    <Container>
      <Row>
        <Button
          className="mt-3 mb-5 w-25"
          onClick={loadPlaylists}
        >
          Load Playlists
        </Button>

        {loadedPlaylists.map((playlist) => (
          <div key={playlist.id}>
            <div className="d-flex align-items-center mt-3">
              <h5 className="m-0">{playlist.nomePlaylist}</h5>
              <Button
                className="ms-4 w-25"
                key={playlist.id}
                value={playlist.nomePlaylist}
                onClick={() => handleSelectPlaylist(playlist.id)}
              >
                Select Playlist
              </Button>
            </div>
          </div>
        ))}
      </Row>
      <Row className="mt-3">
        <h3 className="mb-2">Create a new playlist</h3>
        <input
          className="w-50"
          type="text"
          placeholder="What should we call it?"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
        />
      </Row>

      <Row className="mt-5">
        <Col>
          <input
            className="w-50"
            type="text"
            placeholder="Search for music..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            className="ms-3 w-25"
            onClick={handleSearch}
          >
            Search
          </Button>

          <div className="mt-5 ">
            {videos.map((video) => (
              <div key={video.id.videoId}>
                <h5>{video.snippet.title}</h5>
                <Button
                  className="mb-3"
                  onClick={() => handleAddToPlaylist(video)}
                >
                  Add to playlist
                </Button>
              </div>
            ))}
          </div>
        </Col>

        <Col>
          <h3>Selected music</h3>
          <ul>
            {selectedVideos.map((video) => (
              <li key={video.id.videoId}>{video.snippet.title}</li>
            ))}
          </ul>
        </Col>
      </Row>
      <Row className="m-3">
        <Button onClick={handleCreatePlaylist}>Save Playlist</Button>
      </Row>

      <Row className="mt-5 ms-auto me-auto justify-content-evenly">
        <button
          className="w-25"
          onClick={() => setIsRecording(!isRecording)}
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </button>
        {audioUrl && (
          <div className="w-50 ms-3">
            <audio controls>
              <source
                src={audioUrl}
                type="audio/mpeg"
              />
              Il tuo browser non supporta l'elemento audio.
            </audio>
          </div>
        )}
      </Row>

      <Row className="mt-5">
        <Button
          className="mt-3 w-25"
          onClick={fetchAudio}
        >
          Fetch Audio
        </Button>
        <audio
          className="mt-3 w-25"
          controls
          src={audioUrl}
        />
      </Row>
    </Container>
  );
};

export default YouTubePlaylistCreator;
