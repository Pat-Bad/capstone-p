import { Col, Container, Row } from "react-bootstrap";
import PlaylistGetter from "../components/PlaylistGetter";

const ProfilePage = () => {
  return (
    <Container>
      <h3>Ecco le tue playlist</h3>

      <PlaylistGetter />
    </Container>
  );
};
export default ProfilePage;
