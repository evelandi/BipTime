import type { HomeEvent } from '../types';

const STORAGE_KEY = 'biptime.homeEvents';

const DEFAULT_EVENTS: HomeEvent[] = [
  {
    id: "reto-trail-tobia-chica-sep-14,-2026",
    name: "Reto Trail Tobia Chica",
    date: "Sep 14, 2026",
    location: "Tobia, Cundinamarca",
    hours: "7 AM - 12 PM",
    modalities: "7K / 14K",
    coverImage: '/images/results-running.jpg',
    schedule: [
    { time: "6:30", title: "Entrega de Kits", desc: "" },
    { time: "7:00", title: "Calentamiento", desc: "" },
    { time: "7:30", title: "Largada 14K", desc: "" },
    { time: "7:45", title: "Largada 7K", desc: "" },
    { time: "11:00", title: "Premiaci�n", desc: "" },
    { time: "12:00", title: "Cierre del Evento", desc: "" },
    ],
  },
];

// Used by public pages — falls back to demo data when nothing is stored
export function loadHomeEvents(): HomeEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return DEFAULT_EVENTS; // key never set → show demos
    const parsed = JSON.parse(raw) as HomeEvent[];
    return Array.isArray(parsed) ? parsed : DEFAULT_EVENTS;
  } catch {
    return DEFAULT_EVENTS;
  }
}

// Used by admin & mutations — returns only what is actually stored (no demo fallback)
export function loadRawHomeEvents(): HomeEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HomeEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function save(events: HomeEvent[]): HomeEvent[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  return events;
}

export function upsertHomeEvent(event: HomeEvent): HomeEvent[] {
  const current = loadRawHomeEvents();
  const idx = current.findIndex(e => e.id === event.id);
  const updated = idx >= 0
    ? current.map(e => e.id === event.id ? event : e)
    : [...current, event];
  return save(updated);
}

export function deleteHomeEvent(id: string): HomeEvent[] {
  const updated = loadRawHomeEvents().filter(e => e.id !== id);
  return save(updated);
}

export function slugifyEvent(name: string, date: string): string {
  const namePart = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const datePart = date.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return `${namePart}-${datePart}`;
}
