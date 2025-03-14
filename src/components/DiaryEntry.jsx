import { useState, useEffect, useRef } from "react";

const DiaryEntry = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
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
            await uploadAudioToBackend(audioBlob); // Carica l'audio dopo che la registrazione è fermata
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

    try {
      const response = await fetch(
        "http://localhost:8080/api/vocalmemo/upload-diary",
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
        console.log("File salvato su Cloudinary:", url);
        // Ora inviamo il file con l'URL
        await saveDiaryEntryToBackend(audioBlob, url); // Funzione per inviare l'URL al backend
      } else {
        console.error(
          "Errore durante il caricamento su Cloudinary:",
          response.statusText
        );
      }
    } catch (error) {
      console.error("Errore durante il caricamento su Cloudinary:", error);
    }
  };

  const saveDiaryEntryToBackend = async (audioBlob, url) => {
    const formData = new FormData();
    formData.append("file", audioBlob);
    formData.append("url", url); // Aggiungi l'URL

    try {
      const response = await fetch(
        "http://localhost:8080/api/vocalmemo/upload-diary",
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        console.log("Diario salvato correttamente");
      } else {
        console.error(
          "Errore durante il salvataggio del diario:",
          response.statusText
        );
      }
    } catch (error) {
      console.error("Errore durante il salvataggio del diario:", error);
    }
  };

  return (
    <div>
      <button onClick={toggleRecording}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
      {audioUrl && (
        <div>
          <p>Audio Registrato:</p>
          <audio
            controls
            src={audioUrl}
          ></audio>
        </div>
      )}
    </div>
  );
};

export default DiaryEntry;
