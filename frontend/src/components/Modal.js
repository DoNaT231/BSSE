import './Modal.css';

export default function Modal({ children }) {
  return (
    <div className="modal-background">
      <div className="modal">
        {children}
      </div>
    </div>
  );
}