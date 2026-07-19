/**
 * Design tokens - Paleta corporativa BipTime
 * Colores: Negro, Amarillo, Gris y Blanco
 */

export const colors = {
  // Primarios corporativos
  primary: '#000000', // Negro
  accent: '#FFD700', // Amarillo
  neutral: {
    dark: '#333333', // Gris oscuro
    medium: '#666666', // Gris medio
    light: '#E8E8E8', // Gris claro
    lighter: '#F5F5F5', // Gris muy claro
  },
  background: '#FFFFFF', // Blanco
  text: {
    primary: '#000000', // Negro
    secondary: '#666666', // Gris medio
    light: '#FFFFFF', // Blanco
  },
  status: {
    success: '#003300', // Verde oscuro (variación)
    warning: '#FF8C00', // Naranja oscuro
    error: '#8B0000', // Rojo oscuro
    info: '#000080', // Azul oscuro
  },
  borders: {
    light: '#E8E8E8',
    medium: '#CCCCCC',
    dark: '#333333',
  },
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
} as const;

export const typography = {
  fontFamily: {
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    heading: '"Inter", "Helvetica Neue", sans-serif',
    display: '"Poppins", "Helvetica Neue", sans-serif',
    mono: '"Courier New", "Courier", monospace',
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
    xxl: '24px',
    xxxl: '32px',
    heading1: '48px',
    heading2: '36px',
    heading3: '28px',
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  lineHeight: {
    tight: '1.2',
    normal: '1.5',
    relaxed: '1.75',
    loose: '2',
  },
} as const;

export const breakpoints = {
  mobile: '320px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1440px',
} as const;

export const shadows = {
  sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
  md: '0 6px 12px rgba(0, 0, 0, 0.12)',
  lg: '0 12px 24px rgba(0, 0, 0, 0.15)',
  xl: '0 20px 40px rgba(0, 0, 0, 0.18)',
  glow: '0 0 20px rgba(255, 215, 0, 0.3)',
} as const;

export const borderRadius = {
  sm: '6px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  full: '9999px',
} as const;

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: '350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;
