#!/usr/bin/env node
// Administra las boutiques del repositorio. Cada boutique vive en su carpeta /<slug>/ y se publica en
// <baseUrl><slug>/ . El registro está en tiendas.json.
//
//   node tools/tiendas.mjs listar
//   node tools/tiendas.mjs crear "Nombre de la boutique" [--usuario admin] [--password ...]
//   node tools/tiendas.mjs sincronizar        (copia plantilla/ a todas las boutiques)
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { createHash, randomBytes } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { slugUnico } from './slug.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const REGISTRO = join(RAIZ, 'tiendas.json');

const leer = (f) => JSON.parse(readFileSync(f, 'utf8'));
const escribir = (f, o) => writeFileSync(f, JSON.stringify(o, null, 1) + '\n');

function registro() { return existsSync(REGISTRO) ? leer(REGISTRO) : { baseUrl: '', tiendas: [] }; }

// Carpetas que ya existen en la raíz también cuentan como ocupadas.
function ocupados(reg) {
  const dirs = readdirSync(RAIZ).filter((d) => !d.startsWith('.') && statSync(join(RAIZ, d)).isDirectory());
  return new Set([...reg.tiendas.map((t) => t.slug), ...dirs]);
}

function generarArchivos(reg, t) {
  const dir = join(RAIZ, t.slug);
  // t.url permite que una boutique tenga su propio dominio (ej. Netlify publica la carpeta en la raíz).
  const url = t.url || ((reg.baseUrl || '') + t.slug + '/');
  // t.plantilla permite que una boutique use un diseño de catálogo propio (ej. "catalogo-naroa.html").
  const catalogo = readFileSync(join(RAIZ, 'plantilla', t.plantilla || 'catalogo.html'), 'utf8').replaceAll('__URL__', url);
  writeFileSync(join(dir, 'index.html'), catalogo);
  writeFileSync(join(dir, 'admin.html'), readFileSync(join(RAIZ, 'plantilla/admin.html'), 'utf8'));
  // El id y el slug de data.json siempre deben coincidir con el registro.
  const df = join(dir, 'data.json');
  if (existsSync(df)) {
    const d = leer(df);
    if (d.store.id !== t.id || d.store.slug !== t.slug) { d.store.id = t.id; d.store.slug = t.slug; escribir(df, d); }
  }
}

function crear(nombre, opts) {
  if (!nombre) throw new Error('Falta el nombre: node tools/tiendas.mjs crear "Nombre de la boutique"');
  const reg = registro();
  const id = 't_' + randomBytes(4).toString('hex');
  const slug = slugUnico(nombre, ocupados(reg));
  const usuario = (opts.usuario || 'admin').toLowerCase();
  const password = opts.password || randomBytes(6).toString('base64url');
  const salt = randomBytes(8).toString('hex');
  const dir = join(RAIZ, slug);
  mkdirSync(join(dir, 'img'), { recursive: true });
  escribir(join(dir, 'data.json'), {
    updated: new Date().toISOString(),
    auth: { user: usuario, salt, hash: createHash('sha256').update(salt + ':' + password).digest('hex') },
    store: { id, slug, name: nombre, slogan: '', notice: '', showNotice: false, whatsapp: '', phone: '', email: '', address: '', hours: '', instagram: '', facebook: '', logo: '' },
    sizeChart: leer(join(RAIZ, 'chulas-boutique/data.json')).sizeChart || [],
    products: [],
  });
  const t = { id, slug, nombre, creada: new Date().toISOString().slice(0, 10) };
  reg.tiendas.push(t);
  escribir(REGISTRO, reg);
  generarArchivos(reg, t);
  console.log(`Boutique creada: ${nombre}\n  id:       ${id}\n  URL:      ${(reg.baseUrl || '') + slug}/\n  Panel:    ${(reg.baseUrl || '') + slug}/admin.html\n  Usuario:  ${usuario}\n  Password: ${password}`);
}

function sincronizar() {
  const reg = registro();
  reg.tiendas.forEach((t) => generarArchivos(reg, t));
  console.log(`Plantilla copiada a ${reg.tiendas.length} boutique(s).`);
}

const [cmd, ...args] = process.argv.slice(2);
const opts = {}; const pos = [];
for (let i = 0; i < args.length; i++) { if (args[i].startsWith('--')) opts[args[i].slice(2)] = args[++i]; else pos.push(args[i]); }
if (cmd === 'crear') crear(pos.join(' '), opts);
else if (cmd === 'sincronizar') sincronizar();
else if (cmd === 'listar') registro().tiendas.forEach((t) => console.log(`${t.slug}\t${t.id}\t${t.nombre}`));
else console.log('Uso: node tools/tiendas.mjs [listar | crear "Nombre" | sincronizar]');
