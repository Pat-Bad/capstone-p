import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import LoginAndRegistrationForms from "./components/LoginAndRegistrationForms";
import AudioRecorder from "./components/AudioRecorder";
import YouTubePlaylistCreator from "./components/YoutubePlaylistCreator";
import MyNavbar from "./components/MyNavbar";
import ProfilePage from "./pages/ProfilePage";
import DiaryPage from "./pages/DiaryPage";
import MyFooter from "./components/MyFooter";
import ManagerPage from "./pages/ManagerPage";
import NoPage from "./pages/NoPage";

function App() {
  return (
    <BrowserRouter>
      <header>
        <MyNavbar />
      </header>
      <main style={{ paddingTop: "160px", paddingBottom: "80px" }}>
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
          <Route
            path="/manager"
            element={<ManagerPage />}
          />
          <Route
            path="*"
            element={<NoPage />}
          />
        </Routes>
      </main>
      <MyFooter />
    </BrowserRouter>
  );
}

export default App;
