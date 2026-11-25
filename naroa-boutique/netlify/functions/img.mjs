// GET /.netlify/functions/img?k=<nombre> → foto subida desde el panel.
import { store } from '../lib/comun.mjs';
export default async (req) => {
  const k = new URL(req.url).searchParams.get('k') || '';
  if (!/^[\w.-]+\.(jpg|jpeg|png|webp)$/.test(k)) return new Response('No encontrada', { status: 404 });
  const b = await store().get('img/' + k, { type: 'arrayBuffer' });
  if (!b) return new Response('No encontrada', { status: 404 });
  const tipo = k.endsWith('.png') ? 'image/png' : k.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
  return new Response(b, { headers: { 'content-type': tipo, 'cache-control': 'public, max-age=31536000, immutable' } });
};
