/**
 * Header Component - BipTime
 * Logo y marca principal del sitio - moderno y deportivo
 */

import React from 'react';
import { BrandLogo } from '../../shared/components';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <a href="/" className={styles.logoLink} aria-label="Ir al inicio de BipTime">
            <BrandLogo />
          </a>
        </div>
        <div className={styles.contact}>
          <a href="https://wa.me/573144113194" target="_blank" rel="noopener noreferrer" className={styles.whatsappLink}>
            +57 314 411 3194
          </a>
          <a href="https://wa.me/573014268728" target="_blank" rel="noopener noreferrer" className={styles.whatsappLink}>
            +57 301 426 8728
          </a>
        </div>
      </div>
    </header>
  );
};
