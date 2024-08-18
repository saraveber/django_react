// SubmittedTermsModal.jsx
import React from "react";
import { Modal, Button } from "react-bootstrap";
import moment from "moment";

const SubmittedTermsModal = ({ show, handleClose, events, onConfirm }) => {
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Submitted Terms</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure you want to submit the following terms?</p>
        <ul>
          {events.map((event, index) => (
            <li key={index}>
              {moment(event.start).format("YYYY-MM-DD HH:mm")} - {moment(event.end).format("YYYY-MM-DD HH:mm")}
            </li>
          ))}
        </ul>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SubmittedTermsModal;