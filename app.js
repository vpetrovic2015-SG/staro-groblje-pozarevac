const DATA_URL="data/licnosti.json?v=20261108";
let people=[],selectedId=null,script="cir",mapInstance=null,mapMarkers=[];
const $=id=>document.getElementById(id);
const labels={
 cir:{all:"Све личности",mil:"Војна лица",polit:"Политичари",med:"Лекари и фармацеути",arts:"Уметници",benef:"Добротвори",edu:"Просветни радници",faith:"Духовна лица",other:"Остало",bio:"Биографија",grave:"Фотографија гробног места",model:"3D приказ гробног места",map:"Локација на мапи",qr:"QR код",open:"Отвори у Google Maps",noPhoto:"Фотографија није унета",noModel:"3D модел још није доступан",noCoords:"Координате још нису унете",noBio:"Биографија још није унета",qrHelp:"Скенирајте QR код да бисте отворили ову страницу на мобилном уређају.",extra:"Додатне фотографије",allMap:"Мапа Старог гробља",search:"Претрага...",about:"О дигиталном водичу"},
 lat:{all:"Sve ličnosti",mil:"Vojna lica",polit:"Političari",med:"Lekari i farmaceuti",arts:"Umetnici",benef:"Dobrotvori",edu:"Prosvetni radnici",faith:"Duhovna lica",other:"Ostalo",bio:"Biografija",grave:"Fotografija grobnog mesta",model:"3D prikaz grobnog mesta",map:"Lokacija na mapi",qr:"QR kod",open:"Otvori u Google Maps",noPhoto:"Fotografija nije uneta",noModel:"3D model još nije dostupan",noCoords:"Koordinate još nisu unete",noBio:"Biografija još nije uneta",qrHelp:"Skenirajte QR kod da biste otvorili ovu stranicu na mobilnom uređaju.",extra:"Dodatne fotografije",allMap:"Mapa Starog groblja",search:"Pretraga...",about:"O digitalnom vodiču"}
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
 {id:"other",keys:["ostalo","istorija","javne-licnosti","advokati"],icon:"▤"}
];
const norm=s=>(s||"").toString().normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[đ]/g,"dj").replace(/[љ]/g,"lj").replace(/[њ]/g,"nj").replace(/[ћч]/g,"c").replace(/[ш]/g,"s").replace(/[ж]/g,"z").replace(/[а]/g,"a").replace(/[б]/g,"b").replace(/[в]/g,"v").replace(/[г]/g,"g").replace(/[д]/g,"d").replace(/[е]/g,"e").replace(/[з]/g,"z").replace(/[и]/g,"i").replace(/[ј]/g,"j").replace(/[к]/g,"k").replace(/[м]/g,"m").replace(/[н]/g,"n").replace(/[о]/g,"o").replace(/[п]/g,"p").replace(/[р]/g,"r").replace(/[с]/g,"s").replace(/[т]/g,"t").replace(/[у]/g,"u").replace(/[ф]/g,"f").replace(/[х]/g,"h").replace(/[ц]/g,"c").replace(/[ђ]/g,"dj");
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const name=p=>script==="lat"?(p.ime_lat||p.ime):(p.ime||p.ime_lat);
const job=p=>script==="lat"?(p.zanimanje_lat||p.zanimanje):(p.zanimanje||p.zanimanje_lat);
const bio=p=>script==="lat"?(p.biografija_lat||p.biografija):(p.biografija||p.biografija_lat);
const L=k=>labels[script][k]||k;
function profileUrl(p){const u=new URL(location.href);u.hash="licnost="+encodeURIComponent(p.id);return u.href}
function photo(path,alt,cls=""){return path?'<img class="'+cls+'" src="'+esc(path)+'" alt="'+esc(alt)+'" loading="lazy" onerror="this.classList.add(\'broken-image\');this.alt=\'Фотографија није пронађена: '+esc(path)+'\'">':'<div class="image-placeholder">'+L("noPhoto")+'</div>'}
function hasCoord(p){return Number.isFinite(Number(p.lat))&&Number.isFinite(Number(p.lon))&&p.lat!==""&&p.lon!==""}
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
function showProfile(id){
 const p=people.find(x=>x.id===id);if(!p)return;selectedId=id;renderList();
 const extras=(p.fotografije_dodatne||[]).filter(Boolean);
 $("profileContent").innerHTML=
 '<div class="profile-heading"><div class="portrait-wrap">'+(p.fotografija?photo(p.fotografija,name(p),"main-portrait"):'<div class="portrait-placeholder">✦</div>')+'</div><div class="identity"><h1>'+esc(name(p))+'</h1><div class="occupation">'+esc(job(p)||"")+'</div>'+(p.godine?'<div class="years">'+esc(p.godine)+'</div>':'')+'<div class="profile-tabs"><a class="tab selected" href="#bio">Почетна</a><a class="tab" href="#biografija">Биографија</a><a class="tab" href="#grobno">Гробно место</a><a class="tab" href="#model">3D приказ</a><a class="tab" href="#profileMap">Карта</a></div></div></div>'+
 '<div class="feature-grid"><section class="feature-card" id="grobno"><h3>'+L("grave")+'</h3>'+(p.fotografija_groba?photo(p.fotografija_groba,L("grave"),"feature-image"):'<div class="panel-placeholder">'+L("noPhoto")+'</div>')+'</section>'+
 '<section class="feature-card model-card" id="model"><h3>'+L("model")+'</h3>'+(p.model_3d?'<model-viewer class="model-view" src="'+esc(p.model_3d)+'" camera-controls auto-rotate loading="eager" reveal="auto" shadow-intensity="1" exposure="1" alt="3D модел гробног места"></model-viewer>':'<div class="panel-placeholder">'+L("noModel")+'</div>')+'</section>'+
 '<div class="side-feature"><section class="feature-card map-card"><h3>'+L("map")+'</h3>'+mapCard(p)+'</section>'+qrCard(p)+'</div></div>'+
 '<section class="biography-card" id="biografija"><h2>'+L("bio")+'</h2><div class="bio-text">'+esc(bio(p)||L("noBio"))+'</div>'+(p.izvori?'<small class="source-note">'+esc(p.izvori)+'</small>':'')+'</section>'+
 (extras.length?'<section class="extra-card"><h2>'+L("extra")+'</h2><div class="extra-gallery">'+extras.map((src,i)=>'<a href="'+esc(src)+'" target="_blank" rel="noopener">'+photo(src,L("extra")+" "+(i+1),"extra-image")+'</a>').join("")+'</div></section>':'')+
 '<div class="profile-bottom-meta">'+(p.parcela?'<span>Парцела: '+esc(p.parcela)+'</span>':'')+(p.grobno_mesto?'<span>Гробно место: '+esc(p.grobno_mesto)+'</span>':'')+'<button id="copyLink">Копирај линк профила</button></div>';
 document.querySelectorAll(".profile-tabs .tab").forEach(a=>a.onclick=()=>{document.querySelectorAll(".profile-tabs .tab").forEach(x=>x.classList.remove("selected"));a.classList.add("selected")});
 if(hasCoord(p)){const mapEl=$("profileMap");if(mapEl){if(window.L){const m=L.map(mapEl,{scrollWheelZoom:false,zoomControl:true}).setView([Number(p.lat),Number(p.lon)],18);L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:20,attribution:"© OpenStreetMap"}).addTo(m);L.marker([Number(p.lat),Number(p.lon)]).addTo(m);setTimeout(()=>m.invalidateSize(),150)}else{const a=Number(p.lat),o=Number(p.lon),d=.0012;mapEl.outerHTML='<iframe class="mini-map map-fallback" title="Lokacija grobnog mesta" loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox='+(o-d)+','+(a-d)+','+(o+d)+','+(a+d)+'&layer=mapnik&marker='+a+','+o+'"></iframe>'}}}

 $("copyLink").onclick=async()=>{try{await navigator.clipboard.writeText(profileUrl(p));$("copyLink").textContent="Линк је копиран"}catch(e){prompt("Копирајте линк:",profileUrl(p))}};
 history.replaceState(null,"","#licnost="+encodeURIComponent(id));
}
function initMap(){
 if(!window.L){const pts=people.filter(hasCoord);if(pts.length){const lats=pts.map(p=>Number(p.lat)),lons=pts.map(p=>Number(p.lon));const minLat=Math.min(...lats)-.0008,maxLat=Math.max(...lats)+.0008,minLon=Math.min(...lons)-.0008,maxLon=Math.max(...lons)+.0008;$("map").innerHTML='<iframe class="map map-fallback" title="Mapa Starog groblja" loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox='+minLon+','+minLat+','+maxLon+','+maxLat+'&layer=mapnik"></iframe>'}return;}mapInstance=L.map("map").setView([44.6301,21.1791],17);L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:20,attribution:"© OpenStreetMap"}).addTo(mapInstance);
 people.filter(hasCoord).forEach(p=>{const marker=L.marker([Number(p.lat),Number(p.lon)]).addTo(mapInstance).bindPopup('<b>'+esc(name(p))+'</b><br><a href="#licnost='+encodeURIComponent(p.id)+'" data-id="'+esc(p.id)+'">Отвори профил</a>');marker.on("popupopen",()=>{document.querySelectorAll("#map [data-id]").forEach(a=>a.onclick=e=>{e.preventDefault();showProfile(a.dataset.id);window.scrollTo({top:0,behavior:"smooth"})})})});
}
function setLanguage(lang){script=lang;document.documentElement.lang=lang==="lat"?"sr-Latn":"sr-Cyrl";document.querySelectorAll("[data-lang]").forEach(b=>b.classList.toggle("active",b.dataset.lang===lang));$("searchInput").placeholder=L("search");renderCategories();renderList();if(selectedId)showProfile(selectedId)}
async function start(){
 try{const r=await fetch(DATA_URL);if(!r.ok)throw new Error(r.status);people=await r.json();$("searchInput").placeholder=L("search");renderCategories();renderList();initMap();$("searchInput").addEventListener("input",renderList);document.querySelectorAll("[data-lang]").forEach(b=>b.onclick=()=>setLanguage(b.dataset.lang));$("menuToggle").onclick=()=>$("mainNav").classList.toggle("open");const id=decodeURIComponent(location.hash.replace(/^#licnost=/,""));showProfile(people.some(p=>p.id===id)?id:(people[0]?.id));}
 catch(e){$("peopleList").textContent="Каталог није учитан. Проверите data/licnosti.json.";console.error(e)}
}
start();