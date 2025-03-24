import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";

const PlaylistGetter = () => {
  const [playlists, setPlaylists] = useState([]);
  const [currentVideoIndices, setCurrentVideoIndices] = useState({});
  const [playStates, setPlayStates] = useState({});
  const [videoTitles, setVideoTitles] = useState({});

  const token = localStorage.getItem("token");
  const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

  const getPlaylists = async () => {
    try {
      const response = await fetch(
        "https://patprojects-1c802b2b.koyeb.app/api/playlist/with-audio",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          credentials: "include",
        }
      );

      const data = await response.json();
      console.log("Playlist data:", data);

      if (response.ok) {
        setPlaylists(data);

        // Initialize current video indices and play states
        const indices = {};
        const initialPlayStates = {};
        const titles = {};

        for (const playlist of data) {
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
        console.error("Errore nel caricamento delle playlist:", data);
      }
    } catch (error) {
      console.error("Errore nel caricamento delle playlist:", error);
    }
  };

  useEffect(() => {
    getPlaylists();
  }, []);

  const fetchVideoTitle = async (videoId) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${API_KEY}&part=snippet`
      );
      const data = await response.json();
      return data.items.length > 0
        ? data.items[0].snippet.title
        : "Titolo non disponibile";
    } catch (error) {
      console.error("Errore nel recupero del titolo:", error);
      return "Errore nel caricamento";
    }
  };

  const extractVideoId = (url) => {
    if (!url) return null;

    // Handling stringified arrays and standard YouTube URLs
    if (typeof url === "string" && url.startsWith("[") && url.endsWith("]")) {
      try {
        url = JSON.parse(url)[0];
      } catch (e) {
        console.error("Errore nel parsing dell'URL:", e);
      }
    }

    const watchRegex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(watchRegex);
    return match && match[1] ? match[1] : null;
  };

  return (
    <Container className="pt-5 pt-md-4 pt-lg-5 mt-2 mt-md-3">
      <Row>
        {playlists.map((playlist) => {
          const currentIndex = currentVideoIndices[playlist.id] || 0;
          const youtubeUrls = playlist.youtubeUrls || [];

          // Process URLs to handle stringified arrays
          const processedUrls = youtubeUrls.map((url) => {
            if (
              typeof url === "string" &&
              url.startsWith("[") &&
              url.endsWith("]")
            ) {
              try {
                return JSON.parse(url)[0]; // Parse the first URL from the stringified array
              } catch (e) {
                console.error("Errore nel parsing dell'URL:", e);
                return url; // Return the original URL if parsing fails
              }
            }
            return url;
          });

          const youtubeUrl = processedUrls[currentIndex];
          const videoId = extractVideoId(youtubeUrl);
          const isPlaying = playStates[playlist.id] || false;

          return (
            <Col
              key={playlist.id}
              style={{ border: "3px solid #A1539E", borderRadius: "25px" }}
            >
              {/* Playlist content rendering */}
            </Col>
          );
        })}
      </Row>
    </Container>
  );
};

export default PlaylistGetter;
