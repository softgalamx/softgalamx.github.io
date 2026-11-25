// GET /.netlify/functions/datos → datos actuales del catálogo (los del panel, o los publicados).
import { leerDatos, json } from '../lib/comun.mjs';
export default async (req) => {
  const d = await leerDatos(req);
  return d ? json(d) : json({ message: 'Sin datos' }, 404);
};
