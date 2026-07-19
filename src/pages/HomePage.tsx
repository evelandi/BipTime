/**
 * HomePage - Página de inicio corporativa
 * Moderno, dinámico y orientado al deporte
 */

import { useState } from 'react';
import { loadHomeEvents } from '../shared/utils/eventsStore';
import styles from './HomePage.module.css';

function formatEventDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function HomePage() {
  const events = loadHomeEvents();
  const [selectedId, setSelectedId] = useState(events[0]?.id ?? '');
  const event = events.find(e => e.id === selectedId) ?? events[0];

  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            <span className={styles.heroTitleLine}>Cronometramos Tu Pasión</span>
            <span className={`${styles.heroTitleLine} ${styles.heroTitleLineAlt}`}>Vestimos Tu Evento</span>
          </h1>
          <div className={styles.heroCTA}>
            <a href="/results" className={styles.ctaPrimary}>
              Ver Resultados
            </a>
            {/* <a href="/catalog" className={styles.ctaSecondary}>
              Explorar Catálogo
            </a> */}
          </div>
        </div>
      </section>

      {events.length > 0 && (
        <>
          <div className={styles.eventSelector}>
            <label className={styles.eventSelectorLabel}>Selecciona un evento</label>
            <select
              className={styles.eventSelect}
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
            >
              {events.map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>

          <section
            className={styles.eventBanner}
            style={event!.coverImage ? { backgroundImage: `url(${event!.coverImage})` } : undefined}
          >
            {event!.coverImage && <div className={styles.eventBannerOverlay} />}
            <div className={styles.eventBannerContent}>
            <p className={styles.eventLabel}>Próximo Evento</p>
            <h2 className={styles.eventDate}>{formatEventDate(event!.date)}</h2>
            <div className={styles.eventMeta}>
              <div>
                <span>Ubicación</span>
                <strong>{event!.location}</strong>
              </div>
              <div>
                <span>Hora</span>
                <strong>{event!.hours}</strong>
              </div>
              <div>
                <span>Modalidad</span>
                <strong>{event!.modalities}</strong>
              </div>
            </div>
            </div>
          </section>

          <section className={styles.schedule}>
            <h2>Agenda del Evento</h2>
            <div className={styles.scheduleList}>
              {event!.schedule.map((item, i) => (
                <article key={i} className={styles.scheduleItem}>
                  <h3>{item.time} — {item.title}</h3>
                  <p>{item.desc}</p>
                </article>
              ))}
            </div>
          </section>
        </>
      )}

      <section className={styles.visuals}>
        {/* Cronometraje: imagen + lista */}
        <div className={styles.servicesLayout}>
          <div className={styles.servicesCoverImg}></div>
          <div className={styles.servicesInfo}>
            <p className={styles.servicesKicker}>Lo que hacemos</p>
            <h2>Servicios de cronometraje</h2>
            <ul className={styles.servicesList}>
              <li>
                <span className={styles.serviceName}>Chip RFID</span>
                <span className={styles.serviceDesc}>Identificación por radiofrecuencia para medición precisa en cada dorsal.</span>
              </li>
              <li>
                <span className={styles.serviceName}>Antenas de cronometraje</span>
                <span className={styles.serviceDesc}>Equipos de alta precisión para captura de datos en la línea de meta.</span>
              </li>
              <li>
                <span className={styles.serviceName}>Resultados online</span>
                <span className={styles.serviceDesc}>Clasificaciones en tiempo real disponibles en línea para participantes y público.</span>
              </li>
              <li>
                <span className={styles.serviceName}>Soporte en sitio</span>
                <span className={styles.serviceDesc}>Asistencia técnica profesional durante todo el evento.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Servicios adicionales */}
        <div className={styles.additionalsSection}>
          <p className={styles.servicesKicker}>También ofrecemos</p>
          <h3 className={styles.additionalTitle}>Servicios adicionales</h3>
          <div className={styles.additionalGrid}>
            <article className={`${styles.additionalCard} ${styles.additionalShirts}`}>
              <div className={styles.additionalOverlay}></div>
              <div className={styles.additionalCardContent}>
                <h4>Camisetas</h4>
                <p>Diseño y confección con tecnología de sublimación.</p>
              </div>
            </article>
            <article className={`${styles.additionalCard} ${styles.additionalNecks}`}>
              <div className={styles.additionalOverlay}></div>
              <div className={styles.additionalCardContent}>
                <h4>Cuellos</h4>
                <p>Accesorios versátiles con diseño del evento.</p>
              </div>
            </article>
            <article className={`${styles.additionalCard} ${styles.additionalMedals}`}>
              <div className={styles.additionalOverlay}></div>
              <div className={styles.additionalCardContent}>
                <h4>Medallería</h4>
                <p>Medallas personalizadas de alta calidad.</p>
              </div>
            </article>
          </div>
          <div className={styles.additionalsCTA}>
            <a href="https://wa.me/573144113194" target="_blank" rel="noopener noreferrer" className={styles.additionalsCTABtn}>
              Cotizar — +57 314 411 3194
            </a>
            <a href="https://wa.me/573014268728" target="_blank" rel="noopener noreferrer" className={styles.additionalsCTABtn}>
              Cotizar — +57 301 426 8728
            </a>
          </div>
        </div>
      </section>

      <section id="contacto" className={styles.contact}>
        <h2>Contacto</h2>
        <p className={styles.contactLead}>Cuéntanos fecha, ciudad, cantidad de competidores y tipo de carrera. Te respondemos con una propuesta rápida para tu evento.</p>
        <div className={styles.contactGrid}>
          <article className={styles.contactCard}>
            <h3>WhatsApp</h3>
            <p>+57 314 411 3194</p>
            <a href="https://wa.me/573144113194" target="_blank" rel="noopener noreferrer">Escribir ahora</a>
          </article>
          <article className={styles.contactCard}>
            <h3>WhatsApp</h3>
            <p>+57 301 426 8728</p>
            <a href="https://wa.me/573014268728" target="_blank" rel="noopener noreferrer">Escribir ahora</a>
          </article>
          <article className={styles.contactCard}>
            <h3>Email</h3>
            <p>biptimecol@gmail.com</p>
            <a href="mailto:biptimecol@gmail.com">Enviar correo</a>
          </article>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <h2>¿Tu próximo evento necesita cronometraje?</h2>
        <p>Hablemos de una solución integral de timing e indumentaria para tu carrera.</p>
        <a href="https://wa.me/573144113194" target="_blank" rel="noopener noreferrer" className={styles.whatsappBtn}>
          Escribir a WhatsApp
        </a>
      </section>
    </div>
  );
}
