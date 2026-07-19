/**
 * Footer Component - BipTime
 */

import React from 'react';
import { BrandLogo } from '../../shared/components';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.section}>
          <BrandLogo variant="badge" className={styles.footerLogo} />
          <p>Performance timing para carreras que buscan una experiencia de nivel profesional.</p>
          <div className={styles.socials}>
            <a href="https://www.instagram.com/biptimecol?igsh=MTFzdjVod2RsYTJnMQ%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          </div>
        </div>
      </div>

      <div className={styles.copyright}>
        <p>&copy; {currentYear} BipTime. Sport timing. All rights reserved.</p>
      </div>
    </footer>
  );
};
