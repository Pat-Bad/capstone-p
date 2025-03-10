import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import LoginAndRegistrationForms from "./components/LoginAndRegistrationForms";
import AudioRecorder from "./components/AudioRecorder";
import YouTubePlaylistCreator from "./components/YoutubePlaylistCreator";
import AudioGetter from "./components/AudioGetter";

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
          <Route
            path="/audiogetter"
            element={<AudioGetter />}
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
