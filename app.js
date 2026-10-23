
const DATA_URL = "data/licnosti.json";

let people = [];
let script = "sr";
let map = null;
let markersLayer = null;

const $ = (id) => document.getElementById(id);

const labels = {
  sr: {
    open: "Отвори биографију →",
    noResults: "Нема резултата за задати појам.",
    people: "личности",
    parcel: "Парцела",
    grave: "Гробно место",
    years: "Године",
    map: "Прикажи на мапи",
    google: "Отвори у Google мапама",
    qr: "QR код за ову биографију",
    qrNote: "Овај QR код садржи адресу тренутне странице. За штампање и јавну употребу, најпре објавите апликацију на сталној HTTPS адреси.",
    direct: "Копирај линк",
    copied: "Линк је копиран.",
    source: "Извори и напомене",
    noPhoto: "Фотографија ће бити додата накнадно.",
    noBio: "Биографија још није унета.",
    marker: "Отвори биографију",
    error: "Базу није могуће учитати. Проверите да ли је апликација објављена и да ли постоји датотека data/licnosti.json."
  },
  lat: {
    open: "Otvori biografiju →",
    noResults: "Nema rezultata za zadati pojam.",
    people: "ličnosti",
    parcel: "Parcela",
    grave: "Grobno mesto",
    years: "Godine",
    map: "Prikaži na mapi",
    google: "Otvori u Google mapama",
    qr: "QR kod za ovu biografiju",
    qrNote: "Ovaj QR kod sadrži adresu trenutne stranice. Za štampanje i javnu upotrebu, najpre objavite aplikaciju na stalnoj HTTPS adresi.",
    direct: "Kopiraj link",
    copied: "Link je kopiran.",
    source: "Izvori i napomene",
    noPhoto: "Fotografija će biti dodata naknadno.",
    noBio: "Biografija još nije uneta.",
    marker: "Otvori biografiju",
    error: "Bazu nije moguće učitati. Proverite da li je aplikacija objavljena i da li postoji datoteka data/licnosti.json."
  }
};

function t(key) {
  return labels[script][key] || key;
}

function field(person, key) {
  if (script === "lat" && person[key + "_lat"]) {
    return person[key + "_lat"];
  }
  return person[key] || "";
}

function esc(value = "") {
  return String(value).replace(/[&<>"']/g, ch => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[ch]);
}

function validCoords(p) {
  return Number.isFinite(Number(p.lat)) &&
    Number.isFinite(Number(p.lon)) &&
    p.lat !== "" &&
    p.lon !== "";
}

/*
 * Pretraga:
 * - ne razlikuje velika i mala slova
 * - prepoznaje ćirilicu i latinicu
 * - zanemaruje dijakritičke znakove
 * - pretražuje ime, zanimanje, biografiju i podatke o grobu
 */
function normalizeSearchText(value = "") {
  const cyrillicToLatin = {
    "а": "a", "б": "b", "в": "v", "г": "g",
    "д": "d", "ђ": "dj", "е": "e", "ж": "z",
    "з": "z", "и": "i", "ј": "j", "к": "k",
    "л": "l", "љ": "lj", "м": "m", "н": "n",
    "њ": "nj", "о": "o", "п": "p", "р": "r",
    "с": "s", "т": "t", "ћ": "c", "у": "u",
    "ф": "f", "х": "h", "ц": "c", "ч": "c",
    "џ": "dz", "ш": "s"
  };

  return String(value ?? "")
    .toLocaleLowerCase("sr")
    .replace(/[а-яђјљњћџ]/g, ch => cyrillicToLatin[ch] || ch)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "dj")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/* 3D модели se prikazuju samo u biografijama odgovarajućih ličnosti. */
const THREE_D_MODELS = [
  {
    file: "assets/3d/ignjat-todorovic.glb",
    aliases: ["ignjat-todorovic", "ignjat todorovic"]
  },
  {
    file: "assets/3d/sava-jovanovic-grob.glb",
    aliases: ["sava-jovanovic", "sava jovanovic"]
  }
];

/* Normalizacija identifikatora ličnosti. */
function normalizePersonKey(value = "") {
  return normalizeSearchText(value).replace(/\s+/g, "-");
}

function modelForPerson(person) {
  const keys = [person.id, person.ime, person.ime_lat]
    .filter(Boolean)
    .map(normalizePersonKey);

  return THREE_D_MODELS.find(model =>
    model.aliases.some(alias => {
      const normalizedAlias = normalizePersonKey(alias);
      return keys.some(key => key === normalizedAlias);
    })
  ) || null;
}

function ensureModelViewer() {
  if (customElements.get("model-viewer")) return;
  if (document.querySelector("script[data-model-viewer]")) return;

  const scriptTag = document.createElement("script");
  scriptTag.type = "module";
  scriptTag.src =
    "https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js";
  scriptTag.dataset.modelViewer = "true";
  document.head.appendChild(scriptTag);
}

function addModelViewerStyles() {
  if ($("profile-3d-styles")) return;

  const style = document.createElement("style");
  style.id = "profile-3d-styles";
  style.textContent = `
    .profile-3d {
      margin: 2rem 0;
      padding: 1.25rem;
      border: 1px solid rgba(120,110,90,.25);
      border-radius: 16px;
    }

    .profile-3d h3 {
      margin-top: 0;
    }

    .profile-3d model-viewer {
      display: block;
      width: 100%;
      height: min(65vh, 520px);
      min-height: 300px;
      background: #f3f0e9;
      border-radius: 12px;
      --poster-color: transparent;
    }

    .profile-3d-note {
      font-size: .9rem;
      opacity: .75;
      margin-bottom: 0;
    }
  `;

  document.head.appendChild(style);
}

function renderList(filter = $("search").value) {
  const q = normalizeSearchText(filter);
  const category = $("categoryFilter")
    ? $("categoryFilter").value
    : "all";

  const filtered = people.filter(p => {
    const searchableText = [
      p.id,
      p.ime,
      p.ime_lat,
      p.zanimanje,
      p.zanimanje_lat,
      p.biografija,
      p.biografija_lat,
      p.parcela,
      p.grobno_mesto,
      p.izvori,
      ...(Array.isArray(p.kategorije) ? p.kategorije : [])
    ]
      .filter(value => value !== undefined && value !== null)
      .join(" ");

    const matchesText =
      normalizeSearchText(searchableText).includes(q);

    const matchesCategory =
      category === "all" ||
      (Array.isArray(p.kategorije) &&
       p.kategorije.includes(category));

    return matchesText && matchesCategory;
  });

  const categoryNames = {
    sr: {
      all: "Све категорије",
      umetnici: "Уметници и књижевници",
      politicari: "Политичари и председници општине",
      dobrotvori: "Добротвори и задужбинари",
      oficiri: "Официри и војна лица",
      sportisti: "Спортисти",
      advokati: "Адвокати и правници",
      lekari: "Лекари и здравствени радници",
      prosvetni: "Просветни радници и научници",
      privrednici: "Привредници и трговци",
      svestenici: "Свештеници и верски делатници",
      ostali: "Остале знамените личности"
    },
    lat: {
      all: "Sve kategorije",
      umetnici: "Umetnici i književnici",
      politicari: "Političari i predsednici opštine",
      dobrotvori: "Dobrotvori i zadužbinari",
      oficiri: "Oficiri i vojna lica",
      sportisti: "Sportisti",
      advokati: "Advokati i pravnici",
      lekari: "Lekari i zdravstveni radnici",
      prosvetni: "Prosvetni radnici i naučnici",
      privrednici: "Privrednici i trgovci",
      svestenici: "Sveštenici i verski delatnici",
      ostali: "Ostale znamenite ličnosti"
    }
  };

  const selectedName =
    (categoryNames[script] || categoryNames.sr)[category] || category;

  $("peopleList").innerHTML = filtered.map(p => `
    <article class="person-card">
      <div class="person-card-image">
        ${p.fotografija
          ? `<img src="${esc(p.fotografija)}"
              alt="${esc(field(p, "ime"))}"
              loading="lazy"
              onerror="this.closest('.person-card-image').classList.add('no-image');this.remove()">`
          : `<span aria-hidden="true">✦</span>`}
      </div>
      <div class="person-card-content">
        <div class="card-top">
          <span class="period">${esc(p.godine || "")}</span>
        </div>
        <h3>${esc(field(p, "ime"))}</h3>
        <p>${esc(field(p, "zanimanje"))}</p>
        <div class="place">
          ${p.parcela
            ? `${esc(t("parcel"))} ${esc(p.parcela)}`
            : ""}
          ${p.grobno_mesto
            ? ` · ${esc(t("grave"))} ${esc(p.grobno_mesto)}`
            : ""}
        </div>
        <button type="button" data-person="${esc(p.id)}">
          ${esc(t("open"))}
        </button>
      </div>
    </article>
  `).join("") ||
    `<div class="empty-state">${esc(t("noResults"))}</div>`;

  $("resultsCount").textContent =
    `${filtered.length} ${t("people")} · ${selectedName}`;

  $("clearSearch").classList.toggle(
    "hidden",
    !filter && category === "all"
  );

  document.querySelectorAll("[data-person]").forEach(button => {
    button.addEventListener("click", () => {
      showProfile(button.dataset.person, true);
    });
  });
}

function publicUrl(id) {
  const url = new URL(location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("id", id);
  return url.href;
}

function showProfile(id, scroll = true) {
  const p = people.find(x => x.id === id);
  if (!p) return;

  const photo = p.fotografija
    ? `<img class="profile-photo"
        src="${esc(p.fotografija)}"
        alt="${esc(field(p, "ime"))}"
        onerror="this.hidden=true">`
    : "";

  const gravePhoto = p.fotografija_groba
    ? `<figure class="grave-photo-wrap">
        <img class="grave-photo"
          src="${esc(p.fotografija_groba)}"
          alt="${esc(script === "sr"
            ? "Гробно место личности"
            : "Grobno mesto ličnosti")}"
          onerror="this.closest('figure').hidden=true">
        <figcaption>${esc(script === "sr"
          ? "Гробно место"
          : "Grobno mesto")}</figcaption>
      </figure>`
    : "";

  const model = modelForPerson(p);

  if (model) {
    ensureModelViewer();
    addModelViewerStyles();
  }

  const modelSection = model
    ? `<section class="profile-3d">
        <h3>${esc(script === "sr"
          ? "3D приказ гробног места"
          : "3D prikaz grobnog mesta")}</h3>
        <model-viewer
          src="${esc(model.file)}"
          alt="${esc(field(p, "ime"))}"
          camera-controls
          touch-action="pan-y"
          auto-rotate
          shadow-intensity="1"
          exposure="1"
          loading="lazy">
        </model-viewer>
        <p class="profile-3d-note">${esc(script === "sr"
          ? "Окрећите модел мишем или прстом; точкићем или покретом два прста можете да увећате приказ."
          : "Okrećite model mišem ili prstom; točkićem ili pokretom dva prsta možete da uvećate prikaz.")}</p>
      </section>`
    : "";

  const coords = validCoords(p)
    ? `${Number(p.lat).toFixed(6)}, ${Number(p.lon).toFixed(6)}`
    : "";

  const mapLink = validCoords(p)
    ? `https://www.google.com/maps?q=${encodeURIComponent(p.lat + "," + p.lon)}`
    : "";

  $("profile").classList.remove("hidden");
  $("catalogSection").classList.add("hidden");

  $("profileContent").innerHTML = `${photo}
    <p class="eyebrow dark">
      ${esc(script === "sr" ? "БИОГРАФИЈА" : "BIOGRAFIJA")}
    </p>
    <h2>${esc(field(p, "ime"))}</h2>
    <p class="profession">
      <strong>${esc(field(p, "zanimanje"))}</strong>
      ${p.godine ? ` · ${esc(p.godine)}` : ""}
    </p>
    <p class="biography">
      ${esc(field(p, "biografija") || t("noBio"))}
    </p>
    <div class="profile-details">
      ${p.parcela
        ? `<span class="detail-pill">
            <strong>${esc(t("parcel"))}:</strong> ${esc(p.parcela)}
          </span>`
        : ""}
      ${p.grobno_mesto
        ? `<span class="detail-pill">
            <strong>${esc(t("grave"))}:</strong> ${esc(p.grobno_mesto)}
          </span>`
        : ""}
      ${coords
        ? `<span class="detail-pill">
            <strong>GPS:</strong> ${esc(coords)}
          </span>`
        : ""}
    </div>
    ${gravePhoto}
    ${modelSection}
    <div class="profile-actions">
      ${mapLink
        ? `<a href="${mapLink}" target="_blank" rel="noopener">
            ${esc(t("google"))} ↗
          </a>`
        : ""}
      <button id="copyProfileLink" type="button">
        ${esc(t("direct"))}
      </button>
    </div>
    ${p.izvori
      ? `<div class="source-note">
          <strong>${esc(t("source"))}:</strong> ${esc(p.izvori)}
        </div>`
      : ""}
    <div class="qr-wrap">
      <h3>${esc(t("qr"))}</h3>
      <p class="qr-warning">${esc(t("qrNote"))}</p>
      <div id="qrcode"></div>
      <p>
        <a href="${esc(publicUrl(p.id))}"
          target="_blank" rel="noopener">
          ${esc(publicUrl(p.id))}
        </a>
      </p>
    </div>`;

  if (window.QRCode) {
    new QRCode($("qrcode"), {
      text: publicUrl(p.id),
      width: 180,
      height: 180,
      correctLevel: QRCode.CorrectLevel.M
    });
  }

  $("copyProfileLink").addEventListener("click", async () => {
    const value = publicUrl(p.id);

    try {
      await navigator.clipboard.writeText(value);
      $("copyProfileLink").textContent = t("copied");
    } catch {
      window.prompt(
        script === "sr" ? "Копирајте линк:" : "Kopirajte link:",
        value
      );
    }
  });

  history.replaceState(null, "", `?id=${encodeURIComponent(p.id)}`);

  if (scroll) {
    $("profile").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  if (map && validCoords(p)) {
    map.setView(
      [Number(p.lat), Number(p.lon)],
      Math.max(map.getZoom(), 18)
    );
  }
}

function backToCatalog() {
  $("profile").classList.add("hidden");
  $("catalogSection").classList.remove("hidden");

  history.replaceState(null, "", location.pathname + location.hash);

  $("catalogSection").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function buildMarkers() {
  if (!map || !window.L) return;

  if (markersLayer) markersLayer.remove();

  markersLayer = L.layerGroup().addTo(map);

  people.filter(validCoords).forEach(p => {
    const marker = L.marker([
      Number(p.lat),
      Number(p.lon)
    ]).addTo(markersLayer);

    marker.bindPopup(`
      <strong>${esc(field(p, "ime"))}</strong><br>
      ${esc(p.parcela ? t("parcel") + ": " + p.parcela : "")}
      ${p.grobno_mesto
        ? `<br>${esc(t("grave"))}: ${esc(p.grobno_mesto)}`
        : ""}
      <br>
      <button class="map-popup-button"
        type="button"
        data-map-person="${esc(p.id)}">
        ${esc(t("marker"))} →
      </button>
    `);

    marker.on("popupopen", e => {
      const button =
        e.popup.getElement().querySelector("[data-map-person]");

      if (button) {
        button.addEventListener("click", () => {
          showProfile(p.id, true);
        });
      }
    });
  });

  $("mappedCount").textContent =
    people.filter(validCoords).length;
}

function initMap() {
  if (!window.L) {
    $("map").innerHTML = `
      <p class="empty-state">
        ${esc(script === "sr"
          ? "За интерактивну мапу потребна је интернет веза."
          : "Za interaktivnu mapu potrebna je internet veza.")}
      </p>`;
    return;
  }

  const coords = people.filter(validCoords);

  const center = coords.length
    ? [Number(coords[0].lat), Number(coords[0].lon)]
    : [44.6299, 21.1795];

  map = L.map("map").setView(center, 17);

  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }
  ).addTo(map);

  buildMarkers();

  if (coords.length > 1) {
    map.fitBounds(
      L.latLngBounds(
        coords.map(p => [Number(p.lat), Number(p.lon)])
      ).pad(0.12)
    );
  }
}

function setScript(next) {
  script = next;
  document.documentElement.lang = "sr";

  document.querySelectorAll("[data-sr][data-lat]").forEach(el => {
    el.textContent = el.dataset[next];
  });

  $("scriptToggle").textContent =
    next === "sr" ? "Latinica" : "Ћирилица";

  $("search").placeholder =
    next === "sr"
      ? "Претрага имена или занимања…"
      : "Pretraga imena ili zanimanja…";

  renderList($("search").value);

  if (map) buildMarkers();

  const id = new URLSearchParams(location.search).get("id");

  if (id && !$("profile").classList.contains("hidden")) {
    showProfile(id, false);
  }
}

fetch(DATA_URL)
  .then(response => {
    if (!response.ok) {
      throw new Error("HTTP " + response.status);
    }
    return response.json();
  })
  .then(data => {
    people = data;
    $("peopleCount").textContent = people.length;

    renderList();
    initMap();

    const id = new URLSearchParams(location.search).get("id");

    if (id && people.some(p => p.id === id)) {
      showProfile(id, false);
    }
  })
  .catch(error => {
    $("peopleList").innerHTML = `
      <div class="empty-state">${esc(t("error"))}</div>`;
    console.error(error);
  });

$("search").addEventListener("input", event => {
  renderList(event.target.value);
});

$("clearSearch").addEventListener("click", () => {
  $("search").value = "";
  $("categoryFilter").value = "all";
  renderList("");
  $("search").focus();
});

$("categoryFilter").addEventListener("change", () => {
  renderList($("search").value);
});

function updateRouteLinks() {
  const origin = $("routeOrigin").value;
  const destination = "Staro groblje, Požarevac, Serbia";

  const makeUrl = mode =>
    "https://www.google.com/maps/dir/?api=1&origin=" +
    encodeURIComponent(origin) +
    "&destination=" +
    encodeURIComponent(destination) +
    "&travelmode=" +
    mode;

  $("routeDriving").href = makeUrl("driving");
  $("routeTransit").href = makeUrl("transit");
}

$("routeOrigin").addEventListener("change", updateRouteLinks);
updateRouteLinks();

$("backToCatalog").addEventListener("click", backToCatalog);

$("scriptToggle").addEventListener("click", () => {
  setScript(script === "sr" ? "lat" : "sr");
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .catch(console.warn);
  });
}
