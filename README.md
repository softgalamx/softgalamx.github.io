# Catálogos de boutiques · SoftGala

Cada boutique tiene su propia carpeta y su propia URL basada en su nombre:

```
<baseUrl><slug>/              catálogo público
<baseUrl><slug>/admin.html    panel de la boutique
```

## Estructura

| Ruta | Qué es |
|---|---|
| `tiendas.json` | Registro de boutiques: `id` interno único, `slug` (parte de la URL), `nombre`, `baseUrl`. |
| `plantilla/catalogo.html` | Plantilla del catálogo. `__URL__` se reemplaza por la URL de cada boutique. |
| `plantilla/admin.html` | Plantilla del panel. |
| `plantilla/catalogo-naroa.html` | Diseño propio de Naroa Boutique (se elige con `"plantilla"` en `tiendas.json`). |
| `<slug>/data.json` | Datos de la boutique: tienda (`store.id`, `store.slug`), acceso y prendas. Lo escribe el panel. |
| `<slug>/img/` | Fotos y logotipo de la boutique. |
| `tools/slug.mjs` | Convierte un nombre en URL: quita acentos y símbolos, evita carpetas reservadas y nombres repetidos. |
| `tools/tiendas.mjs` | Crea boutiques y copia la plantilla a todas. |
| `index.html`, `admin.html` (raíz) | Redirigen a `chulas-boutique/` para que los enlaces y QR anteriores sigan funcionando. |

## Comandos

```bash
node tools/test-slug.mjs                                  # pruebas de URL
node tools/tiendas.mjs listar
node tools/tiendas.mjs crear "Nombre de la boutique"      # crea /<slug>/ con usuario y contraseña
node tools/tiendas.mjs sincronizar                        # después de cambiar algo en plantilla/
```

## Reglas

- **URL:** `slugify` quita acentos (`ñ→n`), apóstrofos y símbolos, y une las palabras con guiones. Si el nombre ya existe o coincide con una carpeta, se agrega `-2`, `-3`… El slug se fija al crear la boutique: cambiar el nombre en el panel no cambia la URL, para no romper los QR.
- **Existencia:** el catálogo no muestra una prenda si está suspendida (`active: false`), marcada `status: "agotado"`, o si todas sus tallas están agotadas en `stock`. Si solo algunas tallas están agotadas, la prenda se muestra con esas tallas tachadas.
