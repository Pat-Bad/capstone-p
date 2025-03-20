import { useRef } from "react";
import { Button } from "react-bootstrap";

function AudioPlaylistPlayer({ src, date }) {
  const audioRef = useRef(null);

  return (
    <div
      style={{
        border: "5px solid #9385B6",
        borderRadius: "25px",
        backgroundColor: "rgba(147, 133, 182, 0.6)",
        padding: "20px",
      }}
      className="d-flex flex-column flex-wrap align-items-center justify-content-evenly mx-3 my-3"
    >
      <p>{date}</p>
      <span>
        <Button
          className="custom-btn"
          style={{ backgroundColor: "#C465A9", border: "2px solid #3DB3CF" }}
          onClick={() => audioRef.current.play()}
        >
          📖
        </Button>
        <Button
          className="custom-btn ms-2"
          style={{ backgroundColor: "#C465A9", border: "2px solid #3DB3CF" }}
          onClick={() => audioRef.current.pause()}
        >
          📗
        </Button>
      </span>
      <audio
        ref={audioRef}
        hidden
      >
        <source
          src={src}
          type="audio/mpeg"
        />
      </audio>
    </div>
  );
}

export default AudioPlaylistPlayer;
