import { Row } from "react-bootstrap";

const MyFooter = () => {
  const currentYear = new Date().getFullYear();
  return (
    <div className="border-top border-dark border-1 position-fixed bottom-0 w-100 left-0 right-0 py-2 text-center">
      <p>This is my Capstone Project. © {currentYear}</p>
    </div>
  );
};
export default MyFooter;
