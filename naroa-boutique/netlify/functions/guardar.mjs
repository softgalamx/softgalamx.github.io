// POST /.netlify/functions/guardar — guarda lo que la dueña cambia en el panel.
//   { user, pass, img: { nombre, base64 } }  → sube una foto y devuelve su ruta
//   { user, pass, data }                    → guarda los datos del catálogo
// Revisa usuario y contraseña contra los datos vigentes antes de guardar nada.
import { store, json, leerDatos, cuentaValida } from '../lib/comun.mjs';

export default async (req) => {
  if (req.method !== 'POST') return json({ message: 'Método no permitido' }, 405);
  let b; try { b = await req.json(); } catch { return json({ message: 'Solicitud inválida' }, 400); }
  const actual = await leerDatos(req);
  if (!actual) return json({ message: 'No pude leer los datos de la tienda' }, 500);
  if (!cuentaValida(actual, b.user, b.pass)) return json({ message: 'Contraseña incorrecta' }, 401);

  if (b.img) {
    const nombre = String(b.img.nombre || '');
    if (!/^[\w.-]+\.(jpg|jpeg|png|webp)$/.test(nombre)) return json({ message: 'Nombre de foto inválido' }, 400);
    const bytes = Buffer.from(String(b.img.base64 || ''), 'base64');
    if (!bytes.length || bytes.length > 4 * 1024 * 1024) return json({ message: 'Foto vacía o muy pesada' }, 400);
    await store().set('img/' + nombre, bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
    return json({ path: '/.netlify/functions/img?k=' + encodeURIComponent(nombre) });
  }

  const d = b.data;
  if (!d || typeof d !== 'object' || !Array.isArray(d.products) || !d.store || !d.auth || !d.auth.hash) return json({ message: 'Datos incompletos' }, 400);
  d.updated = new Date().toISOString();
  await store().setJSON('data', d);
  return json({ ok: true, updated: d.updated });
};
