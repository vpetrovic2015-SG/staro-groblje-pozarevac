const DATA_URL = "data/licnosti.json";
let people = [];
let script = "sr";
let map = null;
let markersLayer = null;
const $ = (id) => document.getElementById(id);

const labels = {
  sr: { open:"Отвори биографију →", noResults:"Нема резултата за задати појам.", people:"личности", parcel:"Парцела", grave:"Гробно место", years:"Године", map:"Прикажи на мапи", google:"Отвори у Google мапама", qr:"QR код за ову биографију", qrNote:"Овај QR код садржи адресу тренутне странице. За штампање и јавну употребу, најпре објавите апликацију на сталној HTTPS адреси.", direct:"Копирај линк", copied:"Линк је копиран.", source:"Извори и напомене", noPhoto:"Фотографија ће бити додата накнадно.", noBio:"Биографија још није унета.", marker:"Отвори биографију", error:"Базу није могуће учитати. Покренite aplikaciju preko lokalnog servera; nemojte otvarati index.html dvostrukim klikom." },
  lat: { open:"Otvori biografiju →", noResults:"Nema rezultata za zadati pojam.", people:"ličnosti", parcel:"Parcela", grave:"Grobno mesto", years:"Godine", map:"Prikaži na mapi", google:"Otvori u Google mapama", qr:"QR kod za ovu biografiju", qrNote:"Ovaj QR kod sadrži adresu trenutne stranice. Za štampanje i javnu upotrebu, najpre objavite aplikaciju na stalnoj HTTPS adresi.", direct:"Kopiraj link", copied:"Link je kopiran.", source:"Izvori i napomene", noPhoto:"Fotografija će biti dodata naknadno.", noBio:"Biografija još nije uneta.", marker:"Otvori biografiju", error:"Bazu nije moguće učitati. Pokrenite aplikaciju preko lokalnog servera; nemojte otvarati index.html dvostrukim klikom." }
};
function t(key) { return labels[script][key] || key; }
function field(person, key) {
  if (script === "lat" && person[key + "_lat"]) return person[key + "_lat"];
  return person[key] || "";
}
function esc(value = "") { return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
function validCoords(p) { return Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lon)) && p.lat !== "" && p.lon !== ""; }
function renderList(filter = $("search").value) {
  const q = filter.trim().toLocaleLowerCase();
  const category = $("categoryFilter") ? $("categoryFilter").value : "all";
  const filtered = people.filter(p => {
    const matchesText = [p.ime, p.ime_lat, p.zanimanje, p.zanimanje_lat, p.biografija, p.biografija_lat, p.parcela, p.grobno_mesto].join(" ").toLocaleLowerCase().includes(q);
    const matchesCategory = category === "all" || (Array.isArray(p.kategorije) && p.kategorije.includes(category));
    return matchesText && matchesCategory;
  });
  const categoryNames = {
    sr: {all:"Све категорије", umetnici:"Уметници и књижевници", politicari:"Политичари и председници општине", dobrotvori:"Добротвори и задужбинари", oficiri:"Официри и војна лица", sportisti:"Спортисти", advokati:"Адвокати и правници", lekari:"Лекари и здравствени радници", prosvetni:"Просветни радници и научници", privrednici:"Привредници и трговци", svestenici:"Свештеници и верски делатници", ostali:"Остале знамените личности"},
    lat: {all:"Sve kategorije", umetnici:"Umetnici i književnici", politicari:"Političari i predsednici opštine", dobrotvori:"Dobrotvori i zadužbinari", oficiri:"Oficiri i vojna lica", sportisti:"Sportisti", advokati:"Advokati i pravnici", lekari:"Lekari i zdravstveni radnici", prosvetni:"Prosvetni radnici i naučnici", privrednici:"Privrednici i trgovci", svestenici:"Sveštenici i verski delatnici", ostali:"Ostale znamenite ličnosti"}
  };
  const selectedName = (categoryNames[script] || categoryNames.sr)[category] || category;
  $("peopleList").innerHTML = filtered.map(p => `
    <article class="person-card">
      <div class="card-top"><span class="period">${esc(p.godine || "")}</span></div>
      <h3>${esc(field(p,"ime"))}</h3>
      <p>${esc(field(p,"zanimanje"))}</p>
      <div class="place">${p.parcela ? `${esc(t("parcel"))} ${esc(p.parcela)}` : ""}${p.grobno_mesto ? ` · ${esc(t("grave"))} ${esc(p.grobno_mesto)}` : ""}</div>
      <button type="button" data-person="${esc(p.id)}">${esc(t("open"))}</button>
    </article>`).join("") || `<div class="empty-state">${esc(t("noResults"))}</div>`;
  $("resultsCount").textContent = `${filtered.length} ${t("people")} · ${selectedName}`;
  $("clearSearch").classList.toggle("hidden", !filter && category === "all");
  document.querySelectorAll("[data-person]").forEach(b => b.addEventListener("click", () => showProfile(b.dataset.person, true)));
}

function publicUrl(id) {
  const url = new URL(location.href);
  url.search = ""; url.hash = ""; url.searchParams.set("id", id);
  return url.href;
}
function showProfile(id, scroll = true) {
  const p = people.find(x => x.id === id);
  if (!p) return;
  const photo = p.fotografija ? `<img class="profile-photo" src="${esc(p.fotografija)}" alt="${esc(field(p,"ime"))}" onerror="this.hidden=true">` : "";
  const coords = validCoords(p) ? `${Number(p.lat).toFixed(6)}, ${Number(p.lon).toFixed(6)}` : "";
  const mapLink = validCoords(p) ? `https://www.google.com/maps?q=${encodeURIComponent(p.lat + "," + p.lon)}` : "";
  $("profile").classList.remove("hidden");
  $("catalogSection").classList.add("hidden");
  $("profileContent").innerHTML = `${photo}
    <p class="eyebrow dark">${esc(script === "sr" ? "БИОГРАФИЈА" : "BIOGRAFIJA")}</p>
    <h2>${esc(field(p,"ime"))}</h2>
    <p class="profession"><strong>${esc(field(p,"zanimanje"))}</strong>${p.godine ? ` · ${esc(p.godine)}` : ""}</p>
    <p class="biography">${esc(field(p,"biografija") || t("noBio"))}</p>
    <div class="profile-details">${p.parcela ? `<span class="detail-pill"><strong>${esc(t("parcel"))}:</strong> ${esc(p.parcela)}</span>` : ""}${p.grobno_mesto ? `<span class="detail-pill"><strong>${esc(t("grave"))}:</strong> ${esc(p.grobno_mesto)}</span>` : ""}${coords ? `<span class="detail-pill"><strong>GPS:</strong> ${esc(coords)}</span>` : ""}</div>
    <div class="profile-actions">${mapLink ? `<a href="${mapLink}" target="_blank" rel="noopener">${esc(t("google"))} ↗</a>` : ""}<button id="copyProfileLink" type="button">${esc(t("direct"))}</button></div>
    ${p.izvori ? `<div class="source-note"><strong>${esc(t("source"))}:</strong> ${esc(p.izvori)}</div>` : ""}
    <div class="qr-wrap"><h3>${esc(t("qr"))}</h3><p class="qr-warning">${esc(t("qrNote"))}</p><div id="qrcode"></div><p><a href="${esc(publicUrl(p.id))}" target="_blank" rel="noopener">${esc(publicUrl(p.id))}</a></p></div>`;
  if (window.QRCode) new QRCode($("qrcode"), {text: publicUrl(p.id), width: 180, height: 180, correctLevel: QRCode.CorrectLevel.M});
  $("copyProfileLink").addEventListener("click", async () => {
    const value = publicUrl(p.id);
    try { await navigator.clipboard.writeText(value); $("copyProfileLink").textContent = t("copied"); }
    catch { window.prompt(script === "sr" ? "Копирајте линк:" : "Kopirajte link:", value); }
  });
  history.replaceState(null, "", `?id=${encodeURIComponent(p.id)}`);
  if (scroll) $("profile").scrollIntoView({behavior:"smooth", block:"start"});
  if (map && validCoords(p)) map.setView([Number(p.lat), Number(p.lon)], Math.max(map.getZoom(), 18));
}
function backToCatalog() {
  $("profile").classList.add("hidden"); $("catalogSection").classList.remove("hidden");
  history.replaceState(null, "", location.pathname + location.hash);
  $("catalogSection").scrollIntoView({behavior:"smooth", block:"start"});
}
function buildMarkers() {
  if (!map || !window.L) return;
  if (markersLayer) markersLayer.remove();
  markersLayer = L.layerGroup().addTo(map);
  people.filter(validCoords).forEach(p => {
    const marker = L.marker([Number(p.lat), Number(p.lon)]).addTo(markersLayer);
    marker.bindPopup(`<strong>${esc(field(p,"ime"))}</strong><br>${esc(p.parcela ? t("parcel") + ": " + p.parcela : "")}${p.grobno_mesto ? `<br>${esc(t("grave"))}: ${esc(p.grobno_mesto)}` : ""}<br><button class="map-popup-button" type="button" data-map-person="${esc(p.id)}">${esc(t("marker"))} →</button>`);
    marker.on("popupopen", e => {
      const btn = e.popup.getElement().querySelector("[data-map-person]");
      if (btn) btn.addEventListener("click", () => showProfile(p.id, true));
    });
  });
  $("mappedCount").textContent = people.filter(validCoords).length;
}
function initMap() {
  if (!window.L) { $("map").innerHTML = `<p class="empty-state">${esc(script === "sr" ? "За интерактивну мапу потребна је интернет веза." : "Za interaktivnu mapu potrebna je internet veza.")}</p>`; return; }
  const coords = people.filter(validCoords);
  const center = coords.length ? [Number(coords[0].lat), Number(coords[0].lon)] : [44.6299, 21.1795];
  map = L.map("map").setView(center, 17);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {maxZoom:19, attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'}).addTo(map);
  buildMarkers();
  if (coords.length > 1) map.fitBounds(L.latLngBounds(coords.map(p => [Number(p.lat), Number(p.lon)])).pad(0.12));
}
function setScript(next) {
  script = next;
  document.documentElement.lang = "sr";
  document.querySelectorAll("[data-sr][data-lat]").forEach(el => el.textContent = el.dataset[next]);
  $("scriptToggle").textContent = next === "sr" ? "Latinica" : "Ћирилица";
  $("search").placeholder = next === "sr" ? "Претрага имена или занимања…" : "Pretraga imena ili zanimanja…";
  renderList($("search").value);
  if (map) buildMarkers();
  const id = new URLSearchParams(location.search).get("id");
  if (id && !$("profile").classList.contains("hidden")) showProfile(id, false);
}
fetch(DATA_URL).then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); }).then(data => {
  people = data;
  $("peopleCount").textContent = people.length;
  renderList(); initMap();
  const id = new URLSearchParams(location.search).get("id");
  if (id && people.some(p => p.id === id)) showProfile(id, false);
}).catch(err => {
  $("peopleList").innerHTML = `<div class="empty-state">${esc(t("error"))}</div>`;
  console.error(err);
});
$("search").addEventListener("input", e => renderList(e.target.value));
$("clearSearch").addEventListener("click", () => { $("search").value = ""; $("categoryFilter").value = "all"; renderList(""); $("search").focus(); });
$("categoryFilter").addEventListener("change", () => renderList($("search").value));
$("backToCatalog").addEventListener("click", backToCatalog);
$("scriptToggle").addEventListener("click", () => setScript(script === "sr" ? "lat" : "sr"));
if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(console.warn));
