# Guía SEO para ContaPY — Posicionamiento en Google para consultas de RUC

## Objetivo
Aparecer en los primeros resultados cuando alguien en Paraguay busca:
- "consulta ruc paraguay"
- "buscar ruc paraguay"
- "ruc contribuyente paraguay"
- "rg 52 2026 dnit"
- "obligados facturación electrónica paraguay"
- "ekuatia obligatorio mi empresa"

---

## 1. Lo que ya está implementado en el código

### Meta tags optimizados
El `<title>` ahora es: **"Consulta RUC Paraguay | Buscar Contribuyente por RUC o Nombre - ContaPY"**
- Incluye las palabras clave exactas que la gente busca
- Tiene el nombre del país (Paraguay) que es crítico para búsquedas locales

### Schema.org (datos estructurados)
Se incluyeron 3 tipos de schema en el HTML:

1. **WebSite + SearchAction** → habilita que Google muestre una caja de búsqueda directamente en el resultado de Google (sitelinks search box). Cuando alguien busca "ContaPY", puede buscar un RUC sin ni siquiera entrar a la web.

2. **AccountingService (LocalBusiness)** → deja en claro a Google que es un estudio contable en Paraguay, con dirección y teléfono. Mejora el posicionamiento local.

3. **FAQPage** → Google puede mostrar directamente las preguntas y respuestas en los resultados (rich snippets), sin que el usuario entre a la web — pero generando clicks de quienes sí quieren más info.

### URL con parámetro ?ruc=
La URL `https://www.contapy.com.py/?ruc=4161473` pre-carga y ejecuta la búsqueda automáticamente. Esto sirve para:
- Links en redes sociales
- Links en campañas de email
- Que Google indexe páginas específicas por RUC

---

## 2. Registro en Google Search Console (GRATIS, obligatorio)

1. Ir a **https://search.google.com/search-console**
2. Añadir propiedad: `www.contapy.com.py`
3. Verificar con el método HTML tag (añadir `<meta name="google-site-verification" content="XXXX">` en el `<head>`)
4. Subir el sitemap (ver paso 4)
5. Solicitar indexación de la URL principal

**Sin Search Console, Google puede tardar semanas en indexar el sitio. Con Search Console, puede ser en 24-48 horas.**

---

## 3. Crear sitemap.xml

Crear el archivo `sitemap.xml` en la raíz del sitio:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.contapy.com.py/</loc>
    <lastmod>2026-06-26</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.contapy.com.py/#rg52</loc>
    <lastmod>2026-06-26</lastmod>
    <priority>0.9</priority>
  </url>
</urlset>
```

Y añadir en el `<head>` del HTML:
```html
<link rel="sitemap" type="application/xml" href="/sitemap.xml">
```

---

## 4. robots.txt

Crear `robots.txt` en la raíz:

```
User-agent: *
Allow: /
Sitemap: https://www.contapy.com.py/sitemap.xml
```

---

## 5. Estrategia de contenido — páginas adicionales (alto impacto)

El sitio actual es una sola página (SPA). Para SEO avanzado, conviene crear páginas separadas:

### Páginas prioritarias a crear:

| URL sugerida | Palabra clave objetivo | Contenido |
|---|---|---|
| `/consulta-ruc/` | "consulta ruc paraguay" | Herramienta de búsqueda, explicación de qué es el RUC, cómo obtenerlo |
| `/rg-52-2026/` | "rg 52 2026 dnit facturacion electronica" | Resumen de la resolución, grupos y fechas, verificador embebido |
| `/ekuatia-obligatorio/` | "ekuatia obligatorio mi empresa" | Quiénes están obligados, cómo implementarlo |
| `/servicios-contables-paraguay/` | "contador paraguay precio" | Servicios, diferenciadores, testimonios |
| `/blog/` | Palabras long-tail (cola larga) | Ver sección 6 |

---

## 6. Blog / artículos (muy efectivo a mediano plazo)

Google premia los sitios que publican contenido útil y actualizado. Cada artículo del blog es una oportunidad de aparecer en nuevas búsquedas.

### Artículos sugeridos (publicar uno por semana):

1. **"¿Qué es el RUC en Paraguay y cómo obtenerlo?"**
   - Búsqueda objetivo: "qué es el ruc paraguay", "sacar ruc paraguay"

2. **"RG DNIT 52/2026: todo lo que necesitás saber sobre los grupos 19 al 24"**
   - Búsqueda objetivo: "rg 52 2026", "grupos ekuatia 2026 2027"

3. **"Cómo implementar facturación electrónica (e-Kuatia) paso a paso"**
   - Búsqueda objetivo: "como implementar ekuatia paraguay", "facturacion electronica paso a paso paraguay"

4. **"Diferencias entre IRE SIMPLE, RESIMPLE e IVA en Paraguay"**
   - Búsqueda objetivo: "ire simple paraguay", "resimple que es"

5. **"Calendario de vencimientos tributarios [AÑO] — DNIT Paraguay"**
   - Actualizar cada año. Altísimo volumen de búsqueda.

6. **"Cómo verificar si mi RUC está habilitado en la DNIT"**
   - Búsqueda objetivo: "verificar ruc paraguay", "ruc habilitado dnit"

---

## 7. Google Business Profile (para búsquedas locales)

Registrar en **https://business.google.com**:
- Categoría: "Contador" / "Estudio contable"
- Nombre: ContaPY Estudio Contable
- Zona: Asunción, Paraguay
- Teléfono: +595 974 461 453
- Web: www.contapy.com.py

Esto hace que aparezca en el **mapa de Google** y en el panel lateral cuando alguien busca "contador en Asunción" o "estudio contable paraguay".

---

## 8. Velocidad del sitio (Core Web Vitals)

Google penaliza los sitios lentos. Optimizaciones que ya están aplicadas:
- ✅ Google Fonts con `preconnect`
- ✅ Sin imágenes pesadas (todo en CSS/SVG)

Optimizaciones pendientes:
- Comprimir el archivo `rg52_lookup.js` (127 KB) con gzip en el servidor — reduce a ~30 KB
- Añadir `<link rel="preload" as="script" href="rg52_lookup.js">` en el `<head>`
- Configurar el servidor para cachear archivos estáticos (CSS, JS) durante 30 días

Para medir: **https://pagespeed.web.dev** — apuntar a un score ≥ 90 en móvil.

---

## 9. Links externos (backlinks)

Google también mide cuántos sitios respetables enlazan a tu web. Acciones concretas:

- **Directorios de contadores paraguayos**: registrarse en directorios locales
- **Redes sociales**: publicar en LinkedIn, Facebook e Instagram con links a la web — especialmente cuando salga una nueva resolución de la DNIT
- **WhatsApp**: compartir el verificador de RG 52/2026 en grupos de contadores, empresarios, cámaras de comercio
- **Colaboraciones**: mencionar en posts de otros contadores (y pedir mención a cambio)

---

## 10. Checklist de lanzamiento

- [ ] Subir los 4 archivos al hosting: `index.html`, `style.css`, `script.js`, `rg52_lookup.js`
- [ ] Crear y subir `sitemap.xml` y `robots.txt`
- [ ] Registrar y verificar en Google Search Console
- [ ] Solicitar indexación de la URL principal en Search Console
- [ ] Registrar en Google Business Profile
- [ ] Publicar en redes sociales anunciando el verificador de RG 52/2026
- [ ] Compartir el link en grupos de WhatsApp de contribuyentes y contadores

---

## Resumen: ¿cuándo apareceré en Google?

| Acción | Tiempo estimado |
|---|---|
| Search Console + indexación manual | 1-3 días |
| Posicionamiento para "rg 52 2026 dnit" (poca competencia) | 1-4 semanas |
| Posicionamiento para "consulta ruc paraguay" (alta competencia) | 2-6 meses con contenido |
| Aparecer antes que ruc.com.py | Requiere blog activo + backlinks (6-12 meses) |

La ventaja competitiva de ContaPY es que combina la consulta de RUC gratuita **con** la herramienta de verificación de RG 52/2026 **y** los servicios contables. Ningún otro sitio en Paraguay tiene esa combinación hoy.
