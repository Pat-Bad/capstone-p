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
  const [playlistName, setPlaylistName] = useState(""); // Nome della playlist
  const [loadedPlaylists, setLoadedPlaylists] = useState([]); // Playlist caricate

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

  //funzione per caricare le playlist già salvate
  const loadPlaylists = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:8080/api/playlist", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json(); // Ottieni la risposta come testo prima di fare il parsing
      console.log(data); // Log della risposta

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
      alert(`Errore ${error.message}`);
    }
  };

  return (
    <div>
      <div>
        <h3 className="mb-2">Create a new playlist</h3>
        <input
          type="text"
          placeholder="Enter playlist name"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
        />
      </div>

      <div>
        <input
          type="text"
          placeholder="Search for music..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>
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
      <div>
        <h3>Selected music</h3>
        <ul>
          {selectedVideos.map((video) => (
            <li key={video.id.videoId}>{video.snippet.title}</li>
          ))}
        </ul>
      </div>

      <div>
        <Button onClick={handleCreatePlaylist}>Create Playlist</Button>
      </div>
      <Button onClick={loadPlaylists}>Load Playlists</Button>
      {loadedPlaylists.map((playlist) => (
        <div key={playlist.id}>
          <h3>{playlist.nomePlaylist}</h3>
        </div>
      ))}
    </div>
  );
};

export default YouTubePlaylistCreator;
