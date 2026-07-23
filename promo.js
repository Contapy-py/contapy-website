/* ===========================
   PROMO — BANNER ROTATIVO + POPUP CONTEXTUAL
   Servicios: HEFION (facturación electrónica), Apertura de EAS/SA/SRL,
   Asesoría contable general.
   =========================== */

const WA_NUM = "595974461453";

function waLink(msg) {
  return `https://wa.me/${WA_NUM}?text=${encodeURIComponent(msg)}`;
}

/* Mensajes que rotan en el banner permanente */
const PROMO_BANNER_ITEMS = [
  {
    icon: "🧾",
    html: `<p><strong>Facturación Electrónica</strong> con HEFION — sistema homologado por la DNIT</p>`,
    ctaLabel: "Quiero mi sistema →",
    ctaHref: waLink("Hola, quiero información sobre facturación electrónica con HEFION.")
  },
  {
    icon: "🏢",
    html: `<p>¿Vas a formalizar tu negocio? Abrimos tu <strong>EAS, SA o SRL</strong> de punta a punta</p>`,
    ctaLabel: "Quiero abrir mi empresa →",
    ctaHref: waLink("Hola, quiero información para abrir mi EAS, SA o SRL.")
  },
  {
    icon: "📊",
    html: `<p><strong>Asesoría contable</strong> integral para tu empresa o emprendimiento</p>`,
    ctaLabel: "Quiero asesoría →",
    ctaHref: waLink("Hola, quiero información sobre sus servicios de asesoría contable.")
  }
];

const BANNER_ROTATE_MS = 6500;
let bannerIndex = 0;
let bannerTimer = null;

function pintarBanner() {
  const track = document.getElementById("promo-banner-track");
  if (!track) return;
  track.innerHTML = PROMO_BANNER_ITEMS.map((item, i) => `
    <div class="promo-banner-item${i === 0 ? " active" : ""}" data-i="${i}">
      <span style="font-size:1.3rem">${item.icon}</span>
      ${item.html}
      <a href="${item.ctaHref}" target="_blank" class="promo-banner-cta">${item.ctaLabel}</a>
    </div>
  `).join("");
}

function rotarBanner() {
  const items = document.querySelectorAll(".promo-banner-item");
  if (!items.length) return;
  items[bannerIndex].classList.remove("active");
  bannerIndex = (bannerIndex + 1) % items.length;
  items[bannerIndex].classList.add("active");
}

function iniciarBanner() {
  if (sessionStorage.getItem("promoBannerCerrado") === "1") return;
  const banner = document.getElementById("promo-banner");
  if (!banner) return;
  pintarBanner();
  banner.classList.remove("hidden");
  document.body.classList.add("con-promo-banner");
  const fw = document.querySelector(".float-wa");
  if (fw) fw.classList.add("con-banner");
  bannerTimer = setInterval(rotarBanner, BANNER_ROTATE_MS);
}

function cerrarBanner() {
  const banner = document.getElementById("promo-banner");
  if (banner) banner.classList.add("hidden");
  document.body.classList.remove("con-promo-banner");
  const fw = document.querySelector(".float-wa");
  if (fw) fw.classList.remove("con-banner");
  if (bannerTimer) clearInterval(bannerTimer);
  sessionStorage.setItem("promoBannerCerrado", "1");
}

/* ===========================
   POPUP CONTEXTUAL (post-búsqueda de RUC)
   Se muestra una sola vez por sesión, ~1.2s después de la
   primera búsqueda de RUC con resultado.
   =========================== */

const PROMO_POPUP = {
  activo: {
    icon: "🧾",
    title: "Este RUC está activo — ¿ya factura electrónicamente?",
    text: "Con HEFION implementamos tu sistema de facturación electrónica homologado por la DNIT, listo en pocos días.",
    primaryLabel: "Quiero mi sistema de facturación",
    primaryHref: waLink("Hola, quiero información sobre facturación electrónica con HEFION."),
    secondaryLabel: "Prefiero asesoría contable general",
    secondaryHref: waLink("Hola, quiero información sobre sus servicios de asesoría contable.")
  },
  inactivo: {
    icon: "🏢",
    title: "¿RUC cancelado o suspendido?",
    text: "Te ayudamos a reactivarlo o, si preferís empezar de nuevo, abrimos tu EAS, SA o SRL de punta a punta.",
    primaryLabel: "Quiero reactivar / abrir mi empresa",
    primaryHref: waLink("Hola, quiero información sobre reactivación de RUC o apertura de una nueva empresa (EAS/SA/SRL)."),
    secondaryLabel: "Prefiero asesoría contable general",
    secondaryHref: waLink("Hola, quiero información sobre sus servicios de asesoría contable.")
  },
  general: {
    icon: "📊",
    title: "¿Buscás un contador para tu empresa?",
    text: "Ofrecemos asesoría contable integral, facturación electrónica con HEFION y apertura de sociedades (EAS, SA, SRL).",
    primaryLabel: "Quiero hablar con un contador",
    primaryHref: waLink("Hola, vi la página de ContaPY y quisiera una asesoría."),
    secondaryLabel: "Ver más servicios",
    secondaryHref: "#servicios"
  }
};

function mostrarPopupPromo(contexto) {
  if (sessionStorage.getItem("promoPopupMostrado") === "1") return;

  const data = PROMO_POPUP[contexto] || PROMO_POPUP.general;
  const overlay = document.getElementById("promo-modal");
  const content = document.getElementById("promo-modal-content");
  if (!overlay || !content) return;

  content.innerHTML = `
    <div class="promo-modal-icon">${data.icon}</div>
    <h4>${data.title}</h4>
    <p>${data.text}</p>
    <div class="promo-modal-actions">
      <a href="${data.primaryHref}" target="_blank" class="promo-modal-btn primary" onclick="cerrarPopup()">${data.primaryLabel}</a>
      <a href="${data.secondaryHref}" target="_blank" class="promo-modal-btn secondary" onclick="cerrarPopup()">${data.secondaryLabel}</a>
    </div>
  `;

  setTimeout(() => {
    overlay.classList.remove("hidden");
    sessionStorage.setItem("promoPopupMostrado", "1");
  }, 1200);
}

function cerrarPopup() {
  const overlay = document.getElementById("promo-modal");
  if (overlay) overlay.classList.add("hidden");
}

/* ===========================
   HOOK: engancha con las funciones de búsqueda de script.js
   sin modificar su lógica original (monkey-patch).
   =========================== */
function engancharPopupBusqueda() {
  if (typeof renderContribuyente === "function") {
    const original = renderContribuyente;
    renderContribuyente = function (c) {
      original(c);
      const sit = (c.situacion || "").toUpperCase();
      const contexto = (sit === "ACTIVO") ? "activo" : "inactivo";
      mostrarPopupPromo(contexto);
    };
  }
  if (typeof renderLista === "function") {
    const original = renderLista;
    renderLista = function (items) {
      original(items);
      mostrarPopupPromo("general");
    };
  }
}

window.addEventListener("DOMContentLoaded", () => {
  iniciarBanner();
  engancharPopupBusqueda();
});
