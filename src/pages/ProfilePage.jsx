import { Col, Container, Row } from "react-bootstrap";
import PlaylistGetter from "../components/PlaylistGetter";

const ProfilePage = () => {
  return (
    <Container>
      <Row>
        <h2>ProfilePage</h2>
        <Col>
          <h3>Ecco le tue playlist</h3>

          <PlaylistGetter />
        </Col>
      </Row>
    </Container>
  );
};
export default ProfilePage;
