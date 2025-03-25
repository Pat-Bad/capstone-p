import React from "react";
import { Modal, Button } from "react-bootstrap";

const DeleteConfirmationModal = ({ show, onHide, onConfirm, playlistName }) => {
  return (
    <Modal
      className="custom-modal"
      show={show}
      onHide={onHide}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Confirm Delete</Modal.Title>
      </Modal.Header>
      <Modal.Body>Are you sure you want to delete "{playlistName}"?</Modal.Body>
      <Modal.Footer>
        <Button
          style={{ backgroundColor: "#C465A9", border: "2px solid #3DB3CF" }}
          onClick={onHide}
        >
          Cancel
        </Button>
        <Button
          style={{ backgroundColor: "#C465A9", border: "2px solid #3DB3CF" }}
          onClick={onConfirm}
        >
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteConfirmationModal;
