import { Col, Container, Row } from "react-bootstrap";

const MyFooter = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-top border-dark border-1 w-100 position-fixed bottom-0">
      <Container>
        <Row>
          <Col className="text-center py-2">
            <p className="m-0">This is my Capstone Project. © {currentYear}</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};
export default MyFooter;
