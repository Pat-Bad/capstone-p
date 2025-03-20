import { useRef } from "react";
import { Button } from "react-bootstrap";

function AudioPlayer({ src, date }) {
  const audioRef = useRef(null);

  return (
    <div
      style={{
        border: "5px solid #9385B6",
        borderRadius: "25px",
        backgroundColor: "rgba(147, 133, 182, 0.6)",
        padding: "20px",
      }}
      className="my-3 mx-3 justify-content-evenly d-flex align-items-center flex-wrap flex-column"
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
          className="ms-2 custom-btn"
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

export default AudioPlayer;
