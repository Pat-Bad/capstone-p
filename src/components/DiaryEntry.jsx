import { useState, useEffect, useRef } from "react";

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
  const uploadAudioToBackend = async (audioBlob, url) => {
    const formData = new FormData();
    formData.append("file", audioBlob);
    formData.append("url", url);
    setLoading(true);
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
        const url = data.secure_url; // L'URL restituito da Cloudinary

        // Ora invio il file con l'URL
        await saveDiaryEntryToBackend(audioBlob, url); // Funzione per inviare l'URL al backend
      } else {
        setError(true);
      }
    } catch (error) {
      console.log(error);
      setError(true);
    } finally {
      setLoading(false);
    }

    const saveDiaryEntryToBackend = async (audioBlob, url) => {
      const formData = new FormData();
      formData.append("file", audioBlob);
      formData.append("url", url);
      setLoading(true);

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
          console.log("Entry saved");
        } else {
          setError(true);
        }
      } catch (error) {
        console.log(error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="my-3 d-flex align-items-center justify-content-center">
        <button
          onClick={toggleRecording}
          className="custom-btn "
          style={{
            width: "200px",
            height: "50px",
            padding: "5px",
          }}
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </button>
        {audioUrl && (
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
        )}
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
};

export default DiaryEntry;
