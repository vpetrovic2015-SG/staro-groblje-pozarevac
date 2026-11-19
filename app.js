const DATA_URL="data/licnosti.json?v=20261119-monument";
let people=[],selectedId=null,script="cir",mapInstance=null,mapMarkers=[];
const $=id=>document.getElementById(id);
const labels={
 cir:{all:"Све личности",mil:"Војна лица",polit:"Политичари",med:"Лекари и фармацеути",arts:"Уметници",benef:"Добротвори",edu:"Просветни радници",faith:"Духовна лица",sport:"Спорт",other:"Остало",bio:"Биографија",grave:"Фотографија гробног места",model:"3D приказ гробног места",map:"Локација на мапи",qr:"QR код",open:"Отвори у Google Maps",noPhoto:"Фотографија није унета",noModel:"3D модел још није доступан",noCoords:"Координате још нису унете",noBio:"Биографија још није унета",qrHelp:"Скенирајте QR код да бисте отворили ову страницу на мобилном уређају.",extra:"Додатне фотографије",allMap:"Мапа Старог гробља",search:"Претрага...",about:"О дигиталном водичу",download:"Преузимање"},
 lat:{all:"Sve ličnosti",mil:"Vojna lica",polit:"Političari",med:"Lekari i farmaceuti",arts:"Umetnici",benef:"Dobrotvori",edu:"Prosvetni radnici",faith:"Duhovna lica",sport:"Sport",other:"Ostalo",bio:"Biografija",grave:"Fotografija grobnog mesta",model:"3D prikaz grobnog mesta",map:"Lokacija na mapi",qr:"QR kod",open:"Otvori u Google Maps",noPhoto:"Fotografija nije uneta",noModel:"3D model još nije dostupan",noCoords:"Koordinate još nisu unete",noBio:"Biografija još nije uneta",qrHelp:"Skenirajte QR kod da biste otvorili ovu stranicu na mobilnom uređaju.",extra:"Dodatne fotografije",allMap:"Mapa Starog groblja",search:"Pretraga...",about:"O digitalnom vodiču",download:"Preuzimanje"},
 en:{all:"All people",mil:"Military figures",polit:"Politicians",med:"Doctors and pharmacists",arts:"Artists",benef:"Benefactors",edu:"Educators",faith:"Religious figures",sport:"Sports",other:"Other",bio:"Biography",grave:"Grave photograph",model:"3D grave model",map:"Map location",qr:"QR code",open:"Open in Google Maps",noPhoto:"Photograph not available",noModel:"3D model not yet available",noCoords:"Coordinates not yet available",noBio:"Biography not yet available",qrHelp:"Scan this QR code to open this profile on a mobile device.",extra:"Additional photographs",allMap:"Map of the Old Cemetery",search:"Search...",about:"About this digital guide",download:"Download"}
};
const categoryGroups=[
 {id:"all",keys:[],icon:"♟"},
 {id:"mil",keys:["oficiri","vojna-lica","vojnici"],icon:"⚔"},
 {id:"polit",keys:["politicari","političari"],icon:"♙"},
 {id:"med",keys:["lekari","lekari-i-farmaceuti","farmaceuti"],icon:"✚"},
 {id:"arts",keys:["umetnici","umetnost"],icon:"◆"},
 {id:"benef",keys:["dobrotvori","privrednici"],icon:"♥"},
 {id:"edu",keys:["prosveta","prosvetni","prosvetni-radnici"],icon:"▣"},
 {id:"faith",keys:["religija","duhovna-lica"],icon:"♟"},
 {id:"sport",keys:["sport","sportisti","boks"],icon:"🏆"},
 {id:"other",keys:["ostalo","istorija","javne-licnosti","advokati"],icon:"▤"}
];
const norm=s=>(s||"").toString().normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[đ]/g,"dj").replace(/[љ]/g,"lj").replace(/[њ]/g,"nj").replace(/[ћч]/g,"c").replace(/[ш]/g,"s").replace(/[ж]/g,"z").replace(/[а]/g,"a").replace(/[б]/g,"b").replace(/[в]/g,"v").replace(/[г]/g,"g").replace(/[д]/g,"d").replace(/[е]/g,"e").replace(/[з]/g,"z").replace(/[и]/g,"i").replace(/[ј]/g,"j").replace(/[к]/g,"k").replace(/[м]/g,"m").replace(/[н]/g,"n").replace(/[о]/g,"o").replace(/[п]/g,"p").replace(/[р]/g,"r").replace(/[с]/g,"s").replace(/[т]/g,"t").replace(/[у]/g,"u").replace(/[ф]/g,"f").replace(/[х]/g,"h").replace(/[ц]/g,"c").replace(/[ђ]/g,"dj");
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const name=p=>script==="cir"?(p.ime||p.ime_lat):script==="en"?(p.ime_en||p.ime_lat||p.ime):(p.ime_lat||p.ime);
const job=p=>script==="cir"?(p.zanimanje||p.zanimanje_lat):script==="en"?(p.zanimanje_en||p.zanimanje_lat||p.zanimanje):(p.zanimanje_lat||p.zanimanje);
const bio=p=>script==="cir"?(p.biografija||p.biografija_lat):script==="en"?(p.biografija_en||p.biografija_lat||p.biografija):(p.biografija_lat||p.biografija);
const L=k=>(labels[script]&&labels[script][k])||k;
function profileUrl(p){const u=new URL(location.href);u.hash="licnost="+encodeURIComponent(p.id);return u.href}
function openPortraitLightbox(src,alt){
 let overlay=document.getElementById("portraitLightbox");
 if(!overlay){
  overlay=document.createElement("div");overlay.id="portraitLightbox";overlay.className="portrait-lightbox";
  overlay.innerHTML='<button class="lightbox-close" type="button" aria-label="Затвори увећану фотографију">×</button><img class="lightbox-image" alt=""><div class="lightbox-caption"></div>';
  document.body.appendChild(overlay);
  const close=()=>{overlay.classList.remove("is-open");document.body.classList.remove("lightbox-open");};
  overlay.addEventListener("click",e=>{if(e.target===overlay||e.target.classList.contains("lightbox-close"))close();});
  document.addEventListener("keydown",e=>{if(e.key==="Escape")close();});
 }
 const image=overlay.querySelector(".lightbox-image");
 image.src=src;image.alt=alt||"";
 overlay.querySelector(".lightbox-caption").textContent=alt||"";
 overlay.classList.add("is-open");document.body.classList.add("lightbox-open");
}
document.addEventListener("click",e=>{
 const img=e.target.closest("#peopleList img.person-thumb, #profileContent img.main-portrait, #profileContent img.feature-image");
 if(!img||img.classList.contains("broken-image"))return;
 e.preventDefault();e.stopPropagation();openPortraitLightbox(img.currentSrc||img.src,img.alt);
},true);
function photo(path,alt,cls=""){return path?'<img class="'+cls+'" src="'+esc(path)+'" alt="'+esc(alt)+'" loading="lazy" decoding="async" onerror="this.classList.add(\'broken-image\');this.alt=\'Фотографија није пронађена: '+esc(path)+'\'">':'<div class="image-placeholder">'+L("noPhoto")+'</div>'}
function hasCoord(p){if(!p||p.lat===null||p.lon===null||p.lat===undefined||p.lon===undefined||p.lat===""||p.lon==="")return false;const lat=Number(p.lat),lon=Number(p.lon);return Number.isFinite(lat)&&Number.isFinite(lon)&&lat>=-90&&lat<=90&&lon>=-180&&lon<=180&&(lat!==0||lon!==0)}
function categoryKey(p){return (p.kategorije||[]).map(norm)}
function renderCategories(){
 const selected=$("categoryList");
 selected.innerHTML=categoryGroups.map(g=>'<button class="category-row '+(activeCategory===g.id?"active":"")+'" data-category="'+g.id+'"><span class="cat-icon">'+g.icon+'</span><span>'+L(g.id)+'</span></button>').join("");
 selected.querySelectorAll("[data-category]").forEach(b=>b.onclick=()=>{activeCategory=b.dataset.category;renderCategories();renderList()});
}
let activeCategory="all";
function matchesCategory(p){
 if(activeCategory==="all")return true;
 const g=categoryGroups.find(x=>x.id===activeCategory);if(!g)return true;
 const tags=categoryKey(p);return g.keys.some(k=>tags.includes(norm(k)));
}
function renderList(){
 const q=norm($("searchInput").value.trim());
 const list=people.filter(p=>matchesCategory(p)&&(!q||norm([p.ime,p.ime_lat,p.zanimanje,p.zanimanje_lat,p.biografija,p.biografija_lat,p.parcela,p.grobno_mesto].join(" ")).includes(q)));
 list.sort((a,b)=>name(a).localeCompare(name(b),script==="lat"?"sr-Latn":"sr"));
 $("peopleCount").textContent=list.length+" / "+people.length;
 $("peopleList").innerHTML=list.map(p=>'<button class="person-row '+(p.id===selectedId?"active":"")+'" data-id="'+esc(p.id)+'">'+(p.fotografija?photo(p.fotografija,name(p),"person-thumb"):'<span class="person-thumb empty-thumb">✦</span>')+'<span class="person-label"><strong>'+esc(name(p))+'</strong><small>'+esc(job(p)||"")+'</small>'+(p.godine?'<small>'+esc(p.godine)+'</small>':'')+'</span></button>').join("")||'<div class="empty-list">Нема резултата.</div>';
 $("peopleList").querySelectorAll("[data-id]").forEach(b=>b.onclick=()=>showProfile(b.dataset.id));
}
function mapCard(p){
 if(!hasCoord(p))return '<div class="panel-placeholder">'+L("noCoords")+'</div>';
 const lat=Number(p.lat),lon=Number(p.lon);
 return '<div class="mini-map" id="profileMap"></div><div class="coords">♧ '+lat.toFixed(6)+', '+lon.toFixed(6)+'</div><a class="maps-link" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query='+lat+','+lon+'">↗ '+L("open")+'</a>';
}
function qrCard(p){const qrUrl="https://api.qrserver.com/v1/create-qr-code/?size=112x112&margin=2&data="+encodeURIComponent(profileUrl(p));return '<section class="qr-card"><h3>'+L("qr")+'</h3><div class="qr-layout"><div class="qr-box" id="profileQr"><img src="'+esc(qrUrl)+'" alt="QR kod za profil" width="108" height="108" loading="lazy" onerror="this.remove()"></div><p>'+L("qrHelp")+'</p></div></section>'}
let modelViewerPromise=null;
function loadModelViewer(){
 if(customElements.get("model-viewer"))return Promise.resolve();
 if(modelViewerPromise)return modelViewerPromise;
 modelViewerPromise=new Promise((resolve,reject)=>{
  const s=document.createElement("script");s.type="module";
  s.src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js";
  s.onload=()=>customElements.whenDefined("model-viewer").then(resolve,reject);
  s.onerror=reject;document.head.appendChild(s);
 });
 return modelViewerPromise;
}
function activateLazyModelViewer(p){
 if(!p.model_3d)return;
 const viewer=document.querySelector("#model model-viewer");if(!viewer)return;
 let started=false;
 const load=()=>{if(started)return;started=true;loadModelViewer().catch(()=>{const note=document.createElement("p");note.className="panel-placeholder";note.textContent="3D приказ тренутно није доступан.";viewer.after(note);});};
 if("IntersectionObserver" in window){
  const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();load();}},{rootMargin:"200px"});
  observer.observe(viewer);
 }else load();
}
function showIntroduction(){document.querySelector(".app-shell").classList.add("is-hidden");document.getElementById("uvod").classList.remove("is-hidden");document.querySelectorAll("#mainNav a").forEach(a=>a.classList.toggle("nav-active",a.getAttribute("href")==="#uvod"));window.scrollTo({top:0,behavior:"auto"});}
function activateCatalogue(){document.getElementById("uvod").classList.add("is-hidden");document.querySelector(".app-shell").classList.remove("is-hidden");document.querySelectorAll("#mainNav a").forEach(a=>a.classList.toggle("nav-active",a.getAttribute("href")!=="#uvod"&&a.getAttribute("href")===location.hash));}
function showProfile(id){
 const p=people.find(x=>x.id===id);if(!p)return;selectedId=id;renderList();
 const extras=(p.fotografije_dodatne||[]).filter(Boolean);
 $("profileContent").innerHTML=
 '<div class="profile-layout"><div class="profile-main-column">'+
 '<div class="profile-heading"><div class="portrait-wrap">'+(p.fotografija?photo(p.fotografija,name(p),"main-portrait"):'<div class="portrait-placeholder">✦</div>')+(p.fotografija_tip==="ilustracija"?'<small class="portrait-note">'+(script==="en"?"Illustrative reconstruction":script==="lat"?"Ilustrativna rekonstrukcija":"Илустративна реконструкција")+'</small>':'')+'</div><div class="identity"><h1>'+esc(name(p))+'</h1><div class="occupation">'+esc(job(p)||"")+'</div>'+(p.godine?'<div class="years">'+esc(p.godine)+'</div>':'')+'<div class="profile-tabs"><a class="tab selected" href="#biografija">Биографија</a><a class="tab" href="#grobno">Гробно место</a><a class="tab" href="#model">3D модел</a><a class="tab" href="#profileMap">Локација</a></div></div></div>'+
 '<section class="biography-card" id="biografija"><h2>'+L("bio")+'</h2><div class="bio-text">'+esc(bio(p)||L("noBio"))+'</div>'+(p.izvori?'<small class="source-note">'+esc(p.izvori)+'</small>':'')+'</section>'+
 '<div class="profile-actions"><button class="action-button" type="button" onclick="document.getElementById(\'profileQr\')?.scrollIntoView({behavior:\'smooth\'})">▦ QR код</button>'+(hasCoord(p)?'<a class="action-button" href="https://www.google.com/maps/search/?api=1&query='+Number(p.lat)+','+Number(p.lon)+'" target="_blank" rel="noopener">⌖ Прикажи на мапи</a>':'')+'<button class="action-button" id="copyLink">↗ Подели</button><a class="action-button" href="#biografija" onclick="setLanguage(&quot;en&quot;);return false;">Biography (EN)</a></div>'+
 '</div><aside class="profile-visual-column">'+
 '<section class="feature-card grave-card" id="grobno"><h3>'+L("grave")+'</h3>'+(p.fotografija_groba?photo(p.fotografija_groba,L("grave"),"feature-image"):'<div class="panel-placeholder">'+L("noPhoto")+'</div>')+'</section>'+
 '<section class="feature-card model-card" id="model"><h3>'+L("model")+'</h3>'+(p.model_3d?'<model-viewer class="model-view" src="'+esc(p.model_3d)+'" camera-controls auto-rotate loading="lazy" reveal="auto" shadow-intensity="1" exposure="1" alt="3D модел гробног места"></model-viewer>':'<div class="panel-placeholder">'+L("noModel")+'</div>')+'</section>'+
 (hasCoord(p)?'<section class="feature-card map-card"><h3>'+L("map")+'</h3>'+mapCard(p)+'</section>':'')+qrCard(p)+
 '</aside></div>'+
 '<div class="profile-bottom-meta">'+(p.parcela?'<span>Парцела: '+esc(p.parcela)+'</span>':'')+(p.grobno_mesto?'<span>Гробно место: '+esc(p.grobno_mesto)+'</span>':'')+'</div>';
 activateLazyModelViewer(p);
 if(script==="en"&&!p.biografija_en){const source=document.querySelector(".biography-card .source-note");if(source)source.textContent="English translation is being prepared; the original Serbian text is retained for now.";}
 document.querySelectorAll(".profile-tabs .tab").forEach(a=>a.onclick=()=>{document.querySelectorAll(".profile-tabs .tab").forEach(x=>x.classList.remove("selected"));a.classList.add("selected")});
 if(hasCoord(p))initProfileMap(p);

 $("copyLink").onclick=async()=>{try{await navigator.clipboard.writeText(profileUrl(p));$("copyLink").textContent="Линк је копиран"}catch(e){prompt("Копирајте линк:",profileUrl(p))}};
 history.replaceState(null,"","#licnost="+encodeURIComponent(id));
}
let leafletPromise=null;
function loadLeaflet(){
 if(window.L)return Promise.resolve();
 if(leafletPromise)return leafletPromise;
 leafletPromise=new Promise((resolve,reject)=>{
  if(!document.querySelector("link[data-leaflet-css]")){
   const link=document.createElement("link");link.rel="stylesheet";link.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";link.dataset.leafletCss="true";document.head.appendChild(link);
  }
  const s=document.createElement("script");s.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";s.async=true;
  s.onload=resolve;s.onerror=reject;document.head.appendChild(s);
 });
 return leafletPromise;
}
let profileMapInstance=null;
function initProfileMap(p){
 if(profileMapInstance){profileMapInstance.remove();profileMapInstance=null;}
 const mapEl=$("profileMap");if(!mapEl)return;
 const lat=Number(p.lat),lon=Number(p.lon);
 const fallback=()=>{
  if(!mapEl.isConnected)return;
  const d=.0012;
  mapEl.outerHTML='<iframe class="mini-map map-fallback" title="Локација гробног места" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.openstreetmap.org/export/embed.html?bbox='+(lon-d)+','+(lat-d)+','+(lon+d)+','+(lat+d)+'&layer=mapnik&marker='+lat+','+lon+'"></iframe>';
 };
 loadLeaflet().then(()=>{
  if(!mapEl.isConnected)return;
  const map=L.map(mapEl,{scrollWheelZoom:false,zoomControl:true,preferCanvas:true}).setView([lat,lon],18);profileMapInstance=map;
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:20,attribution:"© OpenStreetMap"}).addTo(map);
  L.marker([lat,lon]).addTo(map).bindPopup(esc(name(p)));
  setTimeout(()=>{if(mapEl.isConnected)map.invalidateSize();},250);
 }).catch(fallback);
}
function initMapOnDemand(){
 const el=$("map");if(!el)return;
 let started=false;
 const run=()=>{if(started)return;started=true;loadLeaflet().then(initMap).catch(initMap);};
 if("IntersectionObserver" in window){
  const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();run();}},{rootMargin:"300px"});
  observer.observe(el);
 }else run();
}
function initMap(){
 const pts=people.filter(hasCoord);
 const mapEl=$("map");
 if(!mapEl)return;
 const bounds=pts.length?[
  [Math.min(...pts.map(p=>Number(p.lat)))-.0008,Math.min(...pts.map(p=>Number(p.lon)))-.0008],
  [Math.max(...pts.map(p=>Number(p.lat)))+.0008,Math.max(...pts.map(p=>Number(p.lon)))+.0008]
 ]:null;
 const showFallback=()=>{
  if(!bounds){mapEl.innerHTML='<div class="panel-placeholder">Координате гробних места још нису унете.</div>';return;}
  const sw=bounds[0],ne=bounds[1],center=[(sw[0]+ne[0])/2,(sw[1]+ne[1])/2];
  mapEl.innerHTML='<iframe class="map map-fallback" title="Мапа Старог гробља" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.openstreetmap.org/export/embed.html?bbox='+sw[1]+','+sw[0]+','+ne[1]+','+ne[0]+'&layer=mapnik&marker='+center[0]+','+center[1]+'"></iframe>';
 };
 if(!pts.length){showFallback();return;}
 if(!window.L){showFallback();return;}
 try{
  mapInstance=L.map(mapEl,{scrollWheelZoom:false,preferCanvas:true}).setView([44.6301,21.1791],17);
  const tileLayer=L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
   maxZoom:20,attribution:"© OpenStreetMap",crossOrigin:true
  });
  let tileLoaded=false;
  tileLayer.on("tileload",()=>{tileLoaded=true;});
  tileLayer.on("tileerror",()=>{if(!tileLoaded){setTimeout(()=>{if(!tileLoaded&&mapInstance){mapInstance.remove();mapInstance=null;showFallback();}},1800);}});
  tileLayer.addTo(mapInstance);
  pts.forEach(p=>{
   const marker=L.marker([Number(p.lat),Number(p.lon)]).addTo(mapInstance)
    .bindPopup('<b>'+esc(name(p))+'</b><br><a href="#licnost='+encodeURIComponent(p.id)+'" data-id="'+esc(p.id)+'">Отвори профил</a>');
   marker.on("popupopen",()=>{
    document.querySelectorAll("#map [data-id]").forEach(a=>a.onclick=e=>{
     e.preventDefault();showProfile(a.dataset.id);window.scrollTo({top:0,behavior:"smooth"});
    });
   });
  });
  mapInstance.fitBounds(pts.map(p=>[Number(p.lat),Number(p.lon)]),{padding:[24,24],maxZoom:18});
  setTimeout(()=>{if(mapInstance)mapInstance.invalidateSize();},250);
  setTimeout(()=>{if(!tileLoaded&&mapInstance){mapInstance.remove();mapInstance=null;showFallback();}},7000);
 }catch(e){console.error("Грешка при учитавању мапе:",e);if(mapInstance){mapInstance.remove();mapInstance=null;}showFallback();}
}
function setLanguage(lang){script=lang;document.documentElement.lang=lang==="lat"?"sr-Latn":lang==="en"?"en":"sr-Cyrl";document.querySelectorAll("[data-lang]").forEach(b=>b.classList.toggle("active",b.dataset.lang===lang));$("searchInput").placeholder=L("search");const t=lang==="en"?{navLatest:"Latest",latestEyebrow:"RECENT UPDATES",latestTitle:"Latest",latestIntro:"Follow the latest biographies, photographs, documents and other additions to the digital catalogue.",latestDate:"17 November 2026",latestRadomirTitle:"Biography of Radomir Milenić – Rus added",latestRadomirText:"The catalogue now includes the biography of a pre-war student and participant in the National Liberation Struggle. Details of his family tomb in plot 2, grave 109 N.B., and its map coordinates have also been added.",latestSearchDate:"17 November 2026",latestSearchTitle:"New “Seeking information…” section launched",latestSearchText:"A dedicated research section has been opened to seek information about Colonel Stojan Marjanović and Dr Živan Marković. Citizens and institutions are invited to contribute photographs, documents and testimonies.",introEyebrow:"DIGITAL CATALOGUE OF NOTABLE PEOPLE OF POŽAREVAC",introTitle:"Introduction",introPartnersTitle:"Cultural heritage and tourism institutions",introArchiveLink:"Historical Archives of Požarevac ↗",introTourismPozarevacLink:"Tourist Organization of the City of Požarevac ↗",introTourismSerbiaLink:"National Tourism Organisation of Serbia ↗",introFuneralServicesLink:"Public Funeral Services Company Belgrade ↗",introAsceLink:"Association of Significant Cemeteries in Europe (ASCE) ↗",introPhotoNote:"Some portraits on this website have been generated using artificial intelligence because authentic photographs were unavailable. These images are illustrative reconstructions only and must not be regarded as authentic historical portraits. We invite citizens, institutions and families who have photographs, written testimonies or any other documentation about the people featured here, as well as other individuals they believe made a significant contribution to the development of Požarevac or Serbia, to contact JKP Komunalne službe Požarevac. Every contribution is valuable in preserving their memory and enriching this database. Its continued development and preservation are in our shared interest.",introText:"The Old Cemetery in Požarevac is a valuable testament to the city’s history and to the people whose lives, work and achievements shaped its development. This digital catalogue preserves the memory of notable citizens of Požarevac and connects their biographies with photographs, burial places, archival material and available digital models.",searchEyebrow:"RESEARCH APPEAL",searchTitle:"Seeking information about…",searchIntro:"This section highlights two individuals we are researching for specific reasons, in response to the interest and needs of other institutions in Serbia. This targeted search is separate from the catalogue of notable people of Požarevac introduced above.",searchColonel:"Colonel Stojan Marjanović",searchColonelText:"We are seeking reliable biographical information, photographs, documents and other historical evidence.",searchDoctor:"Dr Živan Marković",searchDoctorText:"We are seeking information about his life and professional work, photographs, documents and family testimonies.",searchCall:"We invite citizens, descendants, researchers, collectors and institutions to help. If you have any information, photograph, letter or document that could contribute to this research, please contact JKP Komunalne službe Požarevac. Even the smallest clue may be important.",latestSretenDate:"19 November 2026",latestSretenTitle:"Boxer Sreten Mirković – Srele added to the catalogue",latestSretenText:"A biography has been added for the Požarevac boxer, 1979 European silver medallist and coach. His profile clearly states that he is buried at the New Cemetery in Požarevac, plot 9.",navMonuments:"One Monument – Many Stories…",monumentEyebrow:"HISTORY BEHIND THE MONUMENTS",monumentTitle:"One Monument – Many Stories…",monumentIntro:"Monuments are more than markers of burial places. They preserve family memories, bear witness to their time and open stories worth telling.",velikaKicker:"THE FIRST STORY IN THIS SERIES",velikaTitle:"Velika Stojanović – the woman said to have lived 118 years",velikaP1:"A 1977 article in the Požarevac newspaper Reč naroda presented Velika Stojanović as the oldest resident of Požarevac and its surroundings. The headline read: “The oldest woman of Požarevac is 118 years old.”",velikaP2:"Her gravestone also records that she died at the age of 118. Together, the newspaper account and the surviving monument preserve a record of an exceptionally long life.",velikaP3:"According to information supplied for this catalogue, Velika was a close relative of writer Slobodan Stojanović. This family connection is an additional lead for research and will be expanded when more reliable details are obtained.",velikaCemetery:"Cemetery",velikaCemeteryValue:"Old Cemetery in Požarevac",velikaPlot:"Plot",velikaGrave:"Grave",velikaSource:"Newspaper source",velikaSourceValue:"Reč naroda, Požarevac, 1977 (issue number and exact date unknown)",velikaNote:"The age of 118 is reported in the newspaper article and on the gravestone. No independent confirmation has been found that she was the officially recognised longevity record holder in the SFRY.",velikaCaptionNews:"Newspaper clipping from Reč naroda, 1977",velikaCaptionGrave:"Velika Stojanović’s grave – plot 5, grave 148 N.B.",introCta:"Explore the people",brand:"OLD CEMETERY",city:"POŽAREVAC",tagline:"A digital guide to history",navHome:"Home",navPeople:"Notable people",navMap:"Map",navCategories:"Categories",navAbout:"About",navDownload:"Download",downloadTitle:"Download documents",downloadIntro:"Documents and publications about the Old Cemetery in Požarevac.",docCultureTitle:"The Old Cemetery – Immovable Cultural Heritage (2025)",docCultureMeta:"Dr Miroljub Manojlović • 33 pages • PDF",docPamphletTitle:"Notable People of Požarevac – Through the Monuments",docPamphletMeta:"Pamphlet • DOCX",docPending:"The document has been received; public download hosting is being prepared.",categoriesTitle:"Categories",peopleTitle:"People",choosePerson:"Select a person",choosePersonHelp:"Biographies, photographs and grave details will appear here.",mapTitle:"Map of the Old Cemetery",mapNote:"Only people whose grave coordinates are recorded in the database are shown.",aboutTitle:"About this digital guide",aboutText:"This digital guide brings together biographies, photographs, burial places, an interactive map, QR codes and available 3D models of notable people buried at the Old Cemetery in Požarevac.",aboutCareText:"The staff of JKP Komunalne službe Požarevac treat the graves of these notable people with particular reverence, especially those who have no living descendants, as well as all burial places in the Old Cemetery. Professionalism, empathy and respectful conduct during funerals and other burial customs are our guiding principles and the foundation of our work. We invite you to visit us...",footerBrand:"OLD CEMETERY • POŽAREVAC"} :lang==="lat"?{navLatest:"Najnovije",latestEyebrow:"VESTI I DOPUNE",latestTitle:"Najnovije",latestIntro:"Ovde možete pratiti nove biografije, fotografije, dokumenta i druge sadržaje koji se dodaju u digitalni katalog.",latestDate:"17. novembar 2026.",latestRadomirTitle:"Dodata biografija Radomira Milenića – Rusa",latestRadomirText:"Katalog je dopunjen biografijom predratnog studenta i učesnika Narodnooslobodilačke borbe. Uneti su podaci o porodičnoj grobnici u parceli 2, grobno mesto 109 N.B, kao i koordinate za prikaz na mapi.",latestSearchDate:"17. novembar 2026.",latestSearchTitle:"Pokrenuta rubrika „U potrazi za…“",latestSearchText:"Otvorena je posebna istraživačka rubrika u kojoj se traže podaci o pukovniku Stojanu Marjanoviću i dr Živanu Markoviću. Pozivamo građane i ustanove da pomognu u prikupljanju fotografija, dokumenata i svedočanstava.",introEyebrow:"DIGITALNI KATALOG ZNAMENITIH POŽAREVLJANA",introTitle:"Uvodna reč",introPartnersTitle:"Korisne ustanove i turističke organizacije",introArchiveLink:"Istorijski arhiv Požarevac ↗",introTourismPozarevacLink:"Turistička organizacija Grada Požarevca ↗",introTourismSerbiaLink:"Turistička organizacija Srbije ↗",introFuneralServicesLink:"JKP Pogrebne usluge Beograd ↗",introAsceLink:"Asocijacija značajnih grobalja Evrope (ASCE) ↗",introPhotoNote:"Zbog nedostatka sačuvanih i dostupnih originalnih fotografija pojedinih ličnosti, na ovom sajtu korišćene su i fotografije generisane pomoću veštačke inteligencije. One imaju isključivo ilustrativni karakter i ne predstavljaju autentične istorijske portrete. Pozivamo građane, ustanove i porodice koje poseduju fotografije, pisana svedočanstva ili bilo koju drugu dokumentaciju o ličnostima predstavljenim na sajtu, kao i o drugim ljudima za koje smatraju da su svojim radom i delovanjem ostavili značajan trag u razvoju Požarevca ili Srbije, da kontaktiraju JKP „Komunalne službe“ Požarevac. Svaki prilog dragocen je za očuvanje uspomene i obogaćivanje ove baze. Njeno dopunjavanje i očuvanje zajedničko je dobro i interes svih nas.",introText:"Staro groblje u Požarevcu predstavlja dragoceno svedočanstvo istorije grada i ljudi koji su svojim životom, radom i delom ostavili trag u njegovom razvoju. Ovaj digitalni katalog čuva uspomenu na znamenite Požarevljane i povezuje njihove biografije sa fotografijama, mestima počinka, arhivskom građom i dostupnim digitalnim modelima.",searchEyebrow:"ISTRAŽIVAČKA POTRAGA",searchTitle:"U potrazi za…",searchIntro:"Ova rubrika izdvaja dve ličnosti za kojima tragamo iz posebnih istraživačkih razloga, povodom interesovanja i potreba drugih ustanova u Srbiji. Potraga je ciljana i odvojena od kataloga znamenitih Požarevljana predstavljenih u uvodnoj reči.",searchColonel:"Pukovnik Stojan Marjanović",searchColonelText:"Tragamo za pouzdanim biografskim podacima, fotografijama, dokumentima i drugim istorijskim svedočanstvima.",searchDoctor:"Dr Živan Marković",searchDoctorText:"Tragamo za podacima o životu i profesionalnom radu, fotografijama, dokumentima i porodičnim svedočanstvima.",searchCall:"Pozivamo građane, potomke, istraživače, kolekcionare i ustanove da nam pomognu. Ako posedujete bilo kakav podatak, fotografiju, pismo ili dokument koji bi mogao da doprinese istraživanju, molimo vas da kontaktirate JKP „Komunalne službe“ Požarevac. I najmanji trag može biti važan.",latestSretenDate:"19. novembar 2026.",latestSretenTitle:"U katalog uvršten bokser Sreten Mirković – Srele",latestSretenText:"Dodata je biografija požarevačkog boksera, evropskog vicešampiona iz 1979. godine i trenera. U profilu je jasno navedeno da je sahranjen na Novom groblju u Požarevcu, parcela 9.",navMonuments:"Jedan spomenik – više priča…",monumentEyebrow:"PRIČE KOJE ČUVAJU SPOMENICI",monumentTitle:"Jedan spomenik – više priča…",monumentIntro:"Spomenici nisu samo obeležja mesta počinka. Oni čuvaju porodične uspomene, svedoče o vremenu i otvaraju priče koje zaslužuju da budu ispričane.",velikaKicker:"PRVA PRIČA U RUBRICI",velikaTitle:"Velika Stojanović – žena kojoj je pripisano 118 godina života",velikaP1:"U novinskom članku lista „Reč naroda“ iz Požarevca, objavljenom 1977. godine, Velika Stojanović predstavljena je kao najstarija stanovnica Požarevca i okoline. Naslov teksta glasi: „Najstarija Požarevljanka ima 118 godina“.",velikaP2:"I njen nadgrobni spomenik beleži da je preminula u 118. godini. Novinski zapis i sačuvani spomenik tako zajedno čuvaju svedočanstvo o izuzetno dugom životu jedne Požarevljanke.",velikaP3:"Prema podacima dostavljenim za ovaj katalog, Velika je bila bliska rođaka pisca Slobodana Stojanovića. Ta porodična veza predstavlja dodatni trag za istraživanje i biće dopunjena kada se pribave pouzdaniji podaci.",velikaCemetery:"Groblje",velikaCemeteryValue:"Staro groblje u Požarevcu",velikaPlot:"Parcela",velikaGrave:"Grobno mesto",velikaSource:"Novinski izvor",velikaSourceValue:"„Reč naroda“, Požarevac, 1977. (broj i datum izdanja nepoznati)",velikaNote:"Navod o 118 godina prenet je iz novinskog članka i sa nadgrobnog spomenika. Nije pronađena nezavisna potvrda da je bila zvanični rekorder dugovečnosti u SFRJ.",velikaCaptionNews:"Novinski isečak iz lista „Reč naroda“, 1977. godina",velikaCaptionGrave:"Grobno mesto Velike Stojanović – parcela 5, grob 148 N.B.",introCta:"Pogledajte ličnosti",brand:"STARO GROBLJE",city:"POŽAREVAC",tagline:"Digitalni vodič kroz istoriju",navHome:"Početna",navPeople:"Ličnosti",navMap:"Mapa",navCategories:"Kategorije",navAbout:"O projektu",navDownload:"Preuzimanje",downloadTitle:"Preuzimanje dokumenata",downloadIntro:"Dokumenti i publikacije o Starom groblju u Požarevcu.",docCultureTitle:"Staro groblje – nepokretni spomenik kulture (2025)",docCultureMeta:"dr Miroljub Manojlović • 33 strane • PDF",docPamphletTitle:"Poznati Požarevljani – kroz spomenike poznatih ličnosti",docPamphletMeta:"Pamflet • DOCX",docPending:"Dokument je primljen; postavljanje datoteke za javno preuzimanje je u toku.",categoriesTitle:"Kategorije",peopleTitle:"Ličnosti",choosePerson:"Izaberite ličnost",choosePersonHelp:"Biografija, fotografije i podaci o grobnom mestu prikazaće se ovde.",mapTitle:"Mapa Starog groblja",mapNote:"Prikazane su samo ličnosti za koje su koordinate grobnog mesta unete u bazu.",aboutTitle:"O digitalnom vodiču",aboutText:"Digitalni vodič povezuje biografije, fotografije, grobna mesta, interaktivnu mapu, QR kodove i dostupne 3D prikaze znamenitih ličnosti sahranjenih na Starom groblju u Požarevcu.",aboutCareText:"Radnici JKP „Komunalne službe“ Požarevac se sa posebnim pijetetom odnose prema grobnim mestima ovih ličnosti, naročito onih koji nemaju više živih potomaka, ali takođe i prema svim grobnim mestima na Starom groblju. Profesionalizam, empatija i kultura u ponašanju tokom sahrana i drugih običaja vezanih za sahranjivanje, naš je osnovni princip delovanja i ideja vodilja. Dođite nam u posetu...",footerBrand:"STARO GROBLJE • POŽAREVAC"}: {navLatest:"Најновије",latestEyebrow:"НОВОСТИ И ДОПУНЕ",latestTitle:"Најновије",latestIntro:"Овде можете пратити нове биографије, фотографије, документа и друге садржаје који се додају у дигитални каталог.",latestDate:"17. новембар 2026.",latestRadomirTitle:"Додата биографија Радомира Миленића – Руса",latestRadomirText:"Каталог је допуњен биографијом предратног студента и учесника Народноослободилачке борбе. Унети су подаци о породичној гробници у парцели 2, гробно место 109 N.B, као и координате за приказ на мапи.",latestSearchDate:"17. новембар 2026.",latestSearchTitle:"Покренута рубрика „У потрази за…“",latestSearchText:"Отворена је посебна истраживачка рубрика у којој се траже подаци о пуковнику Стојану Марјановићу и др Живану Марковићу. Позивамо грађане и установе да помогну у прикупљању фотографија, докумената и сведочанстава.",introEyebrow:"ДИГИТАЛНИ КАТАЛОГ ЗНАМЕНИТИХ ПОЖАРЕВЉАНА",introTitle:"Уводна реч",introPartnersTitle:"Корисне установе и туристичке организације",introArchiveLink:"Историјски архив Пожаревац ↗",introTourismPozarevacLink:"Туристичка организација Града Пожаревца ↗",introTourismSerbiaLink:"Туристичка организација Србије ↗",introFuneralServicesLink:"ЈКП „Погребне услуге“ Београд ↗",introAsceLink:"Асоцијација значајних гробаља Европе (ASCE) ↗",introPhotoNote:"Услед недостатка сачуваних и доступних оригиналних фотографија појединих личности, на овом сајту су коришћене и фотографије генерисане уз помоћ вештачке интелигенције. Оне имају искључиво илустративни карактер и не представљају аутентичне историјске портрете тих личности. Позивамо све грађане, установе и породице које поседују фотографије, писана сведочанства или било коју другу документацију о личностима представљеним на овом сајту, као и о другим људима за које сматрају да су својим радом и деловањем оставили значајан траг у развоју Пожаревца или Србије, да контактирају ЈКП „Комуналне службе“ Пожаревац. Сваки прилог и сведочанство драгоцени су за очување успомене и даље обогаћивање ове базе података. Њено допуњавање и очување заједничко је добро и интерес свих нас.",introText:"Старо гробље у Пожаревцу представља драгоцено сведочанство историје града и људи који су својим животом, радом и делом оставили траг у његовом развоју. Овај дигитални каталог чува успомену на знамените Пожаревљане и повезује њихове биографије са фотографијама, местима починка, архивском грађом и доступним дигиталним моделима.",searchEyebrow:"ИСТРАЖИВАЧКА ПОТРАГА",searchTitle:"У потрази за…",searchIntro:"Ова рубрика издваја две личности за којима трагамо из посебних истраживачких разлога, поводом интересовања и потреба других установа у Србији. Потрага је циљана и одвојена од каталога знаменитих Пожаревљана представљених у уводној речи.",searchColonel:"Пуковник Стојан Марјановић",searchColonelText:"Трагамо за поузданим биографским подацима, фотографијама, документима и другим историјским сведочанствима.",searchDoctor:"Др Живан Марковић",searchDoctorText:"Трагамо за подацима о животу и професионалном раду, фотографијама, документима и породичним сведочанствима.",searchCall:"Позивамо грађане, потомке, истраживаче, колекционаре и установе да нам помогну. Ако поседујете било какав податак, фотографију, писмо или документ који би могао да допринесе истраживању, молимо вас да контактирате ЈКП „Комуналне службе“ Пожаревац. И најмањи траг може бити важан.",latestSretenDate:"19. новембар 2026.",latestSretenTitle:"У каталог уврштен боксер Сретен Мирковић – Среле",latestSretenText:"Додата је биографија пожаревачког боксера, европског вицешампиона из 1979. године и тренера. У профилу је јасно наведено да је сахрањен на Новом гробљу у Пожаревцу, парцела 9.",navMonuments:"Један споменик – више прича…",monumentEyebrow:"ПРИЧЕ КОЈЕ ЧУВАЈУ СПОМЕНИЦИ",monumentTitle:"Један споменик – више прича…",monumentIntro:"Споменици нису само обележја места починка. Они чувају породичне успомене, сведоче о времену и отварају приче које заслужују да буду испричане.",velikaKicker:"ПРВА ПРИЧА У РУБРИЦИ",velikaTitle:"Велика Стојановић – жена којој је приписано 118 година живота",velikaP1:"У новинском чланку листа „Реч народа“ из Пожаревца, објављеном 1977. године, Велика Стојановић представљена је као најстарија становница Пожаревца и околине. Наслов текста гласи: „Најстарија Пожаревљанка има 118 година“.",velikaP2:"И њен надгробни споменик бележи да је преминула у 118. години. Новински запис и сачувани споменик тако заједно чувају сведочанство о изузетно дугом животу једне Пожаревљанке.",velikaP3:"Према подацима достављеним за овај каталог, Велика је била блиска рођака писца Слободана Стојановића. Та породична веза представља додатни траг за истраживање и биће допуњена када се прибаве поузданији подаци.",velikaCemetery:"Гробље",velikaCemeteryValue:"Старо гробље у Пожаревцу",velikaPlot:"Парцела",velikaGrave:"Гробно место",velikaSource:"Новински извор",velikaSourceValue:"„Реч народа“, Пожаревац, 1977. (број и датум издања непознати)",velikaNote:"Навод о 118 година пренет је из новинског чланка и са надгробног споменика. Није пронађена независна потврда да је била званични рекордер дуговечности у СФРЈ.",velikaCaptionNews:"Новински исечак из листа „Реч народа“, 1977. година",velikaCaptionGrave:"Гробно место Велике Стојановић – парцела 5, гроб 148 N.B.",introCta:"Погледајте личности",brand:"СТАРО ГРОБЉЕ",city:"ПОЖАРЕВАЦ",tagline:"Дигитални водич кроз историју",navHome:"Почетна",navPeople:"Личности",navMap:"Мапа",navCategories:"Категорије",navAbout:"О пројекту",navDownload:"Преузимање",downloadTitle:"Преузимање докумената",downloadIntro:"Документи и публикације о Старом гробљу у Пожаревцу.",docCultureTitle:"Старо гробље – непокретни споменик културе (2025)",docCultureMeta:"др Миролуб Манојловић • 33 стране • PDF",docPamphletTitle:"Познати Пожаревљани – кроз споменике познатих личности",docPamphletMeta:"Памфлет • DOCX",docPending:"Документ је примљен; постављање датотеке за јавно преузимање је у току.",categoriesTitle:"Категорије",peopleTitle:"Личности",choosePerson:"Изаберите личност",choosePersonHelp:"Биографија, фотографије и подаци о гробном месту приказаће се овде.",mapTitle:"Мапа Старог гробља",mapNote:"Приказане су само личности за које су координате гробног места унете у базу.",aboutTitle:"О дигиталном водичу",aboutText:"Дигитални водич повезује биографије, фотографије, гробна места, интерактивну мапу, QR кодове и доступне 3D приказе знаменитих личности сахрањених на Старом гробљу у Пожаревцу.",aboutCareText:"Радници ЈКП „Комуналне службе“ Пожаревац се са посебним пијететом односе према гробним местима ових личности, нарочито оних који немају више живих потомака, али такође и према свим гробним местима на Старом гробљу. Професионализам, емпатија и култура у понашању током сахрана и других обичаја везаних за сахрањивање, наш је основни принцип деловања и идеја водиља. Дођите нам у посету...",footerBrand:"СТАРО ГРОБЉЕ • ПОЖАРЕВАЦ"};document.querySelectorAll("[data-i18n]").forEach(el=>{const k=el.dataset.i18n;if(t[k])el.textContent=t[k]});renderCategories();renderList();if(selectedId)showProfile(selectedId)}
async function start(){
 try{const r=await fetch(DATA_URL);if(!r.ok)throw new Error(r.status);people=await r.json();$("searchInput").placeholder=L("search");renderCategories();renderList();initMapOnDemand();$("searchInput").addEventListener("input",renderList);document.querySelectorAll("[data-lang]").forEach(b=>b.onclick=()=>setLanguage(b.dataset.lang));$("menuToggle").onclick=()=>$("mainNav").classList.toggle("open");const id=decodeURIComponent(location.hash.replace(/^#licnost=/,""));if(people.some(p=>p.id===id)){activateCatalogue();showProfile(id);}else{showIntroduction();}document.querySelectorAll('#mainNav a, .intro-cta').forEach(link=>link.addEventListener('click',e=>{const target=link.getAttribute('href');if(target==="#uvod"){e.preventDefault();showIntroduction();history.replaceState(null,"","#uvod");}else if(target&&target.startsWith("#")){e.preventDefault();activateCatalogue();history.replaceState(null,"",target);const el=document.querySelector(target);if(el)el.scrollIntoView({behavior:"smooth",block:"start"});}}));}
 catch(e){$("peopleList").textContent="Каталог није учитан. Проверите data/licnosti.json.";console.error(e)}
}
start();