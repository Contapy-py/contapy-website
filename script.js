/* ===========================
   HEADER SCROLL SHADOW
   =========================== */
window.addEventListener("scroll", () => {
  const header = document.querySelector(".header");
  header.style.boxShadow = window.scrollY > 30
    ? "0 4px 20px rgba(0,0,0,.08)"
    : "none";
});

/* ===========================
   SEARCH TABS
   =========================== */
function switchTab(tab) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".search-panel").forEach(p => p.classList.add("hidden"));

  document.querySelector(`[data-tab="${tab}"]`).classList.add("active");
  document.getElementById(`panel-${tab}`).classList.remove("hidden");

  // clear result when switching
  document.getElementById("resultado").className = "resultado hidden";
}

/* ===========================
   RUC SEARCH
   Proxied via allorigins to
   avoid CORS on ruc.com.py
   =========================== */

function mostrarLoading() {
  const r = document.getElementById("resultado");
  r.className = "resultado loading";
  r.innerHTML = "<p>🔎 Buscando en la base de datos de la DNIT...</p>";
}

function mostrarError(msg) {
  const r = document.getElementById("resultado");
  r.className = "resultado error";
  r.innerHTML = `<p>⚠️ ${msg}</p>`;
}

// Normalise RUC: remove spaces, dots; keep digits and letters
function normalizeRUC(value) {
  return value.replace(/[\s.]/g, "").toUpperCase();
}

async function buscarRUC() {
  const raw = document.getElementById("input-ruc").value.trim();
  if (!raw) { mostrarError("Ingresá un número de RUC para buscar."); return; }

  const ruc = normalizeRUC(raw);
  mostrarLoading();

  try {
    // ruc.com.py public endpoint
    const url = `https://api.allorigins.win/get?url=${encodeURIComponent(
      `https://www.ruc.com.py/public/ruc/info?nro=${ruc}`
    )}`;

    const res  = await fetch(url);
    const data = await res.json();
    const body = JSON.parse(data.contents);

    if (!body || body.error || (Array.isArray(body) && body.length === 0)) {
      mostrarError("No se encontraron datos para el RUC ingresado. Verificá que sea correcto.");
      return;
    }

    const c = Array.isArray(body) ? body[0] : body;
    renderContribuyente(c);

  } catch (e) {
    mostrarError(
      "No se pudo conectar con la base de datos. Intentá nuevamente o consultá directamente en " +
      "<a href='https://www.ruc.com.py' target='_blank'>ruc.com.py</a>."
    );
  }
}

async function buscarNombre() {
  const nombre = document.getElementById("input-nombre").value.trim();
  if (!nombre || nombre.length < 3) {
    mostrarError("Ingresá al menos 3 caracteres para buscar por nombre.");
    return;
  }

  mostrarLoading();

  try {
    const url = `https://api.allorigins.win/get?url=${encodeURIComponent(
      `https://www.ruc.com.py/public/ruc/buscar?razon=${encodeURIComponent(nombre)}&pagina=1`
    )}`;

    const res  = await fetch(url);
    const data = await res.json();
    const body = JSON.parse(data.contents);

    if (!body || (Array.isArray(body.items) && body.items.length === 0) || body.error) {
      mostrarError("No se encontraron contribuyentes con ese nombre.");
      return;
    }

    const items = body.items || body;
    if (!Array.isArray(items) || items.length === 0) {
      mostrarError("No se encontraron resultados.");
      return;
    }

    renderLista(items, body.total);

  } catch (e) {
    mostrarError(
      "No se pudo conectar con la base de datos. Intentá en " +
      "<a href='https://www.ruc.com.py' target='_blank'>ruc.com.py</a>."
    );
  }
}

function renderContribuyente(c) {
  const r = document.getElementById("resultado");
  r.className = "resultado success";

  const estado = (c.estado || c.dv_estado || "").toString().toLowerCase();
  let badgeClass = "activo";
  if (estado.includes("inactiv") || estado === "2") badgeClass = "inactivo";
  else if (estado.includes("suspend") || estado === "3") badgeClass = "suspendido";

  const estadoLabel = c.estado_desc || c.estado || c.dv_estado || "—";

  r.innerHTML = `
    <table class="result-table">
      <tr><td>RUC</td><td><strong>${c.nro_ruc || c.ruc || "—"}</strong></td></tr>
      <tr><td>Razón social</td><td><strong>${c.razon_social || c.nombre || "—"}</strong></td></tr>
      <tr><td>Estado</td><td><span class="result-badge ${badgeClass}">${estadoLabel}</span></td></tr>
      ${c.tipo_contribuyente ? `<tr><td>Tipo</td><td>${c.tipo_contribuyente}</td></tr>` : ""}
      ${c.fecha_inicio_actividad ? `<tr><td>Inicio actividad</td><td>${c.fecha_inicio_actividad}</td></tr>` : ""}
      ${c.actividad_economica ? `<tr><td>Actividad</td><td>${c.actividad_economica}</td></tr>` : ""}
      ${c.oblig_iva !== undefined ? `<tr><td>Obligaciones</td><td>${formatObligaciones(c)}</td></tr>` : ""}
    </table>
  `;
}

function formatObligaciones(c) {
  const obs = [];
  if (c.oblig_iva === true  || c.oblig_iva === 1)  obs.push("IVA");
  if (c.oblig_ire === true  || c.oblig_ire === 1)  obs.push("IRE");
  if (c.oblig_irp === true  || c.oblig_irp === 1)  obs.push("IRP");
  if (c.oblig_ips === true  || c.oblig_ips === 1)  obs.push("IPS");
  return obs.length ? obs.join(", ") : "Sin obligaciones registradas";
}

function renderLista(items, total) {
  const r = document.getElementById("resultado");
  r.className = "resultado success";

  const liItems = items.map(c => `
    <li onclick="mostrarDetalle(this)" 
        data-ruc="${c.nro_ruc || c.ruc || ""}"
        data-nombre="${(c.razon_social || c.nombre || "").replace(/"/g,'&quot;')}"
        data-estado="${c.estado_desc || c.estado || ""}"
        data-tipo="${c.tipo_contribuyente || ""}">
      <strong>${c.razon_social || c.nombre || "—"}</strong>
      <span>RUC: ${c.nro_ruc || c.ruc || "—"} · ${c.estado_desc || c.estado || ""}</span>
    </li>
  `).join("");

  r.innerHTML = `
    <p style="font-size:.85rem;color:var(--gray-500);margin-bottom:.8rem">
      Se encontraron <strong>${total || items.length}</strong> resultado(s). Hacé clic para ver detalles.
    </p>
    <ul class="result-list">${liItems}</ul>
    ${total > items.length
      ? `<button class="result-more-btn" onclick="alert('Para ver más resultados, visitá ruc.com.py')">Ver más resultados →</button>`
      : ""}
  `;
}

function mostrarDetalle(el) {
  const c = {
    nro_ruc: el.dataset.ruc,
    razon_social: el.dataset.nombre,
    estado_desc: el.dataset.estado,
    tipo_contribuyente: el.dataset.tipo
  };
  renderContribuyente(c);
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

  const entry = RG52_LOOKUP[raw];
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

/* Pre-fill from URL ?ruc=XXXX */
window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const rucParam = params.get("ruc");
  if (rucParam) {
    const inputRuc = document.getElementById("input-ruc");
    if (inputRuc) { inputRuc.value = rucParam; buscarRUC(); }
  }
});


   =========================== */
window.addEventListener("load", () => {
  const cards = document.querySelectorAll(
    ".novedad-card, .service-card, .about-card"
  );

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
