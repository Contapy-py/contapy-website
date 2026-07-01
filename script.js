/* ===========================
   SUPABASE CONFIG
   =========================== */
const SUPA_URL = "https://obyfvkpycyjokzanayly.supabase.co";
const SUPA_KEY = "sb_publishable_KqthDX95Et-dhyL4KbR0XQ_7oswYb0P";

async function supaFetch(endpoint) {
  const r = await fetch(`${SUPA_URL}/rest/v1/${endpoint}`, {
    headers: {
      "apikey": SUPA_KEY,
      "Authorization": `Bearer ${SUPA_KEY}`,
      "Content-Type": "application/json"
    }
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

/* ===========================
   NOVEDADES TABS
   =========================== */
function switchNovTab(tab, btnEl) {
  document.querySelectorAll(".nov-tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".nov-panel").forEach(p => p.classList.remove("active"));
  btnEl.classList.add("active");
  document.getElementById(`nov-${tab}`).classList.add("active");
}

/* ===========================
   SEARCH TABS (RUC / Nombre)
   =========================== */
function switchTab(tab) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".search-panel").forEach(p => p.classList.add("hidden"));
  document.querySelector(`[data-tab="${tab}"]`).classList.add("active");
  document.getElementById(`panel-${tab}`).classList.remove("hidden");
  document.getElementById("resultado").className = "resultado hidden";
}

/* ===========================
   HELPERS
   =========================== */
function mostrarLoading() {
  const r = document.getElementById("resultado");
  r.className = "resultado loading";
  r.innerHTML = "<p>🔎 Buscando en la base de datos de contribuyentes...</p>";
}

function mostrarError(msg) {
  const r = document.getElementById("resultado");
  r.className = "resultado error";
  r.innerHTML = `<p>⚠️ ${msg}</p>`;
}

/* ===========================
   BÚSQUEDA POR RUC
   =========================== */
async function buscarRUC() {
  const raw = document.getElementById("input-ruc").value.trim();
  if (!raw) { mostrarError("Ingresá un número de RUC para buscar."); return; }

  // Extraer solo la parte numérica (ignorar DV si lo escribieron con guión)
  const rucNum = raw.split("-")[0].replace(/\D/g, "");
  if (!rucNum) { mostrarError("El RUC debe contener números."); return; }

  mostrarLoading();

  try {
    const data = await supaFetch(
      `contribuyentes?ruc=eq.${rucNum}&select=ruc,razon_social,dv,situacion&limit=1`
    );

    if (!data || data.length === 0) {
      mostrarError(`No se encontró el RUC <strong>${rucNum}</strong> en la base de datos de la DNIT.`);
      return;
    }

    renderContribuyente(data[0]);

  } catch (e) {
    mostrarError("No se pudo conectar con la base de datos. Intentá de nuevo en unos segundos.");
    console.error(e);
  }
}

/* ===========================
   BÚSQUEDA POR NOMBRE
   =========================== */
async function buscarNombre() {
  const nombre = document.getElementById("input-nombre").value.trim();
  if (nombre.length < 3) {
    mostrarError("Ingresá al menos 3 caracteres para buscar.");
    return;
  }

  mostrarLoading();

  try {
    // ilike para búsqueda parcial insensible a mayúsculas
    const encoded = encodeURIComponent(`%${nombre}%`);
    const data = await supaFetch(
      `contribuyentes?razon_social=ilike.${encoded}&select=ruc,razon_social,dv,situacion&order=situacion.asc,razon_social.asc&limit=30`
    );

    if (!data || data.length === 0) {
      mostrarError(`No se encontraron contribuyentes con "<strong>${nombre}</strong>".`);
      return;
    }

    renderLista(data);

  } catch (e) {
    mostrarError("No se pudo conectar con la base de datos. Intentá de nuevo.");
    console.error(e);
  }
}

/* ===========================
   RENDER RESULTADO ÚNICO
   =========================== */
function renderContribuyente(c) {
  const r = document.getElementById("resultado");
  r.className = "resultado success";

  const sit = (c.situacion || "").toUpperCase();
  let badgeClass = "activo";
  if (sit === "CANCELADO" || sit === "CANCELADO DEFINITIVO") badgeClass = "inactivo";
  else if (sit === "SUSPENSION TEMPORAL") badgeClass = "suspendido";
  else if (sit === "BLOQUEADO") badgeClass = "suspendido";

  const rucCompleto = c.dv !== null && c.dv !== undefined
    ? `${c.ruc}-${c.dv}`
    : `${c.ruc}`;

  // Verificar si está en RG 52/2026
  const rg52 = typeof RG52_LOOKUP !== "undefined" ? RG52_LOOKUP[String(c.ruc)] : null;
  const rg52html = rg52
    ? `<tr>
        <td>e-Kuatia</td>
        <td>
          <span class="result-badge" style="background:#fff3cd;color:#92400e">
            ⚠️ Obligatorio desde ${rg52.f} — Grupo ${rg52.g} (RG 52/2026)
          </span>
        </td>
       </tr>`
    : "";

  r.innerHTML = `
    <table class="result-table">
      <tr><td>RUC</td><td><strong>${rucCompleto}</strong></td></tr>
      <tr><td>Razón social</td><td><strong>${c.razon_social}</strong></td></tr>
      <tr><td>Estado</td><td><span class="result-badge ${badgeClass}">${c.situacion}</span></td></tr>
      ${rg52html}
    </table>
    ${rg52 ? `<p style="font-size:.82rem;color:var(--gray-500);margin-top:.8rem">
      Este contribuyente está obligado a facturar electrónicamente.
      <a href="#rg52" style="color:var(--green)">Ver más sobre la RG 52/2026 →</a>
    </p>` : ""}
  `;
}

/* ===========================
   RENDER LISTA DE RESULTADOS
   =========================== */
function renderLista(items) {
  const r = document.getElementById("resultado");
  r.className = "resultado success";

  const liItems = items.map(c => {
    const sit = (c.situacion || "").toUpperCase();
    let badgeClass = "activo";
    if (sit === "CANCELADO" || sit === "CANCELADO DEFINITIVO") badgeClass = "inactivo";
    else if (sit === "SUSPENSION TEMPORAL" || sit === "BLOQUEADO") badgeClass = "suspendido";
    const rucCompleto = c.dv !== null && c.dv !== undefined ? `${c.ruc}-${c.dv}` : `${c.ruc}`;
    return `
      <li onclick="mostrarDetalle(${c.ruc})">
        <strong>${c.razon_social}</strong>
        <span>RUC: ${rucCompleto} · <span class="result-badge ${badgeClass}" style="font-size:.75rem;padding:2px 8px">${c.situacion}</span></span>
      </li>`;
  }).join("");

  r.innerHTML = `
    <p style="font-size:.85rem;color:var(--gray-500);margin-bottom:.8rem">
      Se encontraron <strong>${items.length}</strong> resultado(s)${items.length === 30 ? " (mostrando los primeros 30)" : ""}. Hacé clic para ver detalles.
    </p>
    <ul class="result-list">${liItems}</ul>
  `;
}

async function mostrarDetalle(ruc) {
  mostrarLoading();
  try {
    const data = await supaFetch(
      `contribuyentes?ruc=eq.${ruc}&select=ruc,razon_social,dv,situacion&limit=1`
    );
    if (data && data.length > 0) renderContribuyente(data[0]);
  } catch (e) {
    mostrarError("No se pudo cargar el detalle.");
  }
}

/* ===========================
   RG 52/2026 VERIFICADOR
   =========================== */
function verificarRG52() {
  const raw = document.getElementById("rg52-input").value.trim().replace(/\D/g, "");
  const el  = document.getElementById("rg52-resultado");

  if (!raw) {
    el.className = "rg52-resultado error";
    el.innerHTML = "⚠️ Ingresá un número de RUC sin dígito verificador.";
    return;
  }

  const entry = typeof RG52_LOOKUP !== "undefined" ? RG52_LOOKUP[raw] : null;
  el.className = "rg52-resultado";

  if (entry) {
    const grupoInfo = RG52_GRUPOS[entry.g];
    const hoy = new Date();
    const [d, m, y] = entry.f.split("/");
    const fechaObl = new Date(y, m - 1, d);
    const diasRestantes = Math.ceil((fechaObl - hoy) / (1000 * 60 * 60 * 24));
    let urgencia = "";

    if (diasRestantes < 0) {
      urgencia = `<span class="rg52-urgente urgente-vencido">⛔ Fecha ya vencida — ${Math.abs(diasRestantes)} días de atraso</span>`;
    } else if (diasRestantes <= 30) {
      urgencia = `<span class="rg52-urgente urgente-critico">🚨 Quedan solo ${diasRestantes} días</span>`;
    } else if (diasRestantes <= 90) {
      urgencia = `<span class="rg52-urgente urgente-proximo">⚠️ Quedan ${diasRestantes} días</span>`;
    } else {
      urgencia = `<span class="rg52-urgente urgente-ok">✅ Te quedan ${diasRestantes} días para prepararte</span>`;
    }

    el.innerHTML = `
      <div class="rg52-found">
        <div class="rg52-found-header">
          <span class="rg52-icon-check">📋</span>
          <div>
            <p class="rg52-found-title">RUC <strong>${raw}</strong> está incluido en la RG DNIT N° 52/2026</p>
            <p class="rg52-found-grupo">${grupoInfo.label} · Obligatoriedad: <strong>${entry.f}</strong></p>
          </div>
        </div>
        ${urgencia}
        <div class="rg52-found-cta">
          <p>Tu empresa debe emitir comprobantes electrónicos (e-Kuatia) a partir de esa fecha.</p>
          <div style="display:flex;gap:.7rem;flex-wrap:wrap;margin-top:.8rem">
            <a href="https://www.hefion.com" target="_blank" class="btn-primary" style="font-size:.88rem;padding:10px 18px">
              Adoptar e-Kuatia con HEFION →
            </a>
            <a href="https://wa.me/595974461453?text=Hola%2C%20mi%20RUC%20${raw}%20est%C3%A1%20en%20el%20Grupo%20${entry.g}%20de%20la%20RG%2052%2F2026%20y%20necesito%20asesoramiento."
               target="_blank" class="btn-wa-small">
              💬 Pedir asesoramiento
            </a>
          </div>
        </div>
      </div>
    `;
  } else {
    el.innerHTML = `
      <div class="rg52-not-found">
        <span style="font-size:1.5rem">✅</span>
        <div>
          <p><strong>El RUC ${raw} no figura en la RG DNIT N° 52/2026</strong> (Grupos 19 al 24).</p>
          <p style="font-size:.88rem;color:var(--gray-500);margin-top:.3rem">
            Esto no descarta obligatoriedad por resoluciones anteriores (Grupos 1 al 18).
            Consultá con tu contador para estar seguro.
          </p>
          <a href="https://wa.me/595974461453?text=Hola%2C%20quiero%20saber%20si%20mi%20RUC%20${raw}%20est%C3%A1%20obligado%20a%20facturaci%C3%B3n%20electr%C3%B3nica."
             target="_blank" class="btn-wa-small" style="display:inline-block;margin-top:.8rem">
            💬 Consultar con un contador
          </a>
        </div>
      </div>
    `;
  }
}

/* ===========================
   PRE-FILL DESDE URL ?ruc=
   =========================== */
window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const rucParam = params.get("ruc");
  if (rucParam) {
    const inputRuc = document.getElementById("input-ruc");
    if (inputRuc) { inputRuc.value = rucParam; buscarRUC(); }
  }
});

/* ===========================
   HEADER SCROLL SHADOW
   =========================== */
window.addEventListener("scroll", () => {
  document.querySelector(".header").style.boxShadow =
    window.scrollY > 30 ? "0 4px 20px rgba(0,0,0,.08)" : "none";
});

/* ===========================
   CARD ANIMATIONS
   =========================== */
window.addEventListener("load", () => {
  const cards = document.querySelectorAll(".novedad-card, .service-card, .about-card");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }, i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(card => {
    card.style.opacity = "0";
    card.style.transform = "translateY(18px)";
    card.style.transition = "opacity .45s ease, transform .45s ease";
    observer.observe(card);
  });
});
