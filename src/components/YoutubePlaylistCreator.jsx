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
  const [playlistId, setPlaylistId] = useState(null); // ID della playlist
  const [isRecording, setIsRecording] = useState(false); // Stato di registrazione
  const [audioUrl, setAudioUrl] = useState(null); // URL dell'audio
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
            await uploadAudioToBackend(audioBlob); // Upload the audio after stopping the recording
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

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // Funzione per cercare i video YouTube
  const handleSearch = async () => {
    if (searchQuery) {
      const result = await searchYouTube(searchQuery);
      setVideos(result);
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////

  // Funzione per aggiungere video selezionati alla playlist
  const handleAddToPlaylist = (video) => {
    setSelectedVideos((prev) => [...prev, video]);
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // Funzione per creare la playlist con audio e video
  const handleCreatePlaylistWithAudio = async () => {
    if (!audioUrl || !playlistName) {
      alert("Devi registrare un memo vocale e dare un nome alla playlist.");
      return;
    }

    await uploadAudioToBackend();
  };

  //////////////////////////////////////////// RENDERING //////////////////////////////////////////////////////

  return (
    <Container>
      <Row className="mt-3">
        <h3 className="mb-2 ps-0">Create a new playlist</h3>
        <input
          className="ps-5 w-50"
          type="text"
          placeholder="What should we call it?"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
        />
      </Row>

      <Row className="mt-5">
        <Col className="ps-0">
          <input
            className=" ps-5 w-50"
            type="text"
            placeholder="Search for music..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            className="ms-3 w-25 fs-5"
            à
            style={{ backgroundColor: "#E482BB", border: "2px solid #C465A9" }}
            onClick={handleSearch}
          >
            Search
          </Button>

          <div className="mt-5">
            {videos.map((video) => (
              <div key={`${video.id.videoId}-${video.snippet.title}`}>
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

      <Row className="mt-5 ">
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
          className="w-25"
          onClick={handleCreatePlaylistWithAudio}
          disabled={!audioUrl || !playlistName}
        >
          Save Playlist
        </Button>
      </Row>
    </Container>
  );
};

export default YouTubePlaylistCreator;
