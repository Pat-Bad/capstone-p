import { useState, useEffect, useRef } from "react";
import { Alert, Spinner } from "react-bootstrap";

const DiaryEntry = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Funzione per avviare o fermare la registrazione
  const toggleRecording = () => {
    setIsRecording((prevState) => !prevState);
  };

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
            setAudioUrl(audioUrl); // Imposta l'URL dell'audio registrato
            audioChunksRef.current = [];
            await uploadAudioToBackend(audioBlob); // Carica l'audio dopo che la registrazione viene fermata
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

  // Funzione per caricare il file sul backend e cloudinary
  const uploadAudioToBackend = async (audioBlob) => {
    const formData = new FormData();
    formData.append("file", audioBlob);

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "https://patprojects-1c802b2b.koyeb.app/api/vocalmemo/upload-diary",
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Diary entry saved successfully:", data);
      } else {
        throw new Error("Error in saving diary entry.");
      }
    } catch (error) {
      console.error("Error ", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-3 d-flex align-items-center justify-content-center">
      {audioUrl ? (
        <div
          style={{
            marginLeft: "20px",
            border: "5px solid #9385B6",
            borderRadius: "25px",
            backgroundColor: "rgba(147, 133, 182, 0.6)",
            padding: "50px",
          }}
        >
          <h4>Today's entry</h4>
          <audio
            controls
            src={audioUrl}
          ></audio>
        </div>
      ) : (
        <p> </p>
      )}
      <button
        onClick={toggleRecording}
        className="custom-btn ms-3 "
        style={{
          width: "200px",
          minHeight: "50px",
          padding: "5px",
        }}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>

      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setError(false)}
          style={{
            position: "fixed",
            width: "50%",
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
            zIndex: "9999",
          }}
        />
      )}
    </div>
  );
};

export default DiaryEntry;
