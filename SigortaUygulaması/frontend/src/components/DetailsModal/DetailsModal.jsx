import styles from "./DetailsModal.module.css";
import { useEffect } from "react";
// eslint-disable-next-line react/prop-types
const DetailsModal = ({ className, isOpen, onClose, content }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add(styles.inert);
      return () => document.body.classList.remove(styles.inert);
    }
  }, [isOpen]);
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={`${className} ${styles.modal}`} role="document">
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <div className={styles.content}>{content}</div>
      </div>
    </div>
  );
};

export default DetailsModal;
