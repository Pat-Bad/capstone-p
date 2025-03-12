import { useEffect, useState, useRef } from "react";
import { Col, Container, Row, Button } from "react-bootstrap";
import { BsFillPlayFill, BsPauseFill } from "react-icons/bs"; // Import icons from react-icons

const PlaylistGetter = () => {
  const [playlists, setPlaylists] = useState([]);
  const [currentVideoIndices, setCurrentVideoIndices] = useState();
  const [vocalMemos, setVocalMemos] = useState([]);
  const [playStates, setPlayStates] = useState({}); // Track play/pause state for each video
  const iframeRefs = useRef({}); // Store refs to access iframe elements
  const token = localStorage.getItem("token");

  const getPlaylists = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/playlist", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        setPlaylists(data);
        // Initialize current indices and play states for all playlists
        const indices = {};
        const initialPlayStates = {};
        data.forEach((playlist) => {
          indices[playlist.id] = 0;
          initialPlayStates[playlist.id] = false; // All videos start paused
        });
        setCurrentVideoIndices(indices);
        setPlayStates(initialPlayStates);
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

  //get memos associated with playlists
  const getVocalMemos = async (playlistId) => {
    try {
      const response = fetch(
        `http://localhost:8080/api/vocalmemo/${playlistId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = (await response).json();
      if (response.ok) {
        const memos = {};
        data.forEach((memo) => {
          memos[memo.playlistId] = memo; // Map memos by playlistId
        });
        setVocalMemos(memos);
      } else {
        console.log("Errore nel caricamento dei vocali"), data;
      }
    } catch (error) {
      console.error("Errore nel caricamento dei vocali", error);
    }
  };
  useEffect(() => {
    // Iterate over playlists and fetch the associated vocal memo for each one
    playlists.forEach((playlist) => {
      getVocalMemos(playlist.id);
    });
  }, [playlists]); // Dependencies: update whenever playlists change

  // Play video function
  const playVideo = (playlistId) => {
    setTimeout(() => {
      const iframe = iframeRefs.current[playlistId];
      if (!iframe) return;

      // Play the video
      iframe.contentWindow.postMessage(
        '{"event":"command","func":"playVideo","args":""}',
        "*"
      );

      // Update play state
      setPlayStates((prev) => ({
        ...prev,
        [playlistId]: true,
      }));
    }, 1000); // Short delay to ensure the iframe has loaded the new video
  };

  // Navigation functions
  const handlePrevious = (playlistId) => {
    setCurrentVideoIndices((prev) => ({
      ...prev,
      [playlistId]: Math.max(0, prev[playlistId] - 1),
    }));

    // Play the video after changing (with slight delay to allow iframe to update)
    playVideo(playlistId);
  };

  const handleNext = (playlistId, maxIndex) => {
    setCurrentVideoIndices((prev) => ({
      ...prev,
      [playlistId]: Math.min(maxIndex, prev[playlistId] + 1),
    }));

    // Play the video after changing (with slight delay to allow iframe to update)
    playVideo(playlistId);
  };

  // Play/pause control function
  const togglePlayPause = (playlistId) => {
    const iframe = iframeRefs.current[playlistId];
    if (!iframe) return;

    const isPlaying = playStates[playlistId];

    if (isPlaying) {
      // Pause the video
      iframe.contentWindow.postMessage(
        '{"event":"command","func":"pauseVideo","args":""}',
        "*"
      );
    } else {
      // Play the video
      iframe.contentWindow.postMessage(
        '{"event":"command","func":"playVideo","args":""}',
        "*"
      );
    }

    // Update play state
    setPlayStates((prev) => ({
      ...prev,
      [playlistId]: !isPlaying,
    }));
  };

  // Save iframe reference
  const setIframeRef = (playlistId, element) => {
    iframeRefs.current[playlistId] = element;
  };

  return (
    <Container
      fluid
      className="px-4"
    >
      <Row className="row-cols-1 row-cols-md-2 row-cols-lg-3 g-5">
        {playlists.map((playlist) => {
          const currentIndex = currentVideoIndices[playlist.id] || 0;
          const youtubeUrls = playlist.youtubeUrls || [];
          const youtubeUrl = youtubeUrls[currentIndex];
          const embedUrl = youtubeUrl
            ? youtubeUrl.replace("watch?v=", "embed/") +
              "?modestbranding=1&controls=0&enablejsapi=1&origin=" +
              window.location.origin
            : "";
          const isPlaying = playStates[playlist.id] || false;
          const vocalMemo = vocalMemos[playlist.id];

          return (
            <Col key={playlist.id}>
              <div>
                <h5 className="mt-5">{playlist.nomePlaylist}</h5>
                {vocalMemo && vocalMemo.audioUrl ? (
                  <div style={{ marginBottom: "10px" }}>
                    <audio controls>
                      <source
                        src={vocalMemo.audioUrl}
                        type="audio/mpeg"
                      />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                ) : (
                  <p>Nessun memo vocale disponibile</p>
                )}

                {embedUrl ? (
                  <>
                    <div
                      style={{
                        position: "relative",
                        paddingTop: "25%",
                        marginBottom: "10px",
                      }}
                    >
                      <iframe
                        ref={(el) => setIframeRef(playlist.id, el)}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "0", // Fixed from 0 to 100%
                        }}
                        src={embedUrl}
                        title="YouTube video player"
                        frameBorder={0}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      ></iframe>

                      {/* Custom play/pause overlay */}
                      <div
                        style={{
                          position: "absolute",
                          bottom: "0",
                          left: "0",
                          right: "0",
                          background: "rgba(0, 0, 0, 0.98)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 12px",
                          zIndex: 100,
                        }}
                      >
                        <Button
                          variant="link"
                          className="p-0 text-white"
                          onClick={() => togglePlayPause(playlist.id)}
                          style={{ fontSize: "24px" }}
                        >
                          {isPlaying ? <BsPauseFill /> : <BsFillPlayFill />}
                        </Button>

                        <div className="text-white">
                          {currentIndex + 1} / {youtubeUrls.length}
                        </div>
                      </div>
                    </div>

                    {youtubeUrls.length > 1 && (
                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <Button
                          variant="outline-dark"
                          size="sm"
                          onClick={() => handlePrevious(playlist.id)}
                          disabled={currentIndex === 0}
                        >
                          Precedente
                        </Button>

                        <Button
                          variant="outline-dark"
                          size="sm"
                          onClick={() =>
                            handleNext(playlist.id, youtubeUrls.length - 1)
                          }
                          disabled={currentIndex === youtubeUrls.length - 1}
                        >
                          Successivo
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <p>Nessun video disponibile</p>
                )}
              </div>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
};

export default PlaylistGetter;

//oggi voglio implementare metodo put e delete qui e nel diary
