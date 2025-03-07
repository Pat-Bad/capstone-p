import React, { useState, useEffect, useRef } from "react";

const AudioRecorder = ({ playlistId, userId }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

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
              type: "audio/mpeg", // Cambiato in MP3 per compatibilità Cloudinary
            });
            const audioUrl = URL.createObjectURL(audioBlob);
            setAudioUrl(audioUrl);
            audioChunksRef.current = [];
            await uploadToCloudinary(audioBlob);
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

  const uploadToCloudinary = async (audioBlob) => {
    const formData = new FormData();
    formData.append("file", audioBlob);
    formData.append("upload_preset", "ml_default"); // Il tuo upload preset
    formData.append("resource_type", "raw"); // Per dire a Cloudinary che è un file audio

    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/duwwcpahb/upload",
        {
          method: "POST",
          body: formData,
          mode: "cors",
        }
      );
      const data = await response.json();
      console.log("File salvato su Cloudinary:", data);
      const audioUrl = data.secure_url;
      await saveAudioUrlToDatabase(audioUrl);
    } catch (error) {
      console.error("Errore durante il caricamento su Cloudinary:", error);
    }
  };

  const saveAudioUrlToDatabase = async (audioUrl) => {
    const audioData = {
      url: audioUrl,
      playlistId: playlistId,
      userId: userId,
    };
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:8080/api/vocalmemo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(audioData),
      });

      if (response.ok) {
        console.log("Audio URL salvato nel DB!");
      } else {
        console.error("Errore", response.status);
      }
    } catch (error) {
      console.error("Errore nel salvataggio nel DB:", error);
    }
  };

  return (
    <div>
      <button onClick={() => setIsRecording(!isRecording)}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
      {audioUrl && (
        <div>
          <audio controls>
            <source
              src={audioUrl}
              type="audio/mpeg"
            />
            Il tuo browser non supporta l'elemento audio.
          </audio>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
