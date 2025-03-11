import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import LoginAndRegistrationForms from "./components/LoginAndRegistrationForms";
import AudioRecorder from "./components/AudioRecorder";
import YouTubePlaylistCreator from "./components/YoutubePlaylistCreator";
import AudioGetter from "./components/AudioGetter";
import MyNavbar from "./components/MyNavbar";
import ProfilePage from "./pages/ProfilePage";
import DiaryPage from "./pages/DiaryPage";

function App() {
  return (
    <BrowserRouter>
      <div>
        <MyNavbar />
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
            path="/diary"
            element={<DiaryPage />}
          />
          <Route
            path="/profile"
            element={<ProfilePage />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
