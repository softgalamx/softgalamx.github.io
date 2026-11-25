#!/usr/bin/env node
// Genera plantilla/admin-naroa.html a partir de plantilla/admin.html con el diseño de Naroa Boutique:
// negro, marfil, vino y dorado, constelación interactiva y estrellas ✦ en lugar de corazones.
// Mismas funciones que el panel general (login con ojito, suspender, editar prendas, tienda, publicar).
//   node tools/tema-naroa.mjs && node tools/tiendas.mjs sincronizar
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
let h = readFileSync(join(RAIZ, 'plantilla/admin.html'), 'utf8');

function cambiar(viejo, nuevo, todos = false) {
  if (!h.includes(viejo)) throw new Error('No encontré en admin.html: ' + viejo.slice(0, 80));
  h = todos ? h.split(viejo).join(nuevo) : h.replace(viejo, nuevo);
}

// Paleta y tipografía
cambiar(':root{--choc:#3B2218;--choc2:#2A1710;--choc3:#4E3126;--red:#A3212A;--red2:#C7353B;--rose:#F2A7A9;--cream:#FBF6F1;--blush:#F4E4DE;--soft:#6B4A3D;--line:#EADBD2;--white:#FFFDFB;--green:#1F7A45;--amber:#8A4B00;--gold:#C9A46A}',
  ':root{--choc:#17130F;--choc2:#0A0808;--choc3:#2A2320;--red:#7A1F2B;--red2:#A8384A;--rose:#E6C483;--cream:#F7F2EC;--blush:#EFE5D9;--soft:#6F6560;--line:#E4D9CC;--white:#FFFDF9;--green:#1F6B3D;--amber:#8A5A0B;--gold:#C9A35A}');
cambiar('family=Playfair+Display:ital,wght@0,600;0,700;1,500&family=DM+Sans:wght@400;500;700',
  'family=Marcellus&family=Cormorant+Garamond:ital,wght@1,500;1,600&family=Manrope:wght@400;500;600;700');
cambiar("'Playfair Display'", "'Marcellus'", true);
cambiar("'DM Sans'", "'Manrope'", true);

// Estrellas en lugar de corazones
cambiar("(sp ? '✦' : '♥')", "(sp ? '✦' : '✧')");
cambiar('<span class="ht h1">♥</span><span class="ht h2">♥</span><span class="ht h3">♥</span>', '<span class="ht h1">✦</span><span class="ht h2">✧</span><span class="ht h3">✦</span>');

// Pantalla de acceso
cambiar('<div class="glow3"></div><div class="floaters" id="floaters"></div>',
  '<canvas class="cst" aria-hidden="true"></canvas><div class="glow3"></div><div class="floaters" id="floaters"></div>');
cambiar('<h1>Tu boutique,<br><i>siempre al día</i></h1>', '<img class="wordmark" src="img/logo-naroa-blanco.png" alt="NAROA Boutique">\n      <h1>Tu colección,<br><i>con intención</i></h1>');
cambiar('<p>Edita prendas, precios y tallas, suspende lo que se agotó y publica tu catálogo en segundos.</p>',
  '<p>Edita prendas, precios, tallas y existencias. Suspende lo que se agotó y publica tu catálogo en segundos.</p>');
cambiar('<h2>¡Hola de nuevo!</h2>', '<span class="kicker">✦ Panel privado</span><h2>Bienvenida de nuevo</h2>');

// Bienvenida dentro del panel
cambiar('<section class="hero" aria-label="Bienvenida"><div class="glow3"></div>', '<section class="hero" aria-label="Bienvenida"><canvas class="cst" aria-hidden="true"></canvas><div class="glow3"></div>');


// En Naroa las prendas agotadas siguen visibles en el catálogo con la etiqueta "Agotado"
cambiar('Si la marcas <b>Agotado</b> o todas sus tallas están agotadas, la prenda deja de aparecer en el catálogo hasta que vuelva a haber.', 'Si la marcas <b>Agotado</b> o todas sus tallas están agotadas, en el catálogo aparece en gris con la etiqueta <b>Agotado</b> y no se puede añadir al carrito. Para que no se vea, usa <b>Suspender</b>.');
cambiar('title="Si la marcas agotada, deja de aparecer en el catálogo"', 'title="Si la marcas agotada, se ve en el catálogo como Agotado"');
cambiar("'” agotada: ya no aparecerá en el catálogo'", "'” agotada: se verá como Agotado en el catálogo'");

// Publicación automática desde Netlify: sin llave en cada aparato y al instante al marcar Agotado/Suspender
cambiar("CUR = acc; SS.set(AUTH_KEY, acc.user);", "CUR = acc; window.__pw = p; try { sessionStorage.setItem('nb_pw', p); } catch (e2) {} SS.set(AUTH_KEY, acc.user);");
cambiar("$('#logout').addEventListener('click', function(){", "$('#logout').addEventListener('click', function(){ try { sessionStorage.removeItem('nb_pw'); } catch (e2) {}");
cambiar("$('#pubBtn').addEventListener('click', function(){", `// ---- Modo Netlify (Naroa) ----
var NETLIFY = /\\.netlify\\.app$/.test(location.hostname);
function clave(){ var p = window.__pw; try { p = p || sessionStorage.getItem('nb_pw'); } catch (e2) {}
  if (!p) { p = window.prompt('Escribe tu contraseña del panel para guardar los cambios en el catálogo'); if (p) { window.__pw = p; try { sessionStorage.setItem('nb_pw', p); } catch (e2) {} } } return p || ''; }
var _getConn = getConn; getConn = function(){ var c = _getConn(); if ((!c || !c.token) && NETLIFY) return { owner:'softgalamx', repo:'softgalamx.github.io', branch:'main', token:'__netlify__' }; return c; };
var _gh = gh; gh = function(c, path, opt){ if (c.token !== '__netlify__') return _gh(c, path, opt); opt = opt || {};
  return fetch('/.netlify/functions/gh', { method:'POST', headers:{ 'content-type':'application/json' }, body: JSON.stringify({ path: path, method: opt.method || 'GET', body: opt.body, user: CUR ? CUR.user : '', pass: clave() }) })
    .then(function(r){ if (r.status === 401) { window.__pw = null; try { sessionStorage.removeItem('nb_pw'); } catch (e2) {} } return r; }); };
var _fillConn = fillConn; fillConn = function(){ _fillConn(); if (NETLIFY && !(_getConn() || {}).token) { $('#connState').className = 'okmsg'; $('#connState').textContent = 'Publicación automática activada: los cambios se guardan en el catálogo con tu usuario y contraseña. No necesitas llave.'; } };
var _modal = modal; modal = function(t, x, a){ if (window.__quietPub) { if (/^Publicando/.test(t)) { toast('Actualizando catálogo…'); return; } if (/^¡Publicado/.test(t)) { window.__quietPub = false; toast('Listo: ya se ve en el catálogo ✓'); return; } window.__quietPub = false; } return _modal(t, x, a); };
var autoT = null; function autoPub(){ if (!NETLIFY) return; clearTimeout(autoT); autoT = setTimeout(function(){ if (!dirty) return; window.__quietPub = true; $('#pubBtn').click(); }, 1200); }
$('#pubBtn').addEventListener('click', function(){`);
cambiar("toast(p.active ? '“' + p.name + '” vuelve a estar visible' : '“' + p.name + '” suspendida');", "toast(p.active ? '“' + p.name + '” vuelve a estar visible' : '“' + p.name + '” suspendida'); autoPub();");
cambiar("'” agotada: se verá como Agotado en el catálogo'); var nb2", "'” agotada: se verá como Agotado en el catálogo'); autoPub(); var nb2");

const css = `
/* ===== Tema Naroa ===== */
body{background:var(--cream)}
h1 i,h2 i{font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;color:var(--rose)!important;font-weight:600}
.lg-art,.hero{background:radial-gradient(80% 70% at 75% 15%,#3a0d18 0%,#120609 45%,#050405 85%)!important}
.lg-art::before,.hero::before{background:radial-gradient(circle,rgba(122,31,43,.55),rgba(122,31,43,0) 65%)!important}
.lg-art::after,.hero::after{background:radial-gradient(circle,rgba(201,163,90,.28),rgba(201,163,90,0) 65%)!important}
.glow3{background:radial-gradient(circle,rgba(230,196,131,.16),rgba(230,196,131,0) 65%)!important}
.floaters span{color:rgba(230,196,131,.5)!important}.floaters span.sp{color:rgba(230,196,131,.9)!important}
.cst{position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none}
.lg-art>*:not(.cst):not(.glow3):not(.floaters),.hero>*:not(.cst):not(.glow3):not(.floaters){position:relative;z-index:1}
.lg-top span{color:var(--rose)!important;letter-spacing:.32em}
.lg-badge{box-shadow:0 0 0 2px rgba(230,196,131,.7),0 0 0 8px rgba(230,196,131,.12)!important}
.wordmark{display:block;width:min(420px,90%);margin:0 0 18px;filter:drop-shadow(0 6px 24px rgba(0,0,0,.6))}
.lg-copy h1{color:#F7F2EC}
.fan figure{border-color:#F7F2EC!important;border-radius:4px!important;box-shadow:0 30px 60px rgba(0,0,0,.6),0 0 0 1px rgba(230,196,131,.4)!important}
.card-login{border-top:3px solid var(--gold)!important}
.kicker{display:inline-block;font-size:12px;font-weight:700;letter-spacing:.28em;text-transform:uppercase;color:var(--red);margin-bottom:8px}
.lg-form::before{background:radial-gradient(circle,rgba(201,163,90,.28),rgba(201,163,90,0) 65%)!important}
.lg-form::after{background:radial-gradient(circle,rgba(122,31,43,.18),rgba(122,31,43,0) 65%)!important}
.btn-red{background:linear-gradient(135deg,#7A1F2B,#4A1019)!important;box-shadow:0 10px 26px rgba(74,16,25,.35),inset 0 0 0 1px rgba(230,196,131,.35)!important;letter-spacing:.02em}
.btn-red:hover{background:linear-gradient(135deg,#8E2533,#5A1420)!important;box-shadow:0 12px 30px rgba(74,16,25,.45),inset 0 0 0 1px rgba(230,196,131,.7)!important}
.side{background:#0A0808!important;border-right:1px solid rgba(230,196,131,.18)}
.side .nav[aria-current="page"]{background:linear-gradient(135deg,#7A1F2B,#3A0D18)!important;box-shadow:inset 0 0 0 1px rgba(230,196,131,.45)!important;color:#fff!important}
.side .nav[aria-current="page"] svg{color:var(--rose)}
.hlogo .ring{border-color:rgba(230,196,131,.55)!important}
.ht{color:var(--rose)!important}
.pc{border-radius:16px!important}
.pc:hover{box-shadow:0 18px 40px rgba(23,19,15,.14),0 0 0 1px rgba(201,163,90,.55)!important}
::selection{background:#E6C483;color:#17130F}
:focus-visible{outline-color:var(--gold)!important}
`;
cambiar('</style>', css + '</style>');

const js = `
<script>
/* Tema Naroa: constelación dorada que sigue el mouse o el dedo; un toque lanza una onda de luz */
(function(){
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  Array.prototype.forEach.call(document.querySelectorAll('canvas.cst'), function(cv){
    var box = cv.parentElement, cx = cv.getContext('2d'), dpr = Math.min(2, window.devicePixelRatio || 1);
    var W = 0, H = 0, P = [], R = [], ptr = { x: -999, y: -999, on: false }, vis = true;
    function size(){ var r = cv.getBoundingClientRect(); if (!r.width) return; W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.max(30, Math.min(110, Math.round(W * H / 9000)));
      P = []; for (var i = 0; i < n; i++) P.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3, r: Math.random() * 1.5 + .5, f: 0, g: Math.random() < .25 }); }
    if (window.ResizeObserver) new ResizeObserver(size).observe(cv); size();
    if (window.IntersectionObserver) new IntersectionObserver(function(es){ vis = es[0].isIntersecting; }).observe(cv);
    function loc(e){ var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    box.addEventListener('pointermove', function(e){ var l = loc(e); ptr = { x: l.x, y: l.y, on: true }; });
    box.addEventListener('pointerleave', function(){ ptr.on = false; });
    box.addEventListener('pointerdown', function(e){ if (e.target.closest('button,a,input,label')) return; var l = loc(e); R.push({ x: l.x, y: l.y, t: 0 });
      P.forEach(function(p){ var dx = p.x - l.x, dy = p.y - l.y, d = Math.hypot(dx, dy) || 1; if (d < 200) { var f = (200 - d) / 200 * 3.5; p.vx += dx / d * f; p.vy += dy / d * f; p.f = 1; } }); });
    function step(t){
      if (vis && !document.hidden && W) {
        cx.clearRect(0, 0, W, H); var L = Math.min(130, W / 5);
        P.forEach(function(p){ if (ptr.on) { var dx = ptr.x - p.x, dy = ptr.y - p.y, d = Math.hypot(dx, dy); if (d < 170 && d > 1) { p.vx += dx / d * .035; p.vy += dy / d * .035; } }
          p.vx *= .985; p.vy *= .985; if (Math.hypot(p.vx, p.vy) < .1) { p.vx += (Math.random() - .5) * .04; p.vy += (Math.random() - .5) * .04; }
          p.x += p.vx; p.y += p.vy; if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10; if (p.y < -10) p.y = H + 10; if (p.y > H + 10) p.y = -10; p.f *= .96; });
        cx.lineWidth = .7;
        for (var i = 0; i < P.length; i++) { var a = P[i];
          for (var j = i + 1; j < P.length; j++) { var b = P[j], d = Math.hypot(a.x - b.x, a.y - b.y); if (d < L) { cx.strokeStyle = 'rgba(230,196,131,' + ((1 - d / L) * .22 + (a.f + b.f) * .15) + ')'; cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y); cx.stroke(); } }
          if (ptr.on) { var dp = Math.hypot(a.x - ptr.x, a.y - ptr.y); if (dp < 160) { cx.strokeStyle = 'rgba(255,230,205,' + ((1 - dp / 160) * .4) + ')'; cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(ptr.x, ptr.y); cx.stroke(); } } }
        P.forEach(function(p){ cx.fillStyle = p.g ? 'rgba(230,196,131,' + (.75 + p.f * .25) + ')' : 'rgba(255,240,228,' + (.5 + p.f * .5) + ')'; cx.beginPath(); cx.arc(p.x, p.y, p.r + p.f * 2, 0, 6.283); cx.fill(); });
        R = R.filter(function(r){ return r.t < 1; });
        R.forEach(function(r){ r.t += .02; var rad = r.t * Math.max(W, H) * .45; cx.strokeStyle = 'rgba(230,196,131,' + ((1 - r.t) * .6) + ')'; cx.lineWidth = 2 * (1 - r.t) + .5; cx.beginPath(); cx.arc(r.x, r.y, rad, 0, 6.283); cx.stroke(); });
      }
      if (!RM) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
})();
</script>
`;
cambiar('</body>', js + '</body>');

writeFileSync(join(RAIZ, 'plantilla/admin-naroa.html'), h);
console.log('Listo: plantilla/admin-naroa.html');
