import { Col, Container, Row } from "react-bootstrap";
import DiaryGetter from "../components/DiaryGetter";
import DiaryEntry from "../components/DiaryEntry";

const DiaryPage = () => {
  return (
    <Container>
      <Row>
        <h2>Here's your diary entries</h2>
        <Col>
          <DiaryEntry />
          <DiaryGetter />
        </Col>
      </Row>
    </Container>
  );
};
export default DiaryPage;
