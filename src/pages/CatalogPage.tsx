import type { CatalogProduct } from '../shared/types';
import styles from './CatalogPage.module.css';

const products: CatalogProduct[] = [
  {
    id: 'shirt-pro',
    nombre: 'Camiseta Running Pro',
    descripcion: 'Tela liviana de secado rápido para sesiones de alta intensidad.',
    precio: '$95.000',
    categoría: 'Camisetas',
    talla: ['S', 'M', 'L', 'XL'],
    color: ['Negro', 'Gris'],
    imagen: '/images/camisetas.jpg',
  },
  {
    id: 'jacket-trail',
    nombre: 'Chaqueta Trail Shell',
    descripcion: 'Protección ligera para clima variable en montaña y senderos.',
    precio: '$180.000',
    categoría: 'Chaquetas',
    talla: ['S', 'M', 'L'],
    color: ['Negro', 'Amarillo'],
    imagen: '/images/cuellos.jpg',
  },
  {
    id: 'short-race',
    nombre: 'Short Race Elite',
    descripcion: 'Ajuste ergonómico y máxima libertad de movimiento para competencia.',
    precio: '$85.000',
    categoría: 'Shorts',
    talla: ['S', 'M', 'L', 'XL'],
    color: ['Negro'],
    imagen: '/images/hero-running.jpg',
  },
  {
    id: 'kit-event',
    nombre: 'Kit Evento Corporativo',
    descripcion: 'Pack de prendas y accesorios personalizados para carreras masivas.',
    precio: 'Cotizar',
    categoría: 'Kits',
    talla: ['Personalizable'],
    color: ['Negro', 'Amarillo', 'Blanco'],
    imagen: '/images/results-running.jpg',
  },
];

const buildWhatsappLink = (productName: string) => {
  const message = encodeURIComponent(`Hola BipTime, quiero información de: ${productName}`);
  return `https://wa.me/573144113194?text=${message}`;
};

export default function CatalogPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.kicker}>Catálogo Deportivo</p>
        <h1>Indumentaria para Running y Trail</h1>
        <p>Prendas técnicas para atletas, clubes y eventos. Sin checkout: cotización directa por WhatsApp.</p>
      </header>

      <section className={styles.grid}>
        {products.map((product) => (
          <article key={product.id} className={styles.card}>
            <div className={styles.imageWrap}>
              <img src={product.imagen} alt={product.nombre} className={styles.image} loading="lazy" decoding="async" />
              <div className={styles.imageOverlay}></div>
              <span className={styles.category}>{product.categoría}</span>
            </div>

            <div className={styles.content}>
              <h2>{product.nombre}</h2>
              <p className={styles.description}>{product.descripcion}</p>

              <div className={styles.meta}>
                <p>
                  <span>Precio</span>
                  <strong>{product.precio || 'Consultar'}</strong>
                </p>
                <p>
                  <span>Tallas</span>
                  <strong>{product.talla?.join(' · ') || 'Consultar'}</strong>
                </p>
                <p>
                  <span>Colores</span>
                  <strong>{product.color?.join(' · ') || 'Consultar'}</strong>
                </p>
              </div>

              <a
                href={buildWhatsappLink(product.nombre)}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.cta}
              >
                Consultar por WhatsApp
              </a>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
