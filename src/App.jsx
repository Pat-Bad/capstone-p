import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import LoginAndRegistrationForms from "./components/LoginAndRegistrationForms";
import AudioRecorder from "./components/AudioRecorder";
import YouTubePlaylistCreator from "./components/YoutubePlaylistCreator";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path="/playlist"
            element={<YouTubePlaylistCreator />}
          />
          <Route
            path="/"
            element={<LoginAndRegistrationForms />}
          />
          <Route
            path="/audiorecorder"
            element={<AudioRecorder />}
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
