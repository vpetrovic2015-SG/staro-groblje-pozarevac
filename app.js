const DATA_URL = "data/licnosti.json";
let people = [], selectedId = null, script = "cir", mapInstance = null, mapMarkers = [];
const $ = id => document.getElementById(id);
const T = {
 cir:{eyebrow:"ДИГИТАЛНИ ИСТОРИЈСКИ ВОДИЧ",heroTitle:"Старо гробље",heroLead:"Место сећања, културе и прича о људима који су обележили историју нашег града.",browse:"Истражи личности",intro:"Уводна реч",memory:"СЕЋАЊЕ КОЈЕ ТРАЈЕ",kicker:"О МЕСТУ",introTitle:"Уводна реч",introText:"Старо гробље у Пожаревцу представља драгоцено место историјског и културног памћења. У његовим алејама почивају људи чији су живот, рад и стваралаштво оставили траг у развоју града и шире заједнице.",introText2:"Овај дигитални каталог повезује биографије, фотографије, податке о гробним местима, интерактивну мапу и 3D приказе тамо где су доступни. Циљ је да се наслеђе сачува и учини приступачним свим посетиоцима.",kickerPeople:"ДИГИТАЛНИ КАТАЛОГ",peopleTitle:"Знамените личности",peopleLead:"Изаберите личност да бисте прочитали биографију и видели доступне фотографије, мапу и QR код.",searchLabel:"Претрага каталога",searchPlaceholder:"Име, занимање, парцела...",allCategories:"Све категорије",choosePerson:"Изаберите личност",chooseHint:"Подаци о личности ће се приказати овде.",kickerMap:"ОРИЈЕНТАЦИЈА",mapTitle:"Интерактивна мапа",mapLead:"Изаберите означено гробно место да бисте отворили профил личности.",mapNote:"Мапа приказује само локације за које су координате унете у базу.",kickerRoutes:"ПЛАНИРАЈТЕ ПОСЕТУ",routesTitle:"Руте до гробља",routesLead:"Отворите навигацију до Старог гробља или направите руту до изабране личности када су координате доступне.",routeDrive:"Навигација до Старог гробља",routeDriveSub:"Отвори Google Maps",routeFind:"Пронађи гробље",routeFindSub:"Приказ локације на мапи",routeOnSite:"Рута унутар гробља",routeOnSiteSub:"Изаберите личност са координатама на мапи.",kicker3d:"ВИРТУЕЛНО НАСЛЕЂЕ",modelTitle:"3D прикази",modelLead:"3D модели се приказују у профилу личности за коју су припремљени.",modelHint:"Отворите профил личности и изаберите картицу „3D приказ“ ако је модел доступан.",footerText:"Дигитални каталог културног и историјског наслеђа.",toTop:"Назад на врх ↑",bio:"Биографија",photos:"Фотографије",grave:"Гробно место",model:"3D приказ",qr:"QR код",occupation:"Звање / занимање",parcel:"Парцела",graveNo:"Гробно место",openRoute:"Рута до гробног места",share:"Копирај линк профила",copyDone:"Линк је копиран.",noBio:"Биографија још није унета.",noPhotos:"За ову личност још нема додатих фотографија.",noGravePhoto:"Фотографија гробног места није унета.",noModel:"3D модел за ову личност још није доступан.",qrHint:"Скенирајте QR код телефоном да бисте отворили овај профил.",openMap:"Прикажи на мапи",noResults:"Нема резултата за задати појам.",noCoords:"Координате нису унете.",mapPopup:"Отвори профил",categoryLabels:{umetnici:"Уметници",prosveta:"Просвета",istorija:"Историја","javne-licnosti":"Јавне личности",umetnost:"Уметност",religija:"Религија",ostalo:"Остало"}},
 lat:{eyebrow:"DIGITALNI ISTORIJSKI VODIČ",heroTitle:"Staro groblje",heroLead:"Mesto sećanja, kulture i priča o ljudima koji su obeležili istoriju našeg grada.",browse:"Istraži ličnosti",intro:"Uvodna reč",memory:"SEĆANJE KOJE TRAJE",kicker:"O MESTU",introTitle:"Uvodna reč",introText:"Staro groblje u Požarevcu predstavlja dragoceno mesto istorijskog i kulturnog pamćenja. U njegovim alejama počivaju ljudi čiji su život, rad i stvaralaštvo ostavili trag u razvoju grada i šire zajednice.",introText2:"Ovaj digitalni katalog povezuje biografije, fotografije, podatke o grobnim mestima, interaktivnu mapu i 3D prikaze tamo gde su dostupni. Cilj je da se nasleđe sačuva i učini pristupačnim svim posetiocima.",kickerPeople:"DIGITALNI KATALOG",peopleTitle:"Znamenite ličnosti",peopleLead:"Izaberite ličnost da biste pročitali biografiju i videli dostupne fotografije, mapu i QR kod.",searchLabel:"Pretraga kataloga",searchPlaceholder:"Ime, zanimanje, parcela...",allCategories:"Sve kategorije",choosePerson:"Izaberite ličnost",chooseHint:"Podaci o ličnosti biće prikazani ovde.",kickerMap:"ORIJENTACIJA",mapTitle:"Interaktivna mapa",mapLead:"Izaberite označeno grobno mesto da biste otvorili profil ličnosti.",mapNote:"Mapa prikazuje samo lokacije za koje su koordinate unete u bazu.",kickerRoutes:"PLANIRAJTE POSETU",routesTitle:"Rute do groblja",routesLead:"Otvorite navigaciju do Starog groblja ili napravite rutu do izabrane ličnosti kada su koordinate dostupne.",routeDrive:"Navigacija do Starog groblja",routeDriveSub:"Otvori Google Maps",routeFind:"Pronađi groblje",routeFindSub:"Prikaz lokacije na mapi",routeOnSite:"Ruta unutar groblja",routeOnSiteSub:"Izaberite ličnost sa koordinatama na mapi.",kicker3d:"VIRTUELNO NASLEĐE",modelTitle:"3D prikazi",modelLead:"3D modeli se prikazuju u profilu ličnosti za koju su pripremljeni.",modelHint:"Otvorite profil ličnosti i izaberite karticu „3D prikaz“ ako je model dostupan.",footerText:"Digitalni katalog kulturnog i istorijskog nasleđa.",toTop:"Nazad na vrh ↑",bio:"Biografija",photos:"Fotografije",grave:"Grobno mesto",model:"3D prikaz",qr:"QR kod",occupation:"Zvanje / zanimanje",parcel:"Parcela",graveNo:"Grobno mesto",openRoute:"Ruta do grobnog mesta",share:"Kopiraj link profila",copyDone:"Link je kopiran.",noBio:"Biografija još nije uneta.",noPhotos:"Za ovu ličnost još nema dodatih fotografija.",noGravePhoto:"Fotografija grobnog mesta nije uneta.",noModel:"3D model za ovu ličnost još nije dostupan.",qrHint:"Skenirajte QR kod telefonom da biste otvorili ovaj profil.",openMap:"Prikaži na mapi",noCoords:"Koordinate nisu unete.",noResults:"Nema rezultata za zadati pojam.",mapPopup:"Otvori profil",categoryLabels:{umetnici:"Umetnici",prosveta:"Prosveta",istorija:"Istorija","javne-licnosti":"Javne ličnosti",umetnost:"Umetnost",religija:"Religija",ostalo:"Ostalo"}}
};
const normalize = s => (s||"").toString().normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase().replace(/[đ]/g,"d").replace(/[љ]/g,"lj").replace(/[њ]/g,"nj").replace(/[ћ]/g,"c").replace(/[ч]/g,"c").replace(/[ш]/g,"s").replace(/[ж]/g,"z").replace(/[ђ]/g,"dj").replace(/[а]/g,"a").replace(/[б]/g,"b").replace(/[в]/g,"v").replace(/[г]/g,"g").replace(/[д]/g,"d").replace(/[е]/g,"e").replace(/[з]/g,"z").replace(/[и]/g,"i").replace(/[ј]/g,"j").replace(/[к]/g,"k").replace(/[м]/g,"m").replace(/[н]/g,"n").replace(/[о]/g,"o").replace(/[п]/g,"p").replace(/[р]/g,"r").replace(/[с]/g,"s").replace(/[т]/g,"t").replace(/[у]/g,"u").replace(/[ф]/g,"f").replace(/[х]/g,"h").replace(/[ц]/g,"c").replace(/[ы]/g,"y").replace(/[э]/g,"e").replace(/[ю]/g,"yu").replace(/[я]/g,"ya");
function nameOf(p){return script==="lat"?(p.ime_lat||p.ime):(p.ime||p.ime_lat)}
function jobOf(p){return script==="lat"?(p.zanimanje_lat||p.zanimanje):(p.zanimanje||p.zanimanje_lat)}
function bioOf(p){return script==="lat"?(p.biografija_lat||p.biografija):(p.biografija||p.biografija_lat)}
function tr(k){return T[script][k]||T.cir[k]||k}
function setLanguage(lang){script=lang;document.documentElement.lang=lang==="lat"?"sr-Latn":"sr-Cyrl";document.querySelectorAll("[data-lang]").forEach(b=>b.classList.toggle("active",b.dataset.lang===lang));document.querySelectorAll("[data-t]").forEach(el=>{const k=el.dataset.t;if(T[lang][k])el.textContent=T[lang][k]});$("searchInput").placeholder=tr("searchPlaceholder");$("categoryFilter").options[0].textContent=tr("allCategories");renderList();if(selectedId)showProfile(selectedId);refreshMapPopups()}
function categoryName(c){return T[script].categoryLabels?.[c]||c}
function photoMarkup(path,alt,cls=""){return path?`<img class="${cls}" src="${escapeAttr(path)}" alt="${escapeAttr(alt)}" loading="lazy" onerror="this.style.display='none'">`:`<div class="no-photo" aria-label="${escapeAttr(alt)}">✦</div>`}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function escapeAttr(s){return escapeHtml(s).replace(/`/g,"&#96;")}
function renderList(){
 const q=normalize($("searchInput").value.trim()),cat=$("categoryFilter").value;
 const filtered=people.filter(p=>{
   const hay=normalize([p.ime,p.ime_lat,p.zanimanje,p.zanimanje_lat,p.biografija,p.biografija_lat,p.parcela,p.grobno_mesto].join(" "));
   return (!q||hay.includes(q))&&(!cat||(p.kategorije||[]).includes(cat));
 }).sort((a,b)=>nameOf(a).localeCompare(nameOf(b),script==="lat"?"sr-Latn":"sr"));
 $("peopleCount").textContent=filtered.length;
 $("peopleList").innerHTML=filtered.length?filtered.map(p=>`<button class="person-row ${p.id===selectedId?"active":""}" data-person="${escapeAttr(p.id)}">${photoMarkup(p.fotografija,nameOf(p))}<span><strong>${escapeHtml(nameOf(p))}</strong><small>${escapeHtml(jobOf(p)||"")}${p.parcela?` · ${escapeHtml(tr("parcel"))} ${escapeHtml(p.parcela)}`:""}</small></span></button>`).join(""):`<div class="no-results">${tr("noResults")}</div>`;
 $("peopleList").querySelectorAll("[data-person]").forEach(b=>b.addEventListener("click",()=>showProfile(b.dataset.person)));
}
function profileUrl(p){const u=new URL(location.href);u.hash="licnost="+encodeURIComponent(p.id);return u.href}
function showProfile(id){
 const p=people.find(x=>x.id===id);if(!p)return;selectedId=id;renderList();
 const meta=[];if(p.godine)meta.push(`<span class="meta-pill">${escapeHtml(p.godine)}</span>`);if(p.parcela)meta.push(`<span class="meta-pill">${tr("parcel")}: ${escapeHtml(p.parcela)}</span>`);if(p.grobno_mesto)meta.push(`<span class="meta-pill">${tr("graveNo")}: ${escapeHtml(p.grobno_mesto)}</span>`);
 const mapRoute=(p.lat&&p.lon)?`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lon}`:"";
 $("profileContent").innerHTML=`<div class="profile-top"><div>${p.fotografija?`<img class="profile-portrait" src="${escapeAttr(p.fotografija)}" alt="${escapeAttr(nameOf(p))}">`:`<div class="portrait-placeholder">✦</div>`}</div><div><div class="profile-eyebrow">${escapeHtml(jobOf(p)||tr("occupation"))}</div><h2 class="profile-name">${escapeHtml(nameOf(p))}</h2><p class="profile-role">${escapeHtml(jobOf(p)||"")}</p><div class="profile-meta">${meta.join("")}</div><div class="profile-actions">${mapRoute?`<a class="small-btn" target="_blank" rel="noopener" href="${mapRoute}">↗ ${tr("openRoute")}</a>`:""}<button class="small-btn" id="copyProfile">⧉ ${tr("share")}</button></div></div></div>
 <div class="profile-tabs" role="tablist"><button class="tab active" data-tab="bio">${tr("bio")}</button><button class="tab" data-tab="photos">${tr("photos")}</button><button class="tab" data-tab="grave">${tr("grave")}</button><button class="tab" data-tab="model">${tr("model")}</button><button class="tab" data-tab="qr">${tr("qr")}</button></div><div class="tab-content" id="tabContent">${bioPanel(p)}</div>`;
 $("profileContent").querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>activateTab(p,b.dataset.tab)));
 $("copyProfile").addEventListener("click",async()=>{try{await navigator.clipboard.writeText(profileUrl(p));$("copyProfile").textContent="✓ "+tr("copyDone")}catch(e){prompt("Копирајте линк профила:",profileUrl(p))}});
 history.replaceState(null,"",`#licnost=${encodeURIComponent(id)}`);
}
function bioPanel(p){return `<h3>${tr("bio")}</h3><div class="bio-text">${escapeHtml(bioOf(p)||tr("noBio"))}</div>${p.izvori?`<p class="map-note">${escapeHtml(p.izvori)}</p>`:""}`}
function activateTab(p,tab){
 $("profileContent").querySelectorAll("[data-tab]").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));
 const el=$("tabContent");
 if(tab==="bio")el.innerHTML=bioPanel(p);
 if(tab==="photos"){
  const pics=[];if(p.fotografija)pics.push([p.fotografija,nameOf(p)]);if(p.fotografija_groba)pics.push([p.fotografija_groba,tr("grave")]);(p.fotografije_dodatne||[]).forEach((src,i)=>{if(src)pics.push([src,script==="lat"?"Dodatna fotografija "+(i+1):"Додатна фотографија "+(i+1)])});
  el.innerHTML=pics.length?`<div class="photo-gallery">${pics.map(([src,cap])=>`<figure><a href="${escapeAttr(src)}" target="_blank" rel="noopener"><img src="${escapeAttr(src)}" alt="${escapeAttr(cap)}"></a><figcaption>${escapeHtml(cap)}</figcaption></figure>`).join("")}</div>`:`<p>${tr("noPhotos")}</p>`;
 }
 if(tab==="grave"){
  el.innerHTML=`<h3>${tr("grave")}</h3>${p.parcela||p.grobno_mesto?`<p>${p.parcela?`${tr("parcel")}: <b>${escapeHtml(p.parcela)}</b>`:""} ${p.grobno_mesto?` · ${tr("graveNo")}: <b>${escapeHtml(p.grobno_mesto)}</b>`:""}</p>`:`<p>${tr("noCoords")}</p>`}${p.fotografija_groba?`<div class="photo-gallery"><figure><a href="${escapeAttr(p.fotografija_groba)}" target="_blank"><img src="${escapeAttr(p.fotografija_groba)}" alt="${tr("grave")}"></a><figcaption>${tr("grave")}</figcaption></figure></div>`:`<p>${tr("noGravePhoto")}</p>`}${p.lat&&p.lon?`<p><a class="small-btn" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lon}">↗ ${tr("openRoute")}</a></p>`:""}`;
 }
 if(tab==="model"){
  el.innerHTML=p.model_3d?`<h3>${tr("model")}</h3><model-viewer class="model-view" src="${escapeAttr(p.model_3d)}" camera-controls auto-rotate shadow-intensity="1" exposure="1" alt="3D модел"></model-viewer><p class="map-note">Користите миш или прст за окретање модела.</p>`:`<div class="model-missing"><h3>${tr("model")}</h3><p>${tr("noModel")}</p></div>`;
 }
 if(tab==="qr"){
  el.innerHTML=`<h3>${tr("qr")}</h3><div class="qr-wrap"><div class="qr-box" id="qrCode"></div><p class="qr-help">${tr("qrHint")}<br><br><a href="${escapeAttr(profileUrl(p))}" target="_blank" rel="noopener">${escapeHtml(nameOf(p))}</a></p></div>`;
  const qr=$("qrCode");if(window.QRCode){new QRCode(qr,{text:profileUrl(p),width:140,height:140,colorDark:"#191815",colorLight:"#ffffff",correctLevel:QRCode.CorrectLevel.M})}else qr.textContent=profileUrl(p);
 }
}
function initMap(){
 if(!window.L||!$("map")){$("map").innerHTML="<p>Мапа није могла да се учита. Проверите интернет везу.</p>";return}
 mapInstance=L.map("map").setView([44.63042,21.178519],16);
 L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:'&copy; OpenStreetMap'}).addTo(mapInstance);
 people.filter(p=>Number.isFinite(Number(p.lat))&&Number.isFinite(Number(p.lon))&&p.lat!==""&&p.lon!=="").forEach(p=>{
  const marker=L.marker([Number(p.lat),Number(p.lon)]).addTo(mapInstance).bindPopup(`<b>${escapeHtml(nameOf(p))}</b><br>${escapeHtml(p.parcela?tr("parcel")+" "+p.parcela:"")}${p.grobno_mesto?" · "+escapeHtml(tr("graveNo")+" "+p.grobno_mesto):""}<br><a href="#licnost=${encodeURIComponent(p.id)}" data-map-person="${escapeAttr(p.id)}">${tr("mapPopup")}</a>`);
  marker.on("popupopen",()=>{document.querySelectorAll("[data-map-person]").forEach(a=>a.onclick=e=>{e.preventDefault();showProfile(a.dataset.mapPerson);$("licnosti").scrollIntoView({behavior:"smooth"})})});
  mapMarkers.push({id:p.id,marker});
 });
}
function refreshMapPopups(){if(!mapInstance)return;mapMarkers.forEach(({id,marker})=>{const p=people.find(x=>x.id===id);if(p)marker.setPopupContent(`<b>${escapeHtml(nameOf(p))}</b><br><a href="#licnost=${encodeURIComponent(p.id)}" data-map-person="${escapeAttr(p.id)}">${tr("mapPopup")}</a>`)})}
function fillCategories(){
 const cats=[...new Set(people.flatMap(p=>p.kategorije||[]))].sort();$("categoryFilter").innerHTML=`<option value="">${tr("allCategories")}</option>`+cats.map(c=>`<option value="${escapeAttr(c)}">${escapeHtml(categoryName(c))}</option>`).join("");
}
function renderModelOverview(){
 const withModels=people.filter(p=>p.model_3d);
 $("modelsOverview").innerHTML=withModels.length?`<div class="photo-gallery">${withModels.map(p=>`<button class="person-row" data-model-person="${escapeAttr(p.id)}">${photoMarkup(p.fotografija,nameOf(p))}<span><strong>${escapeHtml(nameOf(p))}</strong><small>${tr("model")}</small></span></button>`).join("")}</div>`:`<p>${tr("modelHint")}</p>`;
 $("modelsOverview").querySelectorAll("[data-model-person]").forEach(b=>b.onclick=()=>{showProfile(b.dataset.modelPerson);activateTab(people.find(p=>p.id===b.dataset.modelPerson),"model");$("licnosti").scrollIntoView({behavior:"smooth"})});
}
async function start(){
 try{const res=await fetch(DATA_URL);if(!res.ok)throw new Error("HTTP "+res.status);people=await res.json();fillCategories();renderList();initMap();renderModelOverview();
  $("searchInput").addEventListener("input",renderList);$("categoryFilter").addEventListener("change",renderList);
  document.querySelectorAll("[data-lang]").forEach(b=>b.addEventListener("click",()=>{setLanguage(b.dataset.lang);fillCategories()}));
  $("menuToggle").addEventListener("click",()=>$("mainNav").classList.toggle("open"));
  $("mainNav").querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>$("mainNav").classList.remove("open")));
  const hash=decodeURIComponent(location.hash.replace(/^#licnost=/,""));if(hash&&people.some(p=>p.id===hash))showProfile(hash);
 }catch(err){$("peopleList").innerHTML='<p class="no-results">Каталог није учитан. Проверите да ли датотека data/licnosti.json постоји у репозиторијуму.</p>';console.error(err)}
}
start();