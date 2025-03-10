import { useEffect, useState } from "react";

const AudioGetter = ({ playlistId }) => {
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAudioUrl = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token mancante, effettua il login.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/duwwcpahb/resources/search?q=playlistId:${playlistId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setAudioUrl(data.url);
          console.log(data);
        } else {
          setError("Nessun memo vocale trovato.");
        }
      } catch (error) {
        setError("Errore nel recupero dell'audio.");
      } finally {
        setLoading(false);
      }
    };

    fetchAudioUrl();
  }, [playlistId]);

  if (loading) return <p>Caricamento...</p>;
  if (error) return <p>{error}</p>;

  return audioUrl ? (
    <audio controls>
      <source
        src={audioUrl}
        type="audio/mpeg"
      />
      Il tuo browser non supporta l'elemento audio.
    </audio>
  ) : (
    <p>Nessun audio disponibile.</p>
  );
};

export default AudioGetter;
