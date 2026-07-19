import styles from './BrandLogo.module.css';

interface BrandLogoProps {
  variant?: 'default' | 'badge';
  className?: string;
}

export function BrandLogo({ variant = 'default', className = '' }: BrandLogoProps) {
  const classes = [styles.logo, variant === 'badge' ? styles.badge : '', className].filter(Boolean).join(' ');

  return (
    <img
      className={classes}
      src="/images/biptime-logo.png"
      alt="BipTime"
    />
  );
}