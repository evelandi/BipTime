/**
 * Mantiene viva la base de Supabase.
 *
 * El plan Free pausa un proyecto tras ~7 días sin actividad y lo elimina a los
 * ~90 días de pausado. En julio de 2026 eso borró la base entera de biptime y
 * hubo que reconstruirla. Esta función hace una consulta mínima dos veces por
 * semana para que el proyecto nunca llegue a ese umbral.
 *
 * Se agenda sola: Netlify lee el `config.schedule` de abajo al desplegar.
 * Lunes y jueves a las 06:00 UTC — la separación máxima son 4 días, con margen
 * de sobra frente a los 7 del umbral.
 */

const TABLA = 'races';

export default async () => {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // Si esto aparece en los logs, las variables existen para el build pero no
    // para las funciones: hay que darles scope "Functions" en Netlify.
    const faltan = [!url && 'VITE_SUPABASE_URL', !key && 'VITE_SUPABASE_ANON_KEY']
      .filter(Boolean).join(', ');
    console.error(`keepalive: faltan variables de entorno (${faltan})`);
    return new Response(`Faltan variables: ${faltan}`, { status: 500 });
  }

  // Consulta mínima: un solo id. Lo que importa es que el proyecto registre
  // actividad, no el dato.
  const endpoint = `${url.replace(/\/+$/, '')}/rest/v1/${TABLA}?select=id&limit=1`;

  try {
    const r = await fetch(endpoint, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });

    if (!r.ok) {
      const detalle = await r.text();
      console.error(`keepalive: Supabase respondió ${r.status} — ${detalle.slice(0, 300)}`);
      return new Response(`Supabase respondió ${r.status}`, { status: 502 });
    }

    const filas = await r.json();
    console.log(`keepalive: OK, la base respondió (${filas.length} fila consultada)`);
    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('keepalive: no se pudo alcanzar Supabase —', err);
    return new Response('No se pudo alcanzar Supabase', { status: 502 });
  }
};

export const config = {
  schedule: '0 6 * * 1,4',
};
