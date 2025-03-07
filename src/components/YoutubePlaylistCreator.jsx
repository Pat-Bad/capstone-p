import React, { useState } from "react";
import { Button } from "react-bootstrap";

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
  const [playlistName, setPlaylistName] = useState(""); // Nome della nuova playlist

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
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Token mancante, effettua il login.");
      return;
    }

    // Crea il payload con il nome della playlist e gli URL dei video selezionati
    const requestData = {
      nomePlaylist: playlistName,
      youtubeUrls: selectedVideos.map(
        (video) => `https://www.youtube.com/watch?v=${video.id.videoId}`
      ), // Gli URL dei video
    };

    const response = await fetch("http://localhost:8080/api/playlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestData),
    });

    if (response.ok) {
      alert("Playlist creata con successo!");
    } else {
      const errorText = await response.text();
      alert(`Errore nella creazione della playlist: ${errorText}`);
    }
  };

  return (
    <div>
      {/* Sezione per creare la playlist */}
      <div>
        <h3>Create a new playlist</h3>
        <input
          type="text"
          placeholder="Enter playlist name"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
        />
      </div>

      {/* Barra di ricerca */}
      <div>
        <input
          type="text"
          placeholder="Search for music..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {/* Risultati della ricerca */}
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

      {/* Video selezionati */}
      <div>
        <h3>Selected music</h3>
        <ul>
          {selectedVideos.map((video) => (
            <li key={video.id.videoId}>{video.snippet.title}</li>
          ))}
        </ul>
      </div>

      {/* Crea la playlist e aggiungi i video */}
      <div>
        <Button onClick={handleCreatePlaylist}>
          Create Playlist and Add Videos
        </Button>
      </div>
    </div>
  );
};

export default YouTubePlaylistCreator;
