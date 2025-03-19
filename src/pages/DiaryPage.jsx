import { Col, Container, Row } from "react-bootstrap";
import DiaryGetter from "../components/DiaryGetter";
import DiaryEntry from "../components/DiaryEntry";

const DiaryPage = () => {
  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-start flex-column"
    >
      <h2 className="ps-5 mb-4">
        Let's record something or listen to what happened in the past 📖
      </h2>
      <div className="d-flex flex-column align-items-center">
        <DiaryEntry />
        <DiaryGetter />
      </div>
    </Container>
  );
};
export default DiaryPage;
