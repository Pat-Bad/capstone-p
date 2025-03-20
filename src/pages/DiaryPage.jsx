import { Container } from "react-bootstrap";
import DiaryGetter from "../components/DiaryGetter";
import DiaryEntry from "../components/DiaryEntry";

const DiaryPage = () => {
  return (
    <Container
      fluid
      className="d-flex flex-column align-items-start justify-content-center"
    >
      <h2 className="mb-4 ps-5">
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
