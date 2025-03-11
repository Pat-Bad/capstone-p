import React, { useEffect, useRef, useState } from "react";
import { Button, Container, Row } from "react-bootstrap";

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

  const saveAudioUrlToDatabase = async (audioUrl) => {
    const userId = localStorage.getItem("userId");
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

  // Funzione per caricare le playlist già salvate
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

  // Funzione per creare la playlist e aggiungere i video
  const handleCreatePlaylist = async () => {
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
        console.log("Playlist creata con successo!");
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
      <Row className="m-3">
        <h3 className="mb-2">Create a new playlist</h3>
        <input
          type="text"
          placeholder="Enter playlist name"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
        />
      </Row>

      <Row className="m-3">
        <input
          type="text"
          placeholder="Search for music..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button
          className="m-2"
          onClick={handleSearch}
        >
          Search
        </Button>

        <div>
          {videos.map((video) => (
            <div key={video.id.videoId}>
              <h3>{video.snippet.title}</h3>
              <Button onClick={() => handleAddToPlaylist(video)}>
                Add to playlist
              </Button>
            </div>
          ))}
        </div>
      </Row>

      <Row className="m-3">
        <h3>Selected music</h3>
        <ul>
          {selectedVideos.map((video) => (
            <li key={video.id.videoId}>{video.snippet.title}</li>
          ))}
        </ul>
      </Row>

      <Row className="m-3">
        <Button onClick={handleCreatePlaylist}>Create Playlist</Button>
      </Row>
      <Row className="m-3">
        <Button onClick={loadPlaylists}>Load Playlists</Button>
        {loadedPlaylists.map((playlist) => (
          <div key={playlist.id}>
            <h3>{playlist.nomePlaylist}</h3>
          </div>
        ))}
        <div>
          <h3>Select a Playlist</h3>
          {loadedPlaylists.map((playlist) => (
            <div key={playlist.id}>
              <h3>{playlist.nomePlaylist}</h3>
              <Button onClick={() => handleSelectPlaylist(playlist.id)}>
                Select Playlist
              </Button>
            </div>
          ))}
        </div>
      </Row>
      <Row className="mt-5 w-50 ms-auto me-auto">
        <button onClick={() => setIsRecording(!isRecording)}>
          {isRecording ? "Stop Recording" : "Start Recording"}
        </button>
        {audioUrl && (
          <div>
            <audio controls>
              <source
                src={audioUrl}
                type="audio/mpeg"
              />
              Il tuo browser non supporta l'elemento audio.
            </audio>
          </div>
        )}

        {/* Bottone per avviare la richiesta dell'audio */}
        <Button
          className="mt-3"
          onClick={fetchAudio}
        >
          Fetch Audio
        </Button>
        <audio
          controls
          src={audioUrl}
        />
      </Row>
    </Container>
  );
};

export default YouTubePlaylistCreator;
