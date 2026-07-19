/**
 * Results Page - Página de resultados públicos de carreras
 */

import { useMemo, useState } from 'react';
import { ResultsFilters, ResultsTable } from '../features/results';
import { CertificateModal } from '../features/certificate';
import type { RaceResult, ResultsFilters as FiltersType } from '../shared/types';
import { loadRaces, loadRawRaces } from '../shared/utils/raceResultsStore';
import { loadRawHomeEvents } from '../shared/utils/eventsStore';
import styles from './ResultsPage.module.css';

const DEFAULT_FILTERS: FiltersType = {
  distancia: null,
  genero: null,
  categoria: null,
  dorsal: null,
  nombre: null,
  orderBy: 'posicionGeneral',
};

const formatRaceDate = (dateValue: string) => {
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateValue;
  return date.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
};

export default function ResultsPage() {
  const [races] = useState(() => {
    const homeEvents = loadRawHomeEvents();
    const rawRaces = loadRawRaces();

    if (homeEvents.length > 0) {
      // Only show races that have a matching HomeEvent (source of truth)
      const validIds = new Set(homeEvents.map(e => e.id));
      const filtered = rawRaces.filter(r => validIds.has(r.id));
      if (filtered.length > 0) return filtered;
    }

    // Fallback: raw races or demo
    return rawRaces.length > 0 ? rawRaces : loadRaces();
  });
  const [selectedRaceId, setSelectedRaceId] = useState(() => {
    const homeEvents = loadRawHomeEvents();
    const rawRaces = loadRawRaces();
    if (homeEvents.length > 0) {
      const validIds = new Set(homeEvents.map(e => e.id));
      const filtered = rawRaces.filter(r => validIds.has(r.id));
      if (filtered.length > 0) return filtered[0].id;
    }
    const list = rawRaces.length > 0 ? rawRaces : loadRaces();
    return list[0]?.id || '';
  });
  const [filters, setFilters] = useState<FiltersType>(DEFAULT_FILTERS);
  const [selectedRunner, setSelectedRunner] = useState<RaceResult | null>(null);

  const selectedRace = useMemo(
    () => races.find((race) => race.id === selectedRaceId) || null,
    [races, selectedRaceId],
  );

  const handleRaceChange = (raceId: string) => {
    setSelectedRaceId(raceId);
    setFilters(DEFAULT_FILTERS);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.kicker}>Resultados Oficiales</p>
        <h1>Resultados de Carreras</h1>
        <p>Selecciona la carrera para ver su tabla de posiciones y tiempos.</p>
        <div className={styles.headerMeta}>
          {selectedRace ? (
            <>
              <span>{formatRaceDate(selectedRace.date)}</span>
              <span>{selectedRace.location}</span>
              <span>{selectedRace.results.length} corredores</span>
            </>
          ) : (
            <span>Sin carreras disponibles</span>
          )}
        </div>
      </header>

      <section className={styles.raceSelector}>
        <p className={styles.selectorTitle}>Selecciona la carrera</p>
        <div className={styles.raceGrid}>
          {races.map((race) => (
            <button
              key={race.id}
              type="button"
              className={`${styles.raceCard} ${selectedRaceId === race.id ? styles.raceCardActive : ''}`}
              onClick={() => handleRaceChange(race.id)}
              style={{ backgroundImage: `url(${race.coverImage || '/images/results-running.jpg'})` }}
            >
              <span className={styles.raceCardOverlay}></span>
              <span className={styles.raceCardContent}>
                <strong>{race.name}</strong>
                <small>{formatRaceDate(race.date)} · {race.location}</small>
                <span className={`${styles.badge} ${race.results.length === 0 ? styles.badgeEmpty : ''}`}>
                  {race.results.length > 0 ? `${race.results.length} resultados` : 'Sin resultados'}
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {selectedRace && selectedRace.results.length > 0 ? (
        <>
          <ResultsFilters filters={filters} onFiltersChange={setFilters} data={selectedRace.results} />
          <ResultsTable data={selectedRace.results} filters={filters} onRunnerSelect={setSelectedRunner} />
        </>
      ) : (
        <section className={styles.emptyState}>
          <p>No hay resultados cargados para esta carrera.</p>
        </section>
      )}

      {selectedRunner && (
        <CertificateModal
          runner={selectedRunner}
          coverImage={selectedRace?.coverImage}
          onClose={() => setSelectedRunner(null)}
        />
      )}
    </div>
  );
}
