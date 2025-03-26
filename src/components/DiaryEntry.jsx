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
    formData.append("file", audioBlob, "diary-entry.mp3");

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

      if (!response.ok) {
        throw new Error("Failed to upload diary entry");
      }

      const data = await response.json();
      console.log("Diary entry uploaded successfully", data);
    } catch (error) {
      console.error("Upload error:", error);
      setError("Upload failed. Please try again.");
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
        <div>
          <h4 className="ps-5">You don't have any diary entries yet! 😱</h4>
        </div>
      )}
      <button
        onClick={toggleRecording}
        className="custom-btn ms-5 "
        style={{
          width: "200px",
          height: "50px",
          padding: "5px",
        }}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>

      {loading && (
        <Spinner
          animation="border"
          variant="primary"
        />
      )}
      {error && (
        <Alert
          variant="danger"
          onClose={() => setError(false)}
          dismissible
        >
          Whoops, something went wrong. Please try again.
        </Alert>
      )}
    </div>
  );
};

export default DiaryEntry;
