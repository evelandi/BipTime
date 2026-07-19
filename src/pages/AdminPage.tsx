import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { ExcelImporter, ErrorDisplay } from '../features/results';
import { Toast } from '../shared/components';
import type { ExcelValidationError, HomeEvent, HomeScheduleItem, RaceResult } from '../shared/types';
import { deleteRace, ensureRaceExists, loadRawRaces, updateRaceResults, upsertRace } from '../shared/utils/raceResultsStore';
import { deleteHomeEvent, loadRawHomeEvents, slugifyEvent, upsertHomeEvent } from '../shared/utils/eventsStore';
import styles from './AdminPage.module.css';

const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN ?? '';

export default function AdminPage() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  const [errors, setErrors] = useState<ExcelValidationError[]>([]);
  const [eventResults, setEventResults] = useState<RaceResult[]>([]);

  const [homeEvents, setHomeEvents] = useState<HomeEvent[]>(() => loadRawHomeEvents());
  const [selectedHomeEventId, setSelectedHomeEventId] = useState<string | null>(
    () => loadRawHomeEvents()[0]?.id ?? null
  );
  const [evtName, setEvtName] = useState('');
  const [evtDate, setEvtDate] = useState('');
  const [evtLocation, setEvtLocation] = useState('');
  const [evtHours, setEvtHours] = useState('');
  const [evtModalities, setEvtModalities] = useState('');
  const [evtCoverImage, setEvtCoverImage] = useState('');
  const [evtScheduleRaw, setEvtScheduleRaw] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const isCreatingNewEvent = selectedHomeEventId === null;
  const selectedHomeEvent = homeEvents.find(e => e.id === selectedHomeEventId) ?? null;

  const evtFormTitle = isCreatingNewEvent ? 'Nuevo evento' : `Editando: ${selectedHomeEvent?.name}`;

  // Sync: garantizar que cada homeEvent tenga su raceEvent
  useEffect(() => {
    loadRawHomeEvents().forEach(ensureRaceExists);
  }, []);

  const clearEvtForm = () => {
    setEvtName(''); setEvtDate(''); setEvtLocation('');
    setEvtHours(''); setEvtModalities(''); setEvtCoverImage(''); setEvtScheduleRaw('');
    setIsDirty(false);
  };

  const parseSchedule = (raw: string): HomeScheduleItem[] =>
    raw.split('\n').map(l => l.trim()).filter(Boolean).map(line => {
      const [timePart, rest] = line.split('|').map(s => s.trim());
      const [titlePart, ...descParts] = (rest ?? timePart).split(':').map(s => s.trim());
      return { time: rest ? timePart : '', title: titlePart ?? '', desc: descParts.join(':').trim() };
    });

  const handleSaveHomeEvent = (e: FormEvent) => {
    e.preventDefault();
    if (!evtName.trim() || !evtDate.trim()) return;
    const base = isCreatingNewEvent ? null : selectedHomeEvent;
    const saved: HomeEvent = {
      id: base?.id ?? slugifyEvent(evtName, evtDate),
      name: evtName.trim(),
      date: evtDate.trim(),
      location: evtLocation.trim(),
      hours: evtHours.trim(),
      modalities: evtModalities.trim(),
      coverImage: evtCoverImage.trim() || undefined,
      schedule: evtScheduleRaw.trim() ? parseSchedule(evtScheduleRaw) : (base?.schedule ?? []),
    };
    const updated = upsertHomeEvent(saved);
    setHomeEvents(updated);
    setSelectedHomeEventId(saved.id);
    // Sync con raceResultsStore para que ResultsPage funcione
    const existingRace = loadRawRaces().find(r => r.id === saved.id);
    upsertRace({
      id: saved.id,
      name: saved.name,
      date: saved.date,
      location: saved.location,
      coverImage: saved.coverImage ?? existingRace?.coverImage ?? '/images/results-running.jpg',
      results: existingRace?.results ?? [],
    });
    setIsDirty(false);
    setToast({ message: 'Evento guardado correctamente', type: 'success' });
  };

  const handleDeleteHomeEvent = () => {
    if (!selectedHomeEvent) return;
    if (!window.confirm(`¿Eliminar "${selectedHomeEvent.name}"?`)) return;
    const updated = deleteHomeEvent(selectedHomeEvent.id);
    deleteRace(selectedHomeEvent.id);
    setHomeEvents(updated);
    setSelectedHomeEventId(updated[0]?.id ?? null);
    setErrors([]);
    setEventResults([]);
    setToast({ message: 'Evento eliminado', type: 'success' });
  };

  const handleDataLoaded = (newData: RaceResult[]) => {
    if (!selectedHomeEventId) return;
    updateRaceResults(selectedHomeEventId, newData);
    setEventResults(newData);
    setErrors([]);
    setToast({ message: `${newData.length} resultados importados`, type: 'success' });
  };

  useEffect(() => {
    if (isCreatingNewEvent) { clearEvtForm(); setEventResults([]); return; }
    if (!selectedHomeEvent) return;
    setEvtName(selectedHomeEvent.name);
    setEvtDate(selectedHomeEvent.date);
    setEvtLocation(selectedHomeEvent.location);
    setEvtHours(selectedHomeEvent.hours);
    setEvtModalities(selectedHomeEvent.modalities);
    setEvtCoverImage(selectedHomeEvent.coverImage ?? '');
    setEvtScheduleRaw(selectedHomeEvent.schedule.map(s => `${s.time} | ${s.title}: ${s.desc}`).join('\n'));
    const race = loadRawRaces().find(r => r.id === selectedHomeEventId);
    setEventResults(race?.results ?? []);
  }, [selectedHomeEventId]);

  const unlockAdmin = (event: FormEvent) => {
    event.preventDefault();
    if (pinInput !== ADMIN_PIN) {
      setPinError('Clave incorrecta.');
      return;
    }
    setPinError(null);
    setIsUnlocked(true);
  };

  if (!isUnlocked) {
    return (
      <section className={styles.page}>
        <header className={styles.header}>
          <p className={styles.kicker}>Admin</p>
          <h1>Panel de Administración</h1>
          <p>Ingresa la clave para gestionar carreras y cargar resultados.</p>
        </header>

        <form className={styles.unlockCard} onSubmit={unlockAdmin}>
          <label htmlFor="admin-pin">Clave de acceso</label>
          <input
            id="admin-pin"
            type="password"
            value={pinInput}
            onChange={(event) => setPinInput(event.target.value)}
            placeholder="••••••••"
          />
          {pinError && <p className={styles.pinError}>{pinError}</p>}
          <button type="submit">Ingresar</button>
        </form>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <p className={styles.kicker}>Admin</p>
        <h1>Eventos del Home</h1>
        <p>Gestiona los eventos de la página principal y carga los resultados de cada carrera.</p>
      </header>

      <div className={styles.grid}>
        {/* Lista de eventos */}
        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Eventos publicados</h3>
            <button
              type="button"
              className={styles.newButton}
              onClick={() => {
                if (isDirty && !window.confirm('Tienes cambios sin guardar. ¿Descartar y crear un evento nuevo?')) return;
                setSelectedHomeEventId(null);
              }}
            >
              + Nuevo
            </button>
          </div>
          {homeEvents.length === 0 ? (
            <p className={styles.emptyText}>No hay eventos. Crea el primero →</p>
          ) : (
            <ul className={styles.eventList}>
              {homeEvents.map(e => (
                <li
                  key={e.id}
                  className={`${styles.eventListItem} ${selectedHomeEventId === e.id ? styles.eventListItemActive : ''}`}
                  onClick={() => {
                    if (isDirty && !window.confirm('Tienes cambios sin guardar. ¿Descartar y cambiar de evento?')) return;
                    setSelectedHomeEventId(e.id);
                  }}
                >
                  <strong>{e.name}</strong>
                  <span>{e.date}</span>
                </li>
              ))}
            </ul>
          )}
        </article>

        {/* Formulario + carga de resultados */}
        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>{evtFormTitle}</h3>
            {!isCreatingNewEvent && (
              <button type="button" className={styles.deleteButton} onClick={handleDeleteHomeEvent}>
                Eliminar
              </button>
            )}
          </div>
          <form className={styles.createForm} onSubmit={handleSaveHomeEvent}>
            <input
              type="text"
              placeholder="Nombre del evento *"
              value={evtName}
              onChange={e => { setEvtName(e.target.value); setIsDirty(true); }}
            />
            <input
              type="date"
              value={evtDate}
              onChange={e => { setEvtDate(e.target.value); setIsDirty(true); }}
              style={{ colorScheme: 'dark' }}
            />
            <p className={styles.helperText}>Fecha del evento (requerida)</p>
            <input
              type="text"
              placeholder="Ubicación (ej: Parque Arví, Medellín)"
              value={evtLocation}
              onChange={e => { setEvtLocation(e.target.value); setIsDirty(true); }}
            />
            <input
              type="text"
              placeholder="Horario (ej: 7AM - 2PM)"
              value={evtHours}
              onChange={e => { setEvtHours(e.target.value); setIsDirty(true); }}
            />
            <input
              type="text"
              placeholder="Modalidades (ej: 5K / 10K / Trail)"
              value={evtModalities}
              onChange={e => { setEvtModalities(e.target.value); setIsDirty(true); }}
            />
            <label className={styles.fieldLabel}>Imagen de fondo</label>
            <input
              type="file"
              accept="image/*"
              className={styles.fileInput}
              onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                const MAX_SIZE_BYTES = 600 * 1024; // 600 KB
                if (file.size > MAX_SIZE_BYTES) {
                  alert(`La imagen es muy grande (${(file.size / 1024).toFixed(0)} KB). El límite es 600 KB. Usa una imagen más pequeña o comprimida.`);
                  e.target.value = '';
                  return;
                }
                const reader = new FileReader();
                reader.onload = ev => { setEvtCoverImage(ev.target?.result as string); setIsDirty(true); };
                reader.readAsDataURL(file);
              }}
            />
            {evtCoverImage && (
              <div className={styles.imagePreview}>
                <img src={evtCoverImage} alt="Vista previa" />
                <button
                  type="button"
                  className={styles.removeImageBtn}
                  onClick={() => setEvtCoverImage('')}
                >
                  Quitar imagen
                </button>
              </div>
            )}
            <label className={styles.fieldLabel}>
              Agenda <span>(una entrada por línea)</span>
            </label>
            <textarea
              rows={6}
              placeholder={'6:30 AM | Apertura: Recogida de dorsales.\n7:00 AM | Largada: Inicio oficial.'}
              value={evtScheduleRaw}
              onChange={e => { setEvtScheduleRaw(e.target.value); setIsDirty(true); }}
            />
            <p className={styles.helperText}>Formato: <code>HH:MM AM | Título: Descripción</code></p>
            <button type="submit">
              {isCreatingNewEvent ? 'Crear evento' : 'Guardar cambios'}
            </button>
          </form>

          {!isCreatingNewEvent && selectedHomeEvent && (
            <>
              <hr className={styles.formDivider} />
              <h4 className={styles.uploaderTitle}>Resultados Excel</h4>
              <p className={styles.uploaderHint}>
                {eventResults.length > 0
                  ? `${eventResults.length} resultados cargados. Sube un nuevo archivo para reemplazarlos.`
                  : 'Carga el archivo Excel con los resultados de este evento.'}
              </p>
              <ExcelImporter onDataLoaded={handleDataLoaded} onError={setErrors} />
              {errors.length > 0 && <ErrorDisplay errors={errors} />}
            </>
          )}
        </article>
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </section>
  );
}
