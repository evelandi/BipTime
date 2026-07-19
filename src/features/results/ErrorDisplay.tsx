/**
 * Error Display Component
 * Muestra errores de validación de Excel en formato amigable
 */

import type { FC } from 'react';
import type { ExcelValidationError } from '../../shared/types';
import styles from './ErrorDisplay.module.css';

interface ErrorDisplayProps {
  errors: ExcelValidationError[];
}

export const ErrorDisplay: FC<ErrorDisplayProps> = ({ errors }) => {
  if (errors.length === 0) return null;

  return (
    <div className={styles.errorContainer}>
      <h3 className={styles.title}>❌ Errores en la carga del archivo</h3>
      <div className={styles.errorList}>
        {errors.map((error, index) => (
          <div key={index} className={styles.errorItem}>
            <strong>Fila {error.row}, Columna "{error.column}":</strong>
            <p>{error.error}</p>
            {error.value !== null && error.value !== undefined && (
              <p className={styles.value}>Valor: <code>{String(error.value).substring(0, 50)}</code></p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
