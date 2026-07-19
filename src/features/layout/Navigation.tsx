/**
 * Navigation Component - BipTime
 * Navegación principal del sitio
 */

import React, { useState } from 'react';
import styles from './Navigation.module.css';

interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: 'Inicio', href: '/' },
  { label: 'Resultados', href: '/results' },
  // { label: 'Catálogo', href: '/catalog' },
  { label: 'Contacto', href: '/#contacto' },
];

export const Navigation: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <button
          className={styles.mobileToggle}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          Menu
        </button>

        <ul className={`${styles.navList} ${mobileMenuOpen ? styles.open : ''}`}>
          {navLinks.map((link) => (
            <li key={link.href} className={styles.navItem}>
              <a href={link.href} className={styles.navLink} onClick={() => setMobileMenuOpen(false)}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};
