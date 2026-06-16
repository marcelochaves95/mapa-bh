"use strict";

const ELEVATION = 1045.55;

const els = {
  input: document.getElementById("neighborhood"),
  options: document.getElementById("options"),
  download: document.getElementById("download"),
  status: document.getElementById("status"),
};

let neighborhoods = {}; // { name: [ [ [ [lng, lat], ... ] ] ] }  (MultiPolygon)
let names = [];         // sorted neighborhood names
let current = null;     // currently selected valid neighborhood name
let activeIndex = -1;   // highlighted item in the dropdown

// --- Map ---
const map = L.map("map", { zoomControl: true }).setView([-19.917, -43.934], 11);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap",
}).addTo(map);

let layer = null;

function setStatus(message, kind = "") {
  els.status.textContent = message;
  els.status.className = "status" + (kind ? " " + kind : "");
}

// Strip diacritics for accent-insensitive matching.
const normalize = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

// GeoJSON stores [lng, lat]; Leaflet expects [lat, lng].
function toLeaflet(polygons) {
  return polygons.map((polygon) => polygon.map((ring) => ring.map(([lng, lat]) => [lat, lng])));
}

function showOnMap(name) {
  if (layer) { layer.remove(); layer = null; }
  const polygons = neighborhoods[name];
  if (!polygons) return;
  layer = L.polygon(toLeaflet(polygons), { color: "#2ea043", weight: 2, fillOpacity: 0.2 }).addTo(map);
  map.fitBounds(layer.getBounds(), { padding: [24, 24] });
}

// --- Dropdown (combobox) ---
function closeList() {
  els.options.hidden = true;
  els.input.setAttribute("aria-expanded", "false");
  activeIndex = -1;
}

function selectName(name) {
  els.input.value = name;
  current = name;
  els.download.disabled = false;
  showOnMap(name);
  setStatus(`Bairro selecionado: ${name}`, "ok");
  closeList();
}

function renderList(query) {
  const q = normalize(query);
  const matches = q ? names.filter((n) => normalize(n).includes(q)) : names;
  activeIndex = -1;

  if (!matches.length) {
    els.options.innerHTML = '<li class="empty">Nenhum bairro encontrado.</li>';
  } else {
    els.options.innerHTML = matches
      .map((n) => `<li role="option" data-name="${n.replace(/"/g, "&quot;")}">${n}</li>`)
      .join("");
  }
  els.options.hidden = false;
  els.input.setAttribute("aria-expanded", "true");
  els.options.scrollTop = 0;
}

function setActive(i) {
  const items = els.options.querySelectorAll("li[role=option]");
  if (!items.length) return;
  activeIndex = (i + items.length) % items.length;
  items.forEach((li, idx) => li.classList.toggle("active", idx === activeIndex));
  items[activeIndex].scrollIntoView({ block: "nearest" });
}

function onInput() {
  current = null;
  els.download.disabled = true;
  renderList(els.input.value);
  if (!els.input.value.trim()) setStatus(`${names.length} bairros. Escolha um.`);
}

function onKeydown(e) {
  if (els.options.hidden && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
    renderList(els.input.value);
    return;
  }
  switch (e.key) {
    case "ArrowDown": e.preventDefault(); setActive(activeIndex + 1); break;
    case "ArrowUp": e.preventDefault(); setActive(activeIndex - 1); break;
    case "Enter": {
      e.preventDefault();
      const items = els.options.querySelectorAll("li[role=option]");
      if (activeIndex >= 0 && items[activeIndex]) {
        selectName(items[activeIndex].dataset.name);
      } else if (neighborhoods[els.input.value.trim()]) {
        selectName(els.input.value.trim());
      }
      break;
    }
    case "Escape": closeList(); break;
  }
}

// --- GPX generation (mirrors the original desktop app) ---
function escapeXml(s) {
  return s.replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]));
}

function buildGpx(name, polygons) {
  const safe = escapeXml(name);
  const parts = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<gpx version="1.1" creator="Mapa BH" xmlns="http://www.topografix.com/GPX/1/1">',
    "  <trk>",
    `    <name>${safe}</name>`,
    "    <trkseg>",
  ];
  for (const polygon of polygons) {
    for (const ring of polygon) {
      for (const [lng, lat] of ring) {
        parts.push(
          `      <trkpt lat="${lat}" lon="${lng}">`,
          `        <ele>${ELEVATION}</ele>`,
          `        <name>${safe}</name>`,
          "      </trkpt>"
        );
      }
    }
  }
  parts.push("    </trkseg>", "  </trk>", "</gpx>", "");
  return parts.join("\n");
}

function downloadGpx() {
  if (!current) return;
  const gpx = buildGpx(current, neighborhoods[current]);
  const blob = new Blob([gpx], { type: "application/gpx+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${current.replace(/\s+/g, "_")}.gpx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  setStatus(`GPX gerado: ${a.download}`, "ok");
}

// --- Data loading ---
async function init() {
  try {
    const res = await fetch("data/neighborhoods.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    neighborhoods = await res.json();
    names = Object.keys(neighborhoods);

    els.input.disabled = false;
    setStatus(`${names.length} bairros. Escolha um.`);

    els.input.addEventListener("input", onInput);
    els.input.addEventListener("keydown", onKeydown);
    els.input.addEventListener("focus", () => renderList(els.input.value));

    els.options.addEventListener("mousedown", (e) => {
      const li = e.target.closest("li[role=option]");
      if (li) { e.preventDefault(); selectName(li.dataset.name); }
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".combo")) closeList();
    });

    els.download.addEventListener("click", downloadGpx);
  } catch (err) {
    setStatus(`Falha ao carregar os bairros: ${err.message}`, "error");
  }
}

init();
