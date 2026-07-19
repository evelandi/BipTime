/**
 * Layout Component - Envolvente principal
 * Contiene Header, Navigation, Footer y proporciona estructura base
 */

import React, { type ReactNode } from 'react';
import { Header } from './Header';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import styles from './Layout.module.css';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className={styles.layout}>
      <Header />
      <Navigation />
      <main className={styles.main}>{children}</main>
      <Footer />
    </div>
  );
};
