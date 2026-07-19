import styles from './Toast.module.css';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}

export function Toast({ message, type = 'success', onClose }: ToastProps) {
  return (
    <div className={`${styles.toast} ${styles[type]}`} role="status" aria-live="polite">
      <span>{message}</span>
      <button className={styles.close} onClick={onClose} aria-label="Cerrar">×</button>
    </div>
  );
}
