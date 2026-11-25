// Publicación del panel de Naroa sin llaves en el celular de la dueña.
// El panel manda usuario + contraseña; esta función los revisa contra data.json del repositorio
// y, si son correctos, guarda los cambios en GitHub con la llave GITHUB_TOKEN que vive solo en Netlify.
// Solo permite leer y escribir dentro de naroa-boutique/ (data.json e imágenes).
import { createHash } from 'node:crypto';

const OWNER = 'softgalamx', REPO = 'softgalamx.github.io', PFX = 'naroa-boutique/';
const ESCRIBIR = /^\/contents\/naroa-boutique\/(data\.json|img\/[\w.-]+\.(jpe?g|png|webp))$/;
const LEER = /^\/contents\/naroa-boutique\/[\w./-]+(\?ref=[\w.-]+)?$/;

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

export default async (req) => {
  if (req.method !== 'POST') return json({ message: 'Método no permitido' }, 405);
  const token = process.env.GITHUB_TOKEN;
  if (!token) return json({ message: 'Falta configurar GITHUB_TOKEN en Netlify' }, 500);

  let b; try { b = await req.json(); } catch { return json({ message: 'Solicitud inválida' }, 400); }
  const path = String(b.path || ''), method = String(b.method || 'GET').toUpperCase();
  if (path.includes('..')) return json({ message: 'Ruta no permitida' }, 403);
  if (method === 'PUT' ? !ESCRIBIR.test(path) : !(method === 'GET' && (path === '' || LEER.test(path)))) return json({ message: 'Ruta no permitida' }, 403);

  const gh = (p, o = {}) => fetch(`https://api.github.com/repos/${OWNER}/${REPO}${p}`, { ...o, headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'softgala-panel' } });

  // Revisar usuario y contraseña contra el data.json publicado
  const r = await gh(`/contents/${PFX}data.json`);
  if (!r.ok) return json({ message: 'No pude leer los datos de la tienda (' + r.status + ')' }, 502);
  const j = await r.json();
  let d; try { d = JSON.parse(Buffer.from(j.content, 'base64').toString('utf8')); } catch { return json({ message: 'Datos de la tienda dañados' }, 500); }
  const cuentas = [d.auth, ...(d.users || [])].filter(Boolean);
  const u = String(b.user || '').trim().toLowerCase();
  const c = cuentas.find((x) => String(x.user).toLowerCase() === u);
  const ok = c && createHash('sha256').update(c.salt + ':' + String(b.pass || '')).digest('hex') === c.hash;
  if (!ok) return json({ message: 'Contraseña incorrecta' }, 401);

  if (path === '') return json({ default_branch: 'main', permissions: { push: true } });
  const res = await gh(path, method === 'PUT' ? { method: 'PUT', body: typeof b.body === 'string' ? b.body : JSON.stringify(b.body || {}) } : {});
  return new Response(await res.text(), { status: res.status, headers: { 'content-type': 'application/json; charset=utf-8' } });
};
