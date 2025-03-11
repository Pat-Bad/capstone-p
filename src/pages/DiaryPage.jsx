import { Col, Container, Row } from "react-bootstrap";
import DiaryGetter from "../components/DiaryGetter";

const DiaryPage = () => {
  return (
    <Container>
      <Row>
        <h2>Here's your diary entries</h2>
        <Col>
          <DiaryGetter />
        </Col>
      </Row>
    </Container>
  );
};
export default DiaryPage;
