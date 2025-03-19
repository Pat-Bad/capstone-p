import { Col, Container, Row } from "react-bootstrap";
import PlaylistGetter from "../components/PlaylistGetter";

const ProfilePage = () => {
  return (
    <Container>
      <h2>Your playlists 🎧</h2>

      <PlaylistGetter />
    </Container>
  );
};
export default ProfilePage;
