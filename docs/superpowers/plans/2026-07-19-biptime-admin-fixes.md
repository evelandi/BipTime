# BipTime — Admin & Event Management Fixes

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corregir las inconsistencias de gestión de eventos en el admin: desync entre stores, pérdida silenciosa de resultados, falta de validaciones, contraseña expuesta, y feedback visual ausente.

**Architecture:** La app es React + Vite + TypeScript con dos localStorage stores (`biptime.homeEvents` / `biptime.races`). No hay backend. Los fixes son todos en el frontend; se organizan de mayor a menor criticidad. Cada tarea es independiente y puede hacerse en orden sin romper las demás.

**Tech Stack:** React 19, TypeScript, Vite 8, react-router-dom 7, localStorage, CSS Modules

---

## Mapa de archivos afectados

| Archivo | Rol |
|---|---|
| `src/shared/utils/eventsStore.ts` | CRUD de HomeEvents en localStorage |
| `src/shared/utils/raceResultsStore.ts` | CRUD de RaceEvents (+ resultados) en localStorage |
| `src/shared/types/index.ts` | Tipos compartidos |
| `src/pages/AdminPage.tsx` | Panel de administración (formulario + carga Excel) |
| `src/pages/AdminPage.module.css` | Estilos del admin |
| `src/pages/ResultsPage.tsx` | Página pública de resultados |
| `src/pages/ResultsPage.module.css` | Estilos de ResultsPage |
| `src/shared/components/Toast.tsx` | **NUEVO** — Componente de notificación toast |
| `src/shared/components/Toast.module.css` | **NUEVO** — Estilos del toast |
| `src/shared/components/index.ts` | Re-exports de shared/components |
| `.env.example` | **NUEVO** — Plantilla de variables de entorno |

---

## Task 1: Corregir `slugifyEvent` — la coma en IDs

**Problema:** `slugifyEvent('Reto Trail', 'Sep 14, 2026')` produce `reto-trail-sep-14,-2026` (con coma). Esto contamina el ID y puede romper comparaciones.

**Files:**
- Modify: `src/shared/utils/eventsStore.ts:68-70`

- [ ] **Step 1: Corregir la función `slugifyEvent`**

Reemplazar en `src/shared/utils/eventsStore.ts`:

```ts
// ANTES (línea 68-70):
export function slugifyEvent(name: string, date: string): string {
  return `${name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')}-${date.replace(/\s+/g, '-').toLowerCase()}`;
}

// DESPUÉS:
export function slugifyEvent(name: string, date: string): string {
  const namePart = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const datePart = date.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return `${namePart}-${datePart}`;
}
```

- [ ] **Step 2: Verificar manualmente en browser DevTools**

Abrir la consola del browser en `http://localhost:5173`:
```js
// Pegar y ejecutar:
function slugifyEvent(name, date) {
  const namePart = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const datePart = date.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return `${namePart}-${datePart}`;
}
console.assert(slugifyEvent('Reto Trail Tobia', 'Sep 14, 2026') === 'reto-trail-tobia-sep-14-2026', 'sin coma');
console.assert(slugifyEvent('Carrera 5K', 'Dec 1, 2026') === 'carrera-5k-dec-1-2026', '5K ok');
console.log('✅ slugify OK');
```
Expected: `✅ slugify OK` sin errores de assertion.

- [ ] **Step 3: Commit**

```bash
cd /Users/ericvelandia/Documents/Development/BipTime
git add src/shared/utils/eventsStore.ts
git commit -m "fix: remove commas and special chars from event ID slugs"
```

---

## Task 2: Corregir datos por defecto — encoding UTF-8 roto

**Problema:** Los datos default en ambos stores tienen `Premiaci��n` (caracteres de reemplazo) en lugar de `Premiación`. Esto sale en la app como `Premiaci??n`.

**Files:**
- Modify: `src/shared/utils/eventsStore.ts:19`
- Modify: `src/shared/utils/raceResultsStore.ts` — múltiples ocurrencias

- [ ] **Step 1: Corregir el event por defecto en `eventsStore.ts`**

En `src/shared/utils/eventsStore.ts`, en el array `DEFAULT_EVENTS`, corregir la línea 19:

```ts
// ANTES:
{ time: "11:00", title: "Premiaci��n", desc: "" },

// DESPUÉS:
{ time: "11:00", title: "Premiación", desc: "" },
```

- [ ] **Step 2: Corregir los IDs y nombres en `raceResultsStore.ts`**

Abrir `src/shared/utils/raceResultsStore.ts` y hacer los siguientes reemplazos (usar Find & Replace en el editor):

| Texto con `�` | Texto correcto |
|---|---|
| `Premiaci��n` | `Premiación` |
| `John Cardona L�pez` | `John Cardona López` |
| `James orlando mu�os Rodr�guez` | `James orlando muños Rodríguez` |
| `Mar�a Carolina Mendez G�mez` | `María Carolina Mendez Gómez` |
| `Aleida Liliana Arevalo Ar�valo` | `Aleida Liliana Arevalo Arévalo` |
| `Alexis Steban Ariza Hern�ndez` | `Alexis Steban Ariza Hernández` |

Nota: los IDs que usan estos nombres también deben actualizarse para ser consistentes. Hacer replace de `_L�pez` → `_Lopez`, `_Hern�ndez` → `_Hernandez`, etc. en los `id:` strings (usar versión sin tilde en IDs para evitar URL encoding issues).

- [ ] **Step 3: Verificar en browser**

Iniciar `npm run dev` y verificar:
1. Ir a `/` — La agenda del evento debe mostrar "Premiación" sin caracteres extraños.
2. Ir a `/results` — Los nombres de corredores deben verse sin `?`.

- [ ] **Step 4: Commit**

```bash
git add src/shared/utils/eventsStore.ts src/shared/utils/raceResultsStore.ts
git commit -m "fix: correct UTF-8 encoding in default seed data"
```

---

## Task 3: Sincronizar stores en arranque del Admin — prevenir pérdida de resultados

**Problema:** Si `biptime.homeEvents` tiene eventos pero `biptime.races` está vacío o incompleto (desync por limpieza parcial del localStorage), el admin muestra resultados vacíos y al guardar el evento los reemplaza por `[]`.

**Solución:** Añadir una función `syncEventToRaces` que, al cargar el admin, garantice que cada `HomeEvent` tenga un `RaceEvent` correspondiente en el races store.

**Files:**
- Modify: `src/shared/utils/raceResultsStore.ts` — añadir `ensureRaceExists`
- Modify: `src/pages/AdminPage.tsx` — llamar `ensureRaceExists` al montar

- [ ] **Step 1: Añadir `ensureRaceExists` en `raceResultsStore.ts`**

Al final de `src/shared/utils/raceResultsStore.ts`, antes del último export, añadir:

```ts
/**
 * Garantiza que exista un RaceEvent para el HomeEvent dado.
 * Si no existe, lo crea con resultados vacíos.
 * Si ya existe, no lo modifica (preserva resultados).
 */
export const ensureRaceExists = (event: { id: string; name: string; date: string; location: string; coverImage?: string }) => {
  const races = loadRawRaces();
  const exists = races.some(r => r.id === event.id);
  if (!exists) {
    upsertRace({
      id: event.id,
      name: event.name,
      date: event.date,
      location: event.location,
      coverImage: event.coverImage ?? '/images/results-running.jpg',
      results: [],
    });
  }
};
```

- [ ] **Step 2: Llamar `ensureRaceExists` al montar el admin**

En `src/pages/AdminPage.tsx`, añadir el import:

```ts
// Añadir a los imports de raceResultsStore (línea 5):
import { deleteRace, ensureRaceExists, loadRawRaces, updateRaceResults, upsertRace } from '../shared/utils/raceResultsStore';
```

Luego, añadir un `useEffect` de montaje después del bloque de `useState` (después de línea 29):

```ts
// Añadir después de todos los useState, antes de la línea "const isCreatingNewEvent":
useEffect(() => {
  const events = loadRawHomeEvents();
  events.forEach(ensureRaceExists);
}, []); // solo al montar
```

- [ ] **Step 3: Verificar en browser**

1. Abrir DevTools → Application → Local Storage.
2. Borrar manualmente la key `biptime.races`.
3. Navegar a `/admin` e ingresar la clave.
4. Verificar en Local Storage que `biptime.races` volvió a aparecer con el evento de demo (sin resultados).
5. Verificar que los resultados del evento que ya tenía resultados siguen presentes (borrar solo `biptime.races` y no `biptime.homeEvents` debe mostrar events sin resultados, no crashear).

- [ ] **Step 4: Commit**

```bash
git add src/shared/utils/raceResultsStore.ts src/pages/AdminPage.tsx
git commit -m "fix: ensure race record exists for every home event on admin load"
```

---

## Task 4: Validación de tamaño de imagen

**Problema:** Las imágenes se convierten a base64 y se guardan en localStorage sin validar tamaño. Una imagen de 2MB consume ~2.7MB del límite de ~5MB de localStorage.

**Files:**
- Modify: `src/pages/AdminPage.tsx:229-235`

- [ ] **Step 1: Añadir validación de tamaño antes de leer el archivo**

En `src/pages/AdminPage.tsx`, reemplazar el `onChange` del input de imagen (línea 229-234):

```tsx
// ANTES:
onChange={e => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => setEvtCoverImage(ev.target?.result as string);
  reader.readAsDataURL(file);
}}

// DESPUÉS:
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
  reader.onload = ev => setEvtCoverImage(ev.target?.result as string);
  reader.readAsDataURL(file);
}}
```

- [ ] **Step 2: Verificar en browser**

1. Ir a `/admin`, ingresar clave.
2. En el formulario de evento, intentar subir una imagen > 600KB.
3. Debe aparecer el `alert` con el mensaje de tamaño y el input debe limpiarse.
4. Subir una imagen < 600KB — debe mostrarse la vista previa normalmente.

- [ ] **Step 3: Commit**

```bash
git add src/pages/AdminPage.tsx
git commit -m "fix: validate image size before storing as base64 (limit 600KB)"
```

---

## Task 5: Guard de cambios sin guardar al cambiar de evento

**Problema:** Hacer clic en un evento de la lista mientras hay cambios sin guardar en el formulario los descarta silenciosamente.

**Files:**
- Modify: `src/pages/AdminPage.tsx`

- [ ] **Step 1: Añadir estado `isDirty` al formulario**

En `src/pages/AdminPage.tsx`, añadir un nuevo useState después de los campos del formulario (después de línea 29):

```ts
const [isDirty, setIsDirty] = useState(false);
```

- [ ] **Step 2: Marcar el formulario como sucio en cada cambio de campo**

Envolver todos los `onChange` de los inputs del formulario para que también llamen `setIsDirty(true)`. La forma más limpia es un helper:

```ts
// Añadir esta función helper después de clearEvtForm:
const makeDirty = <T>(setter: React.Dispatch<React.SetStateAction<T>>) =>
  (value: T) => { setter(value); setIsDirty(true); };
```

Luego reemplazar los setters en los `onChange` de los inputs:

```tsx
// Nombre del evento:
onChange={e => { setEvtName(e.target.value); setIsDirty(true); }}

// Fecha:
onChange={e => { setEvtDate(e.target.value); setIsDirty(true); }}

// Ubicación:
onChange={e => { setEvtLocation(e.target.value); setIsDirty(true); }}

// Horario:
onChange={e => { setEvtHours(e.target.value); setIsDirty(true); }}

// Modalidades:
onChange={e => { setEvtModalities(e.target.value); setIsDirty(true); }}

// Agenda textarea:
onChange={e => { setEvtScheduleRaw(e.target.value); setIsDirty(true); }}
```

- [ ] **Step 3: Limpiar `isDirty` después de guardar y al cargar un evento**

Al final de `handleSaveHomeEvent` (después de `upsertRace`, línea ~74), añadir:
```ts
setIsDirty(false);
```

En `clearEvtForm`, añadir al final:
```ts
setIsDirty(false);
```

- [ ] **Step 4: Agregar confirmación al cambiar de evento en la lista**

En el `onClick` del `<li>` de la lista de eventos (línea ~172):

```tsx
// ANTES:
onClick={() => setSelectedHomeEventId(e.id)}

// DESPUÉS:
onClick={() => {
  if (isDirty && !window.confirm('Tienes cambios sin guardar. ¿Descartar y cambiar de evento?')) return;
  setSelectedHomeEventId(e.id);
}}
```

También en el botón `+ Nuevo` (línea ~157):
```tsx
// ANTES:
onClick={() => setSelectedHomeEventId(null)}

// DESPUÉS:
onClick={() => {
  if (isDirty && !window.confirm('Tienes cambios sin guardar. ¿Descartar y crear un evento nuevo?')) return;
  setSelectedHomeEventId(null);
}}
```

- [ ] **Step 5: Verificar en browser**

1. Ir a `/admin`, ingresar clave.
2. Seleccionar el evento existente, cambiar el nombre pero NO guardar.
3. Hacer clic en otro evento de la lista → debe aparecer el confirm.
4. Cancelar → debe quedarse en el mismo evento con los cambios intactos.
5. Aceptar → debe cambiar al otro evento y perder los cambios.
6. Guardar normalmente → luego cambiar de evento sin confirm (no dirty).

- [ ] **Step 6: Commit**

```bash
git add src/pages/AdminPage.tsx
git commit -m "feat: warn before discarding unsaved event form changes"
```

---

## Task 6: Mejora del campo de fecha — validación básica de formato

**Problema:** El campo de fecha es texto libre. Cualquier formato produce un ID diferente y puede romper la visualización en `/results` (que hace `new Date(date)` al formatear).

**Solución:** Cambiar a `<input type="date">` (que guarda `YYYY-MM-DD`) y mostrar el valor formateado en español en la UI pública.

**Files:**
- Modify: `src/pages/AdminPage.tsx:200-204`
- Modify: `src/pages/HomePage.tsx` — ya usa `event!.date` directamente como texto
- Modify: `src/pages/ResultsPage.tsx:22-26` — `formatRaceDate` ya maneja `YYYY-MM-DD`

- [ ] **Step 1: Cambiar el input de fecha en el admin**

En `src/pages/AdminPage.tsx`, reemplazar el input de fecha (líneas 200-204):

```tsx
// ANTES:
<input
  type="text"
  placeholder="Fecha (ej: May 12, 2026) *"
  value={evtDate}
  onChange={e => { setEvtDate(e.target.value); setIsDirty(true); }}
/>

// DESPUÉS:
<input
  type="date"
  value={evtDate}
  onChange={e => { setEvtDate(e.target.value); setIsDirty(true); }}
  style={{ colorScheme: 'dark' }}
/>
<p className={styles.helperText}>Fecha del evento (requerida)</p>
```

- [ ] **Step 2: Actualizar `formatEventDate` en `HomePage.tsx` para que formatee `YYYY-MM-DD`**

En `src/pages/HomePage.tsx`, añadir una función helper antes del componente (el `event.date` se muestra directamente en la línea 62 como `{event!.date}`):

```tsx
// Añadir antes del componente HomePage:
function formatEventDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  if (isNaN(d.getTime())) return dateStr; // fallback si el formato es otro
  return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
}
```

Luego, en la línea 62, reemplazar `{event!.date}` por `{formatEventDate(event!.date)}`.

- [ ] **Step 3: Verificar en browser**

1. Ir a `/admin`, ingresar clave.
2. Crear un nuevo evento: el campo fecha debe ser un date picker nativo.
3. Seleccionar una fecha, guardar.
4. Ir a `/` — el banner del evento debe mostrar la fecha formateada en español (ej: "14 de septiembre de 2026").
5. Ir a `/results` — la fecha en el header ya usa `formatRaceDate` que maneja `YYYY-MM-DD`, debe funcionar igual.

Nota: Los eventos existentes con formato "Sep 14, 2026" seguirán funcionando por el `fallback` en `formatEventDate`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/AdminPage.tsx src/pages/HomePage.tsx
git commit -m "feat: use date input for event date field, format dates in Spanish"
```

---

## Task 7: Eliminar contraseña hardcodeada del bundle

**Problema:** `const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || 'biptime123'` — si `VITE_ADMIN_PIN` no está configurada, el bundle expone `biptime123` en texto plano.

**Files:**
- Modify: `src/pages/AdminPage.tsx:9`
- Create: `.env.example`
- Modify: `.gitignore` (verificar que `.env` esté ignorado)

- [ ] **Step 1: Eliminar el fallback hardcodeado**

En `src/pages/AdminPage.tsx`, línea 9:

```ts
// ANTES:
const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || 'biptime123';

// DESPUÉS:
const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN ?? '';
```

Con `?? ''`, si la variable no está definida, el admin simplemente no deja entrar (pin vacío nunca coincide), en lugar de exponer la contraseña.

- [ ] **Step 2: Crear `.env` local con la clave real**

```bash
# Crear el archivo .env (NO se commitea)
echo "VITE_ADMIN_PIN=biptime123" > /Users/ericvelandia/Documents/Development/BipTime/.env
```

- [ ] **Step 3: Crear `.env.example` para documentar la variable**

Crear `/Users/ericvelandia/Documents/Development/BipTime/.env.example`:

```
# Clave de acceso al panel de administración de BipTime
# Copiar este archivo como .env y rellenar el valor
VITE_ADMIN_PIN=tu_clave_segura_aqui
```

- [ ] **Step 4: Verificar que `.gitignore` ignora `.env`**

```bash
grep -n "\.env" /Users/ericvelandia/Documents/Development/BipTime/.gitignore
```

Expected: debe aparecer una línea con `.env` o `.env.local`. Si no está:
```bash
echo ".env" >> /Users/ericvelandia/Documents/Development/BipTime/.gitignore
```

- [ ] **Step 5: Verificar en browser**

1. Con `.env` configurado, `npm run dev`, ir a `/admin` → debe funcionar la clave definida en `.env`.
2. Renombrar `.env` temporalmente a `.env.bak`, reiniciar dev server.
3. Ir a `/admin` → el login debe aceptar cualquier input vacío sin dejar entrar (pin === '' no coincide con nada). Restaurar `.env.bak` a `.env`.

- [ ] **Step 6: Commit**

```bash
git add src/pages/AdminPage.tsx .env.example .gitignore
git commit -m "security: remove hardcoded admin pin fallback, use env var only"
```

---

## Task 8: Toast de confirmación en operaciones del admin

**Problema:** Al guardar un evento o cargar resultados Excel, no hay feedback visual. El usuario no sabe si la acción tuvo efecto.

**Files:**
- Create: `src/shared/components/Toast.tsx`
- Create: `src/shared/components/Toast.module.css`
- Modify: `src/shared/components/index.ts`
- Modify: `src/pages/AdminPage.tsx`

- [ ] **Step 1: Crear el componente `Toast`**

Crear `src/shared/components/Toast.tsx`:

```tsx
import { useEffect } from 'react';
import styles from './Toast.module.css';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onDismiss: () => void;
  durationMs?: number;
}

export function Toast({ message, type = 'success', onDismiss, durationMs = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [onDismiss, durationMs]);

  return (
    <div className={`${styles.toast} ${styles[type]}`} role="status" aria-live="polite">
      {message}
    </div>
  );
}
```

- [ ] **Step 2: Crear los estilos del Toast**

Crear `src/shared/components/Toast.module.css`:

```css
.toast {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #fff;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  z-index: 9999;
  animation: slideIn 0.2s ease-out;
  max-width: 360px;
}

.success {
  background: #22c55e;
}

.error {
  background: #ef4444;
}

@keyframes slideIn {
  from { transform: translateY(1rem); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
```

- [ ] **Step 3: Exportar `Toast` desde `shared/components/index.ts`**

En `src/shared/components/index.ts`, añadir:

```ts
export { Toast } from './Toast';
```

- [ ] **Step 4: Usar `Toast` en `AdminPage`**

En `src/pages/AdminPage.tsx`:

Añadir import:
```ts
import { Toast } from '../shared/components';
```

Añadir estado para el toast después de los demás `useState`:
```ts
const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
```

En `handleSaveHomeEvent`, justo antes de `setIsDirty(false)`:
```ts
setToast({ message: isCreatingNewEvent ? 'Evento creado exitosamente' : 'Cambios guardados', type: 'success' });
```

En `handleDeleteHomeEvent`, justo antes del cierre de la función:
```ts
setToast({ message: 'Evento eliminado', type: 'success' });
```

En `handleDataLoaded`, justo antes del cierre de la función:
```ts
setToast({ message: `${newData.length} resultados cargados exitosamente`, type: 'success' });
```

Al final del JSX del componente (antes del último cierre `</section>` o `</div>` del componente), añadir:
```tsx
{toast && (
  <Toast
    message={toast.message}
    type={toast.type}
    onDismiss={() => setToast(null)}
  />
)}
```

- [ ] **Step 5: Verificar en browser**

1. Ir a `/admin`, ingresar clave.
2. Guardar un evento → debe aparecer toast verde "Cambios guardados" que desaparece sólo.
3. Crear un evento nuevo → toast "Evento creado exitosamente".
4. Cargar un Excel válido → toast con número de corredores.
5. Eliminar un evento → toast "Evento eliminado".

- [ ] **Step 6: Commit**

```bash
git add src/shared/components/Toast.tsx src/shared/components/Toast.module.css src/shared/components/index.ts src/pages/AdminPage.tsx
git commit -m "feat: add toast notifications for admin save, delete, and upload actions"
```

---

## Task 9: Indicador de resultados en el selector de carreras (ResultsPage)

**Problema:** En `/results`, los cards del selector de carreras no indican cuáles tienen resultados cargados y cuáles están vacíos. El usuario no sabe cuál seleccionar.

**Files:**
- Modify: `src/pages/ResultsPage.tsx:88-105`
- Modify: `src/pages/ResultsPage.module.css`

- [ ] **Step 1: Añadir badge de resultados en el card**

En `src/pages/ResultsPage.tsx`, dentro del `.map` de `races` (líneas 89-104), añadir el badge:

```tsx
// ANTES (línea 97-102):
<span className={styles.raceCardContent}>
  <strong>{race.name}</strong>
  <small>{formatRaceDate(race.date)} · {race.location}</small>
</span>

// DESPUÉS:
<span className={styles.raceCardContent}>
  <strong>{race.name}</strong>
  <small>{formatRaceDate(race.date)} · {race.location}</small>
  {race.results.length > 0
    ? <span className={styles.resultsBadge}>{race.results.length} corredores</span>
    : <span className={`${styles.resultsBadge} ${styles.resultsBadgeEmpty}`}>Sin resultados</span>
  }
</span>
```

- [ ] **Step 2: Añadir estilos del badge en `ResultsPage.module.css`**

Al final de `src/pages/ResultsPage.module.css`, añadir:

```css
.resultsBadge {
  display: inline-block;
  margin-top: 0.25rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  background: rgba(34, 197, 94, 0.25);
  color: #86efac;
  border: 1px solid rgba(34, 197, 94, 0.4);
  letter-spacing: 0.02em;
}

.resultsBadgeEmpty {
  background: rgba(156, 163, 175, 0.15);
  color: #9ca3af;
  border-color: rgba(156, 163, 175, 0.3);
}
```

- [ ] **Step 3: Verificar en browser**

1. Ir a `/results`.
2. Las carreras con resultados deben mostrar un badge verde "N corredores".
3. Las carreras sin resultados deben mostrar un badge gris "Sin resultados".

- [ ] **Step 4: Commit**

```bash
git add src/pages/ResultsPage.tsx src/pages/ResultsPage.module.css
git commit -m "feat: show results count badge on race selector cards"
```

---

## Task 10: Build y verificación final

- [ ] **Step 1: Ejecutar el build de producción**

```bash
cd /Users/ericvelandia/Documents/Development/BipTime
npm run build
```

Expected: `✓ built in X.XXs` sin errores TypeScript ni de compilación.

- [ ] **Step 2: Smoke test con preview**

```bash
npm run preview
```

Abrir `http://localhost:4173` y verificar:
1. `/` — Evento con fecha formateada en español, agenda sin caracteres raros.
2. `/results` — Badge de corredores en los cards de carrera.
3. `/admin` — Login funciona con la clave del `.env`. Crear evento, cambiar de evento con cambios sin guardar (debe pedir confirmación). Subir imagen grande (debe rechazar). Toast aparece al guardar.

- [ ] **Step 3: Copiar el build a `dist` y verificar que el bundle no contiene la clave**

```bash
grep -l "biptime123" dist/assets/*.js && echo "⚠️ CLAVE ENCONTRADA" || echo "✅ Clave no expuesta en bundle"
```

Expected: `✅ Clave no expuesta en bundle`

- [ ] **Step 4: Commit final si hay cambios pendientes**

```bash
git add -A
git status
# Revisar que no haya archivos sensibles (.env) staged
git commit -m "chore: verified production build — all fixes applied"
```

---

## Resumen de mejoras

| # | Fix | Impacto |
|---|---|---|
| 1 | Slugify sin comas | IDs de eventos limpios y predecibles |
| 2 | Encoding UTF-8 | Nombres y agenda sin caracteres `?` |
| 3 | Sync stores al arrancar | Previene pérdida silenciosa de resultados |
| 4 | Validación de imagen | Previene overflow de localStorage (> 600KB) |
| 5 | Guard de cambios sin guardar | No más pérdida accidental de trabajo en el form |
| 6 | Fecha con date picker | Formato consistente, funciona con `formatRaceDate` |
| 7 | PIN solo por env var | La clave no se expone en el bundle de producción |
| 8 | Toast de confirmación | El admin sabe cuándo una acción tuvo efecto |
| 9 | Badge de resultados | El público sabe qué carreras tienen resultados |

## Fuera de alcance (requieren backend)

- Persistencia entre dispositivos / respaldo de datos
- Autenticación real (JWT, OAuth) en lugar de PIN
- Exportación de resultados a PDF desde el servidor
