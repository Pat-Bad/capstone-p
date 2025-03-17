import { Row } from "react-bootstrap";

const MyFooter = () => {
  const currentYear = new Date().getFullYear();
  return (
    <Row className="border-top border-dark border-1">
      <p className="text-center py-2">
        This is my Capstone Project. © {currentYear}
      </p>
    </Row>
  );
};
export default MyFooter;
