// Utilidades compartidas: datos de la tienda guardados en Netlify Blobs (sin GitHub ni llaves).
import { getStore } from '@netlify/blobs';
import { createHash } from 'node:crypto';

export const store = () => getStore({ name: 'naroa', consistency: 'strong' });
export const json = (o, status = 200, extra = {}) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra } });

// Datos vigentes: lo guardado desde el panel; si aún no hay, el data.json publicado con el sitio.
export async function leerDatos(req) {
  const d = await store().get('data', { type: 'json' });
  if (d) return d;
  const r = await fetch(new URL('/data.json', req.url), { cache: 'no-store' });
  return r.ok ? r.json() : null;
}

export function cuentaValida(d, user, pass) {
  const u = String(user || '').trim().toLowerCase();
  const c = [d.auth, ...(d.users || [])].filter(Boolean).find((x) => String(x.user).toLowerCase() === u);
  return !!c && createHash('sha256').update(c.salt + ':' + String(pass || '')).digest('hex') === c.hash;
}
