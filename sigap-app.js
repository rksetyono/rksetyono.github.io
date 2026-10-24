/* SIGAP JUWATA — mesin aplikasi (dimuat oleh index.html) */

const map=L.map('map',{preferCanvas:false,maxZoom:22,minZoom:3,zoomControl:false,zoomSnap:0.1,zoomDelta:1}).setView([-2.5,118],5);
map.createPane('bndPane');map.getPane('bndPane').style.zIndex=350;
map._controlCorners.bottomcenter=L.DomUtil.create('div','leaflet-bottom leaflet-center',map._controlContainer);
L.control.zoom({position:'bottomright'}).addTo(map);
L.control.scale({position:'bottomleft',metric:true,imperial:false}).addTo(map);
const bases={
 gmap:L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{subdomains:'0123',maxZoom:20,attribution:'© Google Maps'}),
 osm:L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}),
 sat:L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,attribution:'Esri World Imagery'}),
 dark:L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,attribution:'Esri'}),
 topo:L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,attribution:'Esri'})
};
let curBase=bases.gmap; curBase.addTo(map);
L.control.layers({'Google Maps':bases.gmap,'Satelit Esri':bases.sat,'OSM':bases.osm,'Gelap':bases.dark,'Topo':bases.topo},null,{position:'topright'}).addTo(map);
function chipState(name,on){document.querySelectorAll('#quick button').forEach(b=>{if(b.textContent.includes(name))b.classList.toggle('on',!!on)})}
function setBase(k){map.removeLayer(curBase);curBase=bases[k];curBase.addTo(map)}
function toast(m){const t=document.getElementById('toast');t.textContent=m;t.style.display='block';setTimeout(()=>t.style.display='none',4200)}
const INDO_BOUNDS=[[-11,95],[6,141]];
function fitIndo(){const z=indoFillZoom();if(z!==null){map.setView(L.latLngBounds(INDO_BOUNDS).getCenter(),z)}else{map.fitBounds(INDO_BOUNDS,{padding:[12,12]})}}
function flyIndo(){fitIndo()}
setTimeout(()=>{fitIndo();applyMinZoom();applyViewBounds()},400);
var myLocMark=null,myLocCircle=null;
function clearMyLoc(){if(myLocMark){map.removeLayer(myLocMark);myLocMark=null}if(myLocCircle){map.removeLayer(myLocCircle);myLocCircle=null}chipState('Lokasi Saya',false)}
function havKm(a,b,c,d){const R=6371,t=Math.PI/180,x=(c-a)*t,y=(d-b)*t,s=Math.sin(x/2)**2+Math.cos(a*t)*Math.cos(c*t)*Math.sin(y/2)**2;return 2*R*Math.asin(Math.sqrt(s))}
let locHelpPopup=null;
function locHelp(judul,isi){if(!locHelpPopup)locHelpPopup=L.popup(avPopOpts());locHelpPopup.setLatLng(map.getCenter()).setContent('<b style="display:block;font-size:14px;line-height:1.3;padding-right:20px">'+judul+'</b><div style="font-size:12px;line-height:1.6;margin-top:6px">'+isi+'</div><button class="mini" style="display:block;width:100%;text-align:center;padding:7px 0;margin-top:10px" onclick="map.closePopup();lokasiSaya()">🔁 Coba Lagi</button>').openOn(map)}
function lokasiSaya(){
  if(!navigator.geolocation){locHelp('Lokasi Tidak Tersedia','Browser ini tidak menyediakan geolokasi. Buka situs ini di Chrome untuk memakai fitur Lokasi Saya.');return}
  const mulai=()=>{toast('Mencari lokasi Anda…');map.locate({setView:true,maxZoom:14,timeout:12000,maximumAge:30000,enableHighAccuracy:true})};
  if(navigator.permissions&&navigator.permissions.query){
    navigator.permissions.query({name:'geolocation'}).then(st=>{
      if(st.state==='denied'){locHelp('Izin Lokasi Ditolak','Browser menolak izin lokasi untuk situs ini sehingga posisi tidak bisa diambil.<br><br><b>Cara mengizinkan (Chrome Android):</b> ketuk ikon 🔒 di kiri alamat situs → <i>Izin</i> → <i>Lokasi</i> → <i>Izinkan</i>, lalu tekan Coba Lagi.<br><br>Jika situs ini dibuka dari dalam aplikasi lain (WhatsApp, Telegram, Muse, dll.), buka ulang alamatnya langsung di Chrome — penampil dalam aplikasi biasanya memblokir lokasi sepenuhnya tanpa pernah memunculkan permintaan izin.')}
      else mulai();
    }).catch(()=>mulai());
  } else mulai();
}
map.on('locationfound',async e=>{clearMyLoc();chipState('Lokasi Saya',true);const{lat,lng}=e.latlng;const acc=Math.round(e.accuracy||0);
 myLocCircle=L.circle(e.latlng,{radius:e.accuracy||0,color:'#0072bc',weight:1,fillColor:'#0072bc',fillOpacity:.08}).addTo(map);
 const jk=havKm(lat,lng,3.3270177,117.5682619);const jTxt=jk<1?Math.round(jk*1000)+' m':jk.toFixed(1).replace('.',',')+' km';
 const html=`<div class="qpop"><div class="qpop-head"><span class="qpop-mag" style="background:#0072bc">📍 GPS</span><div class="qpop-t"><b>Lokasi Anda</b><small>Posisi perangkat saat ini</small></div></div><div class="qpop-grid"><div><small>Koordinat</small><b>${lat.toFixed(6)}, ${lng.toFixed(6)}</b></div><div><small>Akurasi GPS</small><b>± ${acc} m</b></div></div><p class="qpop-row"><b>Jarak ke Bandara Juwata:</b> ${jTxt}</p><p class="qpop-row"><b>Alamat:</b> <span id="myLocAddr">Memuat alamat…</span></p><p class="qpop-row"><b>Cuaca saat ini:</b> <span id="myLocWx">Memuat cuaca…</span></p><small class="qpop-src">Sumber: GPS perangkat · alamat © OpenStreetMap · cuaca Open-Meteo</small></div>`;
 myLocMark=L.marker(e.latlng).addTo(map).bindPopup(html,qpopOpts());myLocMark.openPopup();
 try{const r=await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18`,{headers:{'Accept-Language':'id'}});const j=await r.json();const el=document.getElementById('myLocAddr');if(el)el.textContent=j.display_name||'Tidak ditemukan'}catch(_){const el=document.getElementById('myLocAddr');if(el)el.textContent='Gagal memuat alamat'}
 try{const wv=await (await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&timezone=auto`)).json();const c=wv.current;const el=document.getElementById('myLocWx');if(el)el.textContent=`${c.temperature_2m}°C · 💧 ${c.relative_humidity_2m}% · 🌬 ${c.wind_speed_10m} km/j · 🌧 ${c.precipitation} mm`}catch(_){const el=document.getElementById('myLocWx');if(el)el.textContent='Gagal memuat cuaca'}});
map.on('locationerror',e=>{chipState('Lokasi Saya',false);
  if(e&&e.code===1){locHelp('Izin Lokasi Ditolak','Browser menolak izin lokasi untuk situs ini sehingga posisi tidak bisa diambil.<br><br><b>Cara mengizinkan (Chrome Android):</b> ketuk ikon 🔒 di kiri alamat situs → <i>Izin</i> → <i>Lokasi</i> → <i>Izinkan</i>, lalu tekan Coba Lagi.<br><br>Jika situs ini dibuka dari dalam aplikasi lain (WhatsApp, Telegram, Muse, dll.), buka ulang alamatnya langsung di Chrome — penampil dalam aplikasi biasanya memblokir lokasi sepenuhnya tanpa pernah memunculkan permintaan izin.')}
  else if(e&&e.code===3){locHelp('Lokasi Terlambat Terdeteksi','Sinyal GPS terlalu lemah atau waktu habis. Pastikan Lokasi perangkat aktif, coba di area terbuka, lalu tekan Coba Lagi.')}
  else{locHelp('Posisi Tidak Tersedia','Posisi perangkat tidak bisa ditentukan. Pastikan GPS/Lokasi perangkat aktif dan browser diizinkan mengakses lokasi, lalu tekan Coba Lagi.')}
});
// Tabs
document.querySelectorAll('#tabs button').forEach(b=>b.onclick=()=>{document.querySelectorAll('#tabs button').forEach(x=>x.classList.remove('on'));b.classList.add('on');document.querySelectorAll('.panel').forEach(p=>p.classList.remove('on'));document.getElementById('p-'+b.dataset.p).classList.add('on');chipState('WAQQ',b.dataset.p==='penerbangan');if(b.dataset.p==='geodisaster')loadPM();map.closePopup()});
function toggleTheme(){document.body.classList.toggle('dark')}
function minAll(){[quakeLayer,gibsLayer].forEach(l=>{if(l)map.removeLayer(l)});chipState('Gempa',false);chipState('VIIRS',false);chipState('Hotspot',false);if(typeof sstLayer!=='undefined'&&sstLayer){map.removeLayer(sstLayer);sstLayer=null;sstOn=false;chipState('SST',false)}if(typeof anginGroup!=='undefined'&&anginGroup){map.removeLayer(anginGroup);anginGroup=null;anginOn=false;chipState('Angin',false)}if(typeof portGroup!=='undefined'&&portGroup){map.removeLayer(portGroup);portOn=false;chipState('Pelabuhan',false)}if(typeof perairanOn!=='undefined'&&perairanOn){perairanOn=false;if(perairanLayer)map.removeLayer(perairanLayer);chipState('Perairan',false)}if(typeof portWave!=='undefined'&&portWave){map.removeLayer(portWave)}if(typeof rainLayer!=='undefined'&&rainLayer){map.removeLayer(rainLayer);rainLayer=null;chipState('Hujan',false);const rl=document.getElementById('rainLegend');if(rl)rl.style.display='none';const rb=document.getElementById('rainBtn');if(rb)rb.textContent='🌧 Hujan Satelit (IMERG): Nonaktif';if(typeof updateProdPill==='function')updateProdPill()}if(typeof pmOn!=='undefined'&&pmOn)togglePM();clearMyLoc();clearWilMap();if(lastQuakeMark){map.removeLayer(lastQuakeMark);lastQuakeMark=null}map.closePopup();toast('Semua layer overlay dimatikan')}
// NASA GIBS time layers
let gibsLayer=null,gibsKind=null;
function gibsUrl(kind,date){const d=date||new Date(Date.now()-864e5).toISOString().slice(0,10);const id='VIIRS_NOAA20_CorrectedReflectance_TrueColor';return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${id}/default/${d}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`}
function toggleGibs(kind,force){if(gibsLayer&&gibsKind===kind&&force!==true){map.removeLayer(gibsLayer);gibsLayer=null;chipState('VIIRS',false);chipState('Hotspot',false);if(typeof updateProdPill==='function')updateProdPill();return}if(gibsLayer)map.removeLayer(gibsLayer);gibsKind=kind;gibsLayer=L.tileLayer(gibsUrl(kind,document.getElementById('gibsDate').value||undefined),{opacity:.85,attribution:'NASA GIBS'});gibsLayer.addTo(map);chipState('VIIRS',kind==='viirs');chipState('Hotspot',kind==='fire');if(typeof updateProdPill==='function')updateProdPill();toast('Layer citra '+kind.toUpperCase()+' aktif')}
function refreshGibs(){if(gibsLayer){const k=gibsKind;map.removeLayer(gibsLayer);gibsLayer=null;toggleGibs(k,true)}else toast('Aktifkan dulu layer VIIRS')}
function setOpacity(v){if(gibsLayer)gibsLayer.setOpacity(v/100)}
// Modul SST & Angin dipindah ke sigap-layers.js (berbagi global yang sama, dimuat sesudah berkas ini).
// ===== Citra Satelit & Radar BMKG (satellite.bmkg.go.id + gis.bmkg.go.id) — terverifikasi live =====
const SATPROD={eh:{model:'himawari9',param:'EH',label:'Himawari-9 IR Enhanced'},nc:{model:'himawari9',param:'NC',label:'Himawari-9 Natural Color'},wv:{model:'himawari9',param:'WV',label:'Himawari-9 Water Vapor'},rp:{model:'himawari9',param:'RP',label:'Himawari-9 Rainfall'},gk:{model:'gk2a',param:'EH',label:'GK-2A IR Enhanced'}};
const BULAN=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
let satLayer=null,satKey=null,satRuns=[],satIdx=0,satPlayTimer=null,modelrunCache=null,modelrunAt=0,radarLayer=null,radarTimer=null,satRefreshTimer=null;
function fmtWita(iso){const d=new Date(new Date(iso).getTime()+8*3600000);const p=n=>String(n).padStart(2,'0');return `${p(d.getUTCDate())} ${BULAN[d.getUTCMonth()]} ${d.getUTCFullYear()} · ${p(d.getUTCHours())}.${p(d.getUTCMinutes())} WITA`}
async function getModelRuns(){if(modelrunCache&&Date.now()-modelrunAt<300000)return modelrunCache;const r=await fetchTimeout('https://satellite.bmkg.go.id/api22/modelrun',15000);modelrunCache=await r.json();modelrunAt=Date.now();return modelrunCache}
function satUrl(key,iso){const p=SATPROD[key];return `https://satellite.bmkg.go.id/api22/tile/{z}/{x}/{y}.png?tiletype=himawari9&modelname=${p.model}&param=${p.param}&baserun=${encodeURIComponent(iso)}`}
function satLabel(){const el=document.getElementById('satTime');if(!satRuns.length){el.textContent='—';return}el.textContent=fmtWita(satRuns[satIdx])+(satIdx===0?' (terbaru)':'');updateProdPill()}
const SATBOUNDS={himawari9:[[-22,90],[22,146.25]],gk2a:[[-22,78.75],[22,157.5]]};
function satFillZoom(key){const b=SATBOUNDS[SATPROD[key].model];if(!b)return null;const size=map.getSize();if(!size||!size.x||!size.y)return null;const nw=map.project(L.latLng(b[1][0],b[0][1]),0),se=map.project(L.latLng(b[0][0],b[1][1]),0);const w=Math.abs(se.x-nw.x),h=Math.abs(se.y-nw.y);if(!w||!h)return null;return Math.log(Math.max(size.x/w,size.y/h))/Math.LN2}
function indoFillZoom(){const b=SATBOUNDS.himawari9;const size=map.getSize();if(!size||!size.x||!size.y)return null;const nw=map.project(L.latLng(b[1][0],b[0][1]),0),se=map.project(L.latLng(b[0][0],b[1][1]),0);const w=Math.abs(se.x-nw.x),h=Math.abs(se.y-nw.y);if(!w||!h)return null;return Math.log(Math.max(size.x/w,size.y/h))/Math.LN2}
function satFrame(key){const z=satFillZoom(key);if(z===null)return;if(map.getZoom()>z+0.01)return;const b=SATBOUNDS[SATPROD[key].model];map.setView(L.latLngBounds(b).getCenter(),z)}
let satLockZ=null;
let pmLockZ=null;
let satPanB=null;
function applyMinZoom(){if(satLockZ===null&&pmLockZ===null){const iz=indoFillZoom();map.options.minZoom=(iz!==null?iz:3);if(iz!==null&&map.getZoom()<iz)map.setZoom(iz)}else{map.options.minZoom=Math.max(3,satLockZ||0,pmLockZ||0)}}
function applyViewBounds(){const pm=pmLockZ!==null;const b=pm?L.latLngBounds(INDO_BOUNDS):(satPanB||L.latLngBounds(INDO_BOUNDS));map.setMaxBounds(b.pad(pm?0.04:0));map.options.maxBoundsViscosity=1.0;if(!b.contains(map.getCenter()))map.panInsideBounds(b)}
function satZoomLock(key){const m=key?SATPROD[key].model:null;if(m==='himawari9'||m==='gk2a'){map.options.minZoom=3;satLockZ=satFillZoom(key);satPanB=L.latLngBounds(SATBOUNDS[m]);applyMinZoom();applyViewBounds()}else{satLockZ=null;satPanB=null;applyMinZoom();applyViewBounds()}}
function satLockRepair(){if(!satKey||satLockZ===null)return;const z=satFillZoom(satKey);if(z===null)return;if(satLockZ!==z||map.options.minZoom!==z)satZoomLock(satKey);if(map.getZoom()<z)map.setZoom(z)}
setTimeout(satLockRepair,2600);setTimeout(satLockRepair,5200);
let satResizeT=null;
window.addEventListener('resize',()=>{if(!satKey)return;clearTimeout(satResizeT);satResizeT=setTimeout(()=>{if(satKey){if(satLockZ!==null)satZoomLock(satKey);satFrame(satKey)}},450)});
let indoResizeT=null;window.addEventListener('resize',()=>{if(satKey||pmLockZ!==null)return;clearTimeout(indoResizeT);indoResizeT=setTimeout(()=>{if(!satKey&&pmLockZ===null){applyMinZoom();applyViewBounds()}},450)});
function satMarkLoading(){const el=document.getElementById('satTime');if(el)el.textContent='⏳ memuat tile…';const L0=satLayer;if(!L0)return;let done=false;const fin=()=>{if(done)return;done=true;if(satLayer===L0)satLabel()};L0.once('load',fin);setTimeout(fin,60000)}
function satArmTileWatch(L0){if(!satKey||!SATPROD[satKey])return;let okT=0,errT=0;L0.on('tileload',()=>{okT++});L0.on('tileerror',()=>{errT++});const chk=timer=>{if(satLayer!==L0||okT>0)return;if(!timer&&errT===0)return;satTileFail()};L0.once('load',()=>setTimeout(()=>chk(false),50));setTimeout(()=>chk(true),45000)}
function satTileFail(){const st=document.getElementById('satStatus');if(st)st.textContent='Tile citra belum terbaca — server BMKG lambat; tunggu sebentar atau pilih produk lain.'}
function satApplyLayer(){if(satPlaying)satStopPlay();if(satBuf){map.removeLayer(satBuf);satBuf=null;satBufReady=false}if(satOldLayer){map.removeLayer(satOldLayer);satOldLayer=null}if(satLayer)map.removeLayer(satLayer);if(!satKey||!satRuns.length)return;satLayer=satMk(satUrl(satKey,satRuns[satIdx]),satTargetOp()).addTo(map);satMarkLoading();satArmTileWatch(satLayer)}
async function setSatProduct(key){const st=document.getElementById('satStatus');if(!key||key===satKey){satKey=null;satZoomLock(null);if(satLayer)map.removeLayer(satLayer);satLayer=null;chipState('Himawari',false);satStopPlay();if(st)st.textContent='Citra diperbarui mengikuti model run BMKG (±10 menit). Waktu ditampilkan dalam WITA (waktu Tarakan).';document.querySelectorAll('.satbtn').forEach(b=>b.classList.remove('on'));document.getElementById('satTime').textContent='—';updateProdPill();return}
 satKey=key;if(typeof iaKey!=='undefined'&&iaKey)iaOff();document.querySelectorAll('.satbtn').forEach(b=>b.classList.toggle('on',b.dataset.sat===key));st.textContent='Menghubungi server citra BMKG…';
 try{const data=await getModelRuns();satRuns=(data[SATPROD[key].model]||[]).slice();if(!satRuns.length){st.textContent='Tidak ada model run untuk produk ini saat ini di server BMKG.';return}satIdx=0;const sl=document.getElementById('satSlider');sl.max=satRuns.length-1;sl.value=satRuns.length-1;satApplyLayer();satZoomLock(key);map.setView(L.latLngBounds(SATBOUNDS[SATPROD[key].model]).getCenter(),satFillZoom(key));chipState('Himawari',true);st.textContent=satProdLabel(key)+' aktif — '+satRuns.length+' waktu tersedia, geser slider untuk mundur ke citra sebelumnya.'}catch(e){st.textContent='Server citra BMKG belum menjawab — coba lagi sebentar lagi.';satZoomLock(null)}
 if(satRefreshTimer)clearInterval(satRefreshTimer);satRefreshTimer=setInterval(async()=>{if(!satKey)return;modelrunCache=null;try{const data=await getModelRuns();const runs=(data[SATPROD[satKey].model]||[]).slice();if(runs.length&&runs[0]!==satRuns[0]){const ikutTerbaru=satIdx===0;satRuns=runs;const sl=document.getElementById('satSlider');sl.max=runs.length-1;if(ikutTerbaru){satIdx=0;sl.value=runs.length-1}const wasP=satPlaying;satApplyLayer();if(wasP)setTimeout(()=>{if(satKey&&!satPlaying&&satRuns.length>=2)satPlayToggle()},1500)}}catch(e){}},600000)}
setInterval(()=>{if(satKey&&!satPlaying&&!satUserPaused&&satRuns.length>=2&&satLayer)satPlayToggle()},4000);
function satProdLabel(k){return SATPROD[k].label}
function satSliderMove(v){satUserPaused=true;if(satPlaying)satStopPlay();if(!satRuns.length)return;satIdx=satRuns.length-1-(+v);if(satLayer)satLayer.setUrl(satUrl(satKey,satRuns[satIdx]));satMarkLoading()}
let satBuf=null,satOldLayer=null,satPlaying=false,satUserPaused=false,satBufReady=false,satPendingAdv=false,satFadeTimer=null;
function satTargetOp(){return (+((document.querySelector('#p-geoportal input[oninput^="setSatOpacity"]')||{}).value)||85)/100}
function satMk(url,op){return L.tileLayer(url,{tms:true,maxZoom:18,maxNativeZoom:10,minZoom:3,opacity:op,attribution:'Citra satelit: BMKG (satellite.bmkg.go.id) — Himawari-9 (JMA) / GK-2A (KMA)'})}
function satPrepareNext(){if(!satPlaying||!satRuns.length)return;const nIdx=satIdx<=0?satRuns.length-1:satIdx-1;if(satBuf&&satBuf._idx===nIdx)return;if(satBuf){map.removeLayer(satBuf);satBuf=null}satBufReady=false;satBuf=satMk(satUrl(satKey,satRuns[nIdx]),0);satBuf._idx=nIdx;satBuf.addTo(map);const c=satBuf.getContainer();if(c)c.style.transition='opacity .35s ease';satBuf.once('load',()=>{satBufReady=true;if(satPendingAdv){satPendingAdv=false;satAdvance()}})}
function satAdvance(){if(!satPlaying)return;if(!satBuf||!satBufReady){satPendingAdv=true;return}
 const old=satLayer;satLayer=satBuf;satBuf=null;satBufReady=false;satIdx=satLayer._idx;
 document.getElementById('satSlider').value=satRuns.length-1-satIdx;satLabel();
 satLayer.setOpacity(satTargetOp());satOldLayer=old;
 if(old&&old!==satLayer)old.setOpacity(0);
 if(satFadeTimer)clearTimeout(satFadeTimer);
 satFadeTimer=setTimeout(()=>{if(satOldLayer){map.removeLayer(satOldLayer);satOldLayer=null}},430);
 satPrepareNext();
 satPlayTimer=setTimeout(satAdvance,800)}
function satStopPlay(){satPlaying=false;satPendingAdv=false;if(satPlayTimer){clearTimeout(satPlayTimer);satPlayTimer=null}if(satFadeTimer){clearTimeout(satFadeTimer);satFadeTimer=null}if(satBuf){map.removeLayer(satBuf);satBuf=null;satBufReady=false}if(satOldLayer){map.removeLayer(satOldLayer);satOldLayer=null}if(satLayer)satLayer.setOpacity(satTargetOp());const b=document.getElementById('satPlayBtn');if(b)b.textContent='▶ Putar Animasi'}
function satPlayToggle(){if(satPlaying){satStopPlay();satUserPaused=true;return}if(!satKey||satRuns.length<2){toast('Aktifkan dulu produk citranya');return}if(!satLayer)return;satPlaying=true;satUserPaused=false;document.getElementById('satPlayBtn').textContent='⏸ Jeda';const c=satLayer.getContainer();if(c)c.style.transition='opacity .35s ease';toast('Menyiapkan animasi — tiap frame dimuat tuntas dulu sebelum ditampilkan agar mulus');satPrepareNext();satPlayTimer=setTimeout(satAdvance,500)}
function setSatOpacity(v){if(satLayer)satLayer.setOpacity(v/100);if(typeof iaLayer!=='undefined'&&iaLayer)iaLayer.setOpacity(v/100)}
const RadarGrid=L.GridLayer.extend({createTile:function(coords){const img=document.createElement('img');const S=256*Math.pow(2,coords.z);const R=20037508.342789244;const x0=-R+ (coords.x*256/S)*2*R;const x1=-R+((coords.x+1)*256/S)*2*R;const y1=R-(coords.y*256/S)*2*R;const y0=R-((coords.y+1)*256/S)*2*R;img.src=`https://gis.bmkg.go.id/arcgis/rest/services/radarcmax/MapServer/export?bbox=${x0},${y0},${x1},${y1}&bboxSR=3857&imageSR=3857&size=256,256&dpi=96&format=png32&transparent=true&layers=show:1&f=image&_ts=${Date.now()}`;img.alt='';return img}});
var rainLayer=null;
function probeRainTile(d,t){return new Promise(res=>{const im=new Image();const to=setTimeout(()=>res(false),6000);im.onload=()=>{clearTimeout(to);res(true)};im.onerror=()=>{clearTimeout(to);res(false)};im.src='https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/IMERG_Precipitation_Rate/default/'+d+'/GoogleMapsCompatible_Level6/'+t+'.png'})}
async function probeRain(d){const r=await Promise.all([probeRainTile(d,'6/31/52'),probeRainTile(d,'5/16/26')]);return r[0]&&r[1]}
function mkRainLayer(d,fb){const l=L.tileLayer('https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/IMERG_Precipitation_Rate/default/'+d+'/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png',{opacity:.8,maxNativeZoom:6,attribution:'Hujan satelit: NASA/JAXA GPM IMERG'});l._date=d;l._ok=0;l._err=0;l._fb=fb||0;l.on('tileload',()=>{l._ok++});l.on('tileerror',()=>{l._err++;rainFallback()});return l}
var rainFbTimer=null;
function rainFallback(){if(!rainLayer||rainLayer._ok>0||rainLayer._err<3||rainLayer._fb>=3||rainFbTimer)return;rainFbTimer=setTimeout(()=>{rainFbTimer=null;if(!rainLayer||rainLayer._ok>0||rainLayer._fb>=3)return;const old=rainLayer._date;const nd=new Date(new Date(old+'T00:00:00Z').getTime()-864e5).toISOString().slice(0,10);const fb=rainLayer._fb+1;map.removeLayer(rainLayer);rainLayer=mkRainLayer(nd,fb);rainLayer.addTo(map);updateProdPill();toast('Tile hujan tanggal '+old+' gagal dimuat — mundur otomatis ke '+nd)},1500)}
var rainBusy=false;
async function toggleRain(){const btn=document.getElementById('rainBtn');if(rainLayer){map.removeLayer(rainLayer);rainLayer=null;document.getElementById('rainLegend').style.display='none';if(btn)btn.textContent='🌧 Hujan Satelit (IMERG): Nonaktif';chipState('Hujan',false);updateProdPill();toast('Layer hujan nonaktif');return}
 if(rainBusy)return;rainBusy=true;chipState('Hujan',true);toast('Memeriksa ketersediaan data hujan satelit…');
 const dEl=document.getElementById('gibsDate');const userD=(dEl&&dEl.value&&dEl.dataset.auto!=='1')?dEl.value:'';const base=userD?new Date(userD+'T00:00:00Z'):new Date();const startK=userD?0:2;let chosen=null;
 for(let k=startK;k<=startK+5&&!chosen;k++){const d=new Date(base.getTime()-k*864e5).toISOString().slice(0,10);if(await probeRain(d))chosen=d}
 rainBusy=false;
 if(!chosen){chipState('Hujan',false);toast('Data hujan IMERG belum tersedia untuk 6 tanggal terakhir yang diperiksa');return}
 rainLayer=mkRainLayer(chosen,0);rainLayer.addTo(map);document.getElementById('rainLegend').style.display='block';if(btn)btn.textContent='🌧 Hujan Satelit (IMERG): Aktif';chipState('Hujan',true);updateProdPill();toast('Layer hujan satelit IMERG '+chosen+' aktif'+(userD&&chosen!==userD?' (tanggal terbaru yang tersedia)':''))}
function toggleRadar(){const btn=document.getElementById('radarBtn');if(radarLayer){map.removeLayer(radarLayer);radarLayer=null;if(radarTimer)clearInterval(radarTimer);radarTimer=null;document.getElementById('radarLegend').style.display='none';if(btn)btn.textContent='📡 Radar BMKG: Nonaktif';chipState('Radar',false);updateProdPill();toast('Radar BMKG nonaktif');return}
 radarLayer=new RadarGrid({opacity:.55,attribution:'Radar cuaca: BMKG (gis.bmkg.go.id)'}).addTo(map);document.getElementById('radarLegend').style.display='';if(btn)btn.textContent='📡 Radar BMKG: Aktif';chipState('Radar',true);updateProdPill();toast('Radar BMKG aktif (reflektivitas maks) — auto-refresh 6 menit');
 if(radarTimer)clearInterval(radarTimer);radarTimer=setInterval(()=>{if(radarLayer)radarLayer.redraw();updateProdPill()},360000)}
function updateProdPill(){let pill=document.getElementById('prodPill');if(!pill){pill=document.createElement('div');pill.id='prodPill';document.body.appendChild(pill)}
 if(typeof iaKey!=='undefined'&&iaKey&&iaRun){pill.style.display='block';pill.textContent='🛰 InaSIAM · '+IAPROD[iaKey].n+' · '+fmtWita(iaRun.slice(0,4)+'-'+iaRun.slice(4,6)+'-'+iaRun.slice(6,8)+'T'+iaRun.slice(8,10)+':'+iaRun.slice(10,12)+':00Z')}else if(radarLayer){pill.style.display='block';pill.textContent='📡 Radar BMKG · '+fmtWita(new Date().toISOString())}else if(typeof rainLayer!=='undefined'&&rainLayer){pill.style.display='block';pill.textContent='🌧 Hujan Satelit GPM IMERG · '+(rainLayer._date||'')}else if(satKey&&satRuns.length){pill.style.display='block';pill.textContent='🛰 '+SATPROD[satKey].label+' · '+fmtWita(satRuns[satIdx])}else if(typeof anginOn!=='undefined'&&anginOn){pill.style.display='block';pill.textContent='💨 Angin BMKG INAWAVES · '+(anginValidTxt||'')}else if(typeof sstOn!=='undefined'&&sstOn){pill.style.display='block';pill.textContent=(sstSrc==='nasa'?'🌊 SST NASA GHRSST · ':'🌊 SST BMKG Ina-Flows · ')+(sstValidTxt||'')+(sstSrc==='nasa'?' (sementara)':'')}else if(typeof gibsLayer!=='undefined'&&gibsLayer){pill.style.display='block';pill.textContent='🛰 '+(gibsKind==='viirs'?'VIIRS NOAA-20 True Color':'Hotspot / Fire')+' · NASA GIBS'}else pill.style.display='none'}
const IAPROD={fog:{p:'himawari:fog',n:'Fog & Stratus Rendah',d:'Fog and Low Stratus Detection',u:'K',cb:[[220.0,'#FFFFFF'],[240.0,'#C8FFC8'],[260.0,'#96C896'],[280.0,'#649664'],[300.0,'#326432'],[320.0,'#1E321E']]},cloud_top:{p:'himawari:cloud_top',n:'Cloud Top Phase/Icing',d:'Cloud Top Phase/Icing',u:'K',cb:[[200.0,'#800080'],[213.0,'#B400B4'],[223.0,'#FF0000'],[233.0,'#FF6400'],[243.0,'#FFC800'],[253.0,'#FFFF00'],[263.0,'#00FFFF'],[273.0,'#00C864'],[283.0,'#646464']]},ir_ct:{p:'himawari:ir_ct',n:'IR Cloud Top Icing',d:'IR Cloud Top Icing Detection',u:'K',cb:[[213.15,'#800080'],[223.15,'#FF0000'],[233.15,'#FF6400'],[243.15,'#FFC800'],[253.15,'#00FFFF'],[263.15,'#00C864'],[273.15,'#646464'],[283.15,'#323232']]},sandwich:{p:'himawari-vis:sandwich',n:'Sandwich VIS+IR',d:'VIS+IR Sandwich Composite',u:'Composite',cb:[[183.15,'#E93F33'],[188.15,'#EA5759'],[193.15,'#F8D4B6'],[198.15,'#F6C28C'],[203.15,'#F29E33'],[208.15,'#EB5B33'],[213.15,'#CE9B29'],[223.15,'#969696'],[243.15,'#787878'],[263.15,'#646464'],[283.15,'#505050'],[303.15,'#3C3C3C']]},vis:{p:'himawari-vis:vis',n:'Visible',d:'Visible Imagery',u:'Reflectance (0-1)',cb:[[0.0,'#000000'],[0.2,'#323232'],[0.4,'#646464'],[0.6,'#A0A0A0'],[0.8,'#D2D2D2'],[1.0,'#FFFFFF']]},wv_mid:{p:'himawari:wv_mid',n:'WV Mid',d:'Mid Troposphere Water Vapor',u:'K',cb:[[190.0,'#FFFFFF'],[210.0,'#C8F0FF'],[220.0,'#64C8FF'],[230.0,'#3C96DC'],[240.0,'#4664A0'],[250.0,'#A0825A'],[260.0,'#785028'],[270.0,'#3C1E0A']]},wv_upper:{p:'himawari:wv_upper',n:'WV Upper',d:'Upper Troposphere Water Vapor',u:'K',cb:[[190.0,'#FFFFFF'],[210.0,'#C8F0FF'],[220.0,'#64C8FF'],[230.0,'#3C96DC'],[240.0,'#4664A0'],[250.0,'#A0825A'],[260.0,'#785028'],[270.0,'#3C1E0A']]}};
let iaKey=null,iaLayer=null,iaRun=null,iaTimer=null;
const iaFmt=d=>{const q=n=>String(n).padStart(2,'0');return d.getUTCFullYear()+q(d.getUTCMonth()+1)+q(d.getUTCDate())+q(d.getUTCHours())+q(d.getUTCMinutes())};
const iaTile=(k,run,z,x,y)=>'https://inasiam.bmkg.go.id/api/tilerv3/tiles/'+IAPROD[k].p+':output=shaded:modelrun='+run+':validtime='+run+'/'+z+'/'+x+'/'+y;
const iaWita=run=>fmtWita(run.slice(0,4)+'-'+run.slice(4,6)+'-'+run.slice(6,8)+'T'+run.slice(8,10)+':'+run.slice(10,12)+':00Z');
function iaProbeImg(src){return new Promise(r=>{const im=new Image();im.onload=()=>r(true);im.onerror=()=>r(false);im.src=src})}
async function iaProbeRun(k){const d=new Date();d.setUTCSeconds(0,0);d.setUTCMinutes(Math.floor(d.getUTCMinutes()/10)*10);for(let i=0;i<18;i++){const run=iaFmt(d);if(await iaProbeImg(iaTile(k,run,6,52,31)))return run;d.setUTCMinutes(d.getUTCMinutes()-10)}return null}
function iaFrame(){const z=satFillZoom('eh');if(z===null)return;if(map.getZoom()>z+0.01)return;map.setView(L.latLngBounds(SATBOUNDS.himawari9).getCenter(),z)}
function iaBarShow(k){const P=IAPROD[k];document.getElementById('iaBar').style.display='block';document.getElementById('iaGrad').style.background='linear-gradient(90deg,'+P.cb.map(s=>s[1]).join(',')+')';const cap=document.getElementById('iaCap');cap.children[0].textContent=P.cb[0][0]+' '+P.u;cap.children[1].textContent=P.d+' · '+P.cb[P.cb.length-1][0]+' '+P.u}
function iaOff(){iaKey=null;iaRun=null;if(iaLayer){map.removeLayer(iaLayer);iaLayer=null}if(iaTimer){clearInterval(iaTimer);iaTimer=null}satLockZ=null;satPanB=null;applyMinZoom();applyViewBounds();document.querySelectorAll('.iabtn').forEach(b=>b.classList.remove('on'));document.getElementById('iaBar').style.display='none';document.getElementById('iaStatus').textContent='Citra penerbangan dari tiler InaSIAM BMKG — run terbaru dijejak otomatis tiap 10 menit.';updateProdPill()}
async function setIa(key){const st=document.getElementById('iaStatus');if(!key||key===iaKey){iaOff();st.textContent='Citra InaSIAM dimatikan.';return}
 if(satKey)setSatProduct(satKey);
 iaKey=key;document.querySelectorAll('.iabtn').forEach(b=>b.classList.toggle('on',b.dataset.ia===key));st.textContent='Menjejaki run InaSIAM terbaru…';
 const run=await iaProbeRun(key);if(iaKey!==key)return;
 if(!run){st.textContent='Server InaSIAM belum menjawab — coba lagi sebentar lagi.';iaOff();return}
 iaRun=run;if(iaLayer){map.removeLayer(iaLayer);iaLayer=null}iaLayer=L.tileLayer(iaTile(key,run,'{z}','{x}','{y}'),{opacity:.85,maxZoom:19}).addTo(map);
 satLockZ=satFillZoom('eh');if(satLockZ!==null)map.options.minZoom=satLockZ;iaFrame();iaBarShow(key);updateProdPill();
 st.textContent=IAPROD[key].n+' aktif — run '+iaWita(run)+' (dijejak dari server InaSIAM). Warna mengikuti colorbar resmi produk.';
 if(iaTimer)clearInterval(iaTimer);iaTimer=setInterval(async()=>{if(!iaKey)return;const r2=await iaProbeRun(iaKey);if(r2&&iaKey&&r2!==iaRun){iaRun=r2;const nl=L.tileLayer(iaTile(iaKey,r2,'{z}','{x}','{y}'),{opacity:.85,maxZoom:19}).addTo(map);if(iaLayer)map.removeLayer(iaLayer);iaLayer=nl;updateProdPill();document.getElementById('iaStatus').textContent=IAPROD[iaKey].n+' diperbarui — run '+iaWita(r2)+'.'}},600000)}
document.querySelectorAll('.satbtn').forEach(b=>b.addEventListener('click',()=>{if(iaKey)iaOff()}));
let iaResizeT=null;window.addEventListener('resize',()=>{if(!iaKey)return;clearTimeout(iaResizeT);iaResizeT=setTimeout(()=>{if(iaKey){satLockZ=satFillZoom('eh');if(satLockZ!==null)map.options.minZoom=satLockZ;iaFrame()}},450)});
const IAINT={fog:["Very cold cloud tops", "Cold clouds, fog/stratus", "Cool clouds/fog", "Surface, thin clouds", "Warm surface", "Hot surface"],cloud_top:["Severe (glaciated)", "Ice crystals", "High (ice phase)", "Mixed phase start", "Mixed phase", "Supercooled (SLD risk)", "HIGH icing (supercooled)", "Freezing level", "Warm (liquid)"],ir_ct:["Glaciated - ice crystals", "Ice phase - significant icing in convection", "Mixed phase begins", "Mixed phase - ice and water coexisting", "SLD RISK - supercooled water likely", "HIGH icing - supercooled water", "Freezing level - transition zone", "Warm clouds - no icing"],sandwich:["Extreme tops", "Very deep convection", "Deep convection", "Active Cb", "Developing Cb", "High tops", "Transition", "Mid-high clouds", "Mid clouds", "Low clouds", "Near surface", "Surface"],vis:["Ocean, dark land", "Land, thin haze", "Thin clouds", "Medium clouds", "Thick clouds", "Very thick clouds, snow"],wv_mid:["Deep convection, high clouds", "Very moist upper troposphere", "Moist", "Moderate moisture", "Transition zone", "Dry", "Very dry", "Extreme dry (subsidence)"],wv_upper:["Deep convection, high clouds", "Very moist upper troposphere", "Moist", "Moderate moisture", "Transition zone", "Dry", "Very dry", "Extreme dry (subsidence)"],ir:["Very cold tops (severe Cb)", "Deep convection", "Active convection", "Developing", "High clouds", "Mid-high clouds", "Mid-level clouds", "Mid-level", "Low-mid clouds", "Low clouds", "Very low clouds", "Near surface clouds", "Low stratus", "Freezing level", "Warm clouds", "Near surface"]};
const IRCB=[[173.15,'#E93F33'],[193.15,'#EA5759'],[198.15,'#F8D4B6'],[204.15,'#F6C28C'],[211.15,'#F29E33'],[217.15,'#EB5B33'],[225.15,'#CE9B29'],[232.15,'#C2BC23'],[239.15,'#9DD413'],[245.15,'#84F201'],[252.15,'#76E785'],[260.15,'#5FC192'],[266.15,'#44AFFB'],[273.15,'#4A87FB'],[281.15,'#3562B4'],[287.15,'#104880']];
let wxLegOpen=window.innerWidth>900;
function wxLegendEl(){let el=document.getElementById('wxLegend');if(el)return el;el=document.createElement('div');el.id='wxLegend';el.style.display='none';el.innerHTML='<div class="wxh">🌦 Legenda Cuaca <span class="wxbadge" id="wxBadge">0</span><span style="margin-left:auto" id="wxChev">▾</span></div><div class="wxb" id="wxBody"></div>';el.querySelector('.wxh').onclick=()=>{wxLegOpen=!wxLegOpen;document.getElementById('wxBody').style.display=wxLegOpen?'block':'none';document.getElementById('wxChev').textContent=wxLegOpen?'▾':'▸'};document.getElementById('app').appendChild(el);return el}
function wxGrad(cb){return '<div class="wxgrad" style="background:linear-gradient(90deg,'+cb.map(s=>s[1]).join(',')+')"></div>'}
function wxIaSec(nm,P,ints){let s='<div class="wxsec"><b>🛰 '+nm+'</b>'+wxGrad(P.cb)+'<div class="wxcap"><span>'+P.cb[0][0]+' '+P.u+'</span><span>'+P.cb[P.cb.length-1][0]+' '+P.u+'</span></div>';(ints||[]).forEach((t,i)=>{if(P.cb[i])s+='<div class="wxrow"><span class="wxdot" style="background:'+P.cb[i][1]+'"></span>'+P.cb[i][0]+' '+P.u+' — '+t+'</div>'});return s+'</div>'}
function wxRender(){const secs=[];
 if(typeof iaKey!=='undefined'&&iaKey&&IAPROD[iaKey])secs.push(wxIaSec(IAPROD[iaKey].n+' — InaSIAM',IAPROD[iaKey],IAINT[iaKey]));
 if(satKey){if(satKey==='eh')secs.push(wxIaSec('Himawari-9 IR Enhanced',{u:'K',cb:IRCB},IAINT.ir));else secs.push('<div class="wxsec"><b>🛰 '+SATPROD[satKey].label+'</b><div class="wxrow">Citra satelit BMKG</div></div>')}
 if(typeof sstOn!=='undefined'&&sstOn)secs.push('<div class="wxsec"><b>🌊 SST — Suhu Permukaan Laut '+(sstSrc==='nasa'?'NASA GHRSST (sementara)':'BMKG Ina-Flows')+'</b><div style="height:9px;border-radius:5px;background:linear-gradient(90deg,#313695,#4575b4,#74add1,#abd9e9,#e0f3f8,#ffffbf,#fee090,#fdae61,#f46d43,#d73027,#a50026);margin:5px 0 3px"></div><div class="wxcap"><span>'+(sstSrc==='nasa'?'dingin':'16 °C')+'</span><span>'+(sstSrc==='nasa'?'hangat':'36 °C')+'</span></div><div class="wxrow">'+(sstSrc==='nasa'?'Sumber sementara selama Ina-Flows BMKG gangguan · ':'Model Ina-Flows BMKG · berlaku ')+(sstValidTxt||'')+'</div></div>');
 if(typeof anginOn!=='undefined'&&anginOn)secs.push('<div class="wxsec"><b>💨 Angin 10 m — BMKG INAWAVES (OFS)</b><div style="height:9px;border-radius:5px;background:linear-gradient(90deg,#cfe8f7,#6baed6,#2bb3a3,#31a354,#fec44f,#fe9929,#e31a1c,#b10096);margin:5px 0 3px"></div><div class="wxcap"><span>0 knot</span><span>60 knot</span></div><div class="wxrow">Arsiran kecepatan + barb arah angin · berlaku '+(anginValidTxt||'')+'</div></div>');
 if(typeof perairanOn!=='undefined'&&perairanOn)secs.push('<div class=\"wxsec\"><b>🟩 Wilayah Perairan — BMKG Maritim</b><div class=\"wxrow\">'+(typeof perairanLinked!=='undefined'?perairanLinked:0)+' dari 232 poligon GIS BMKG terhubung prakiraan situs BMKG Maritim · dipanen '+(typeof perairanMeta!=='undefined'?perairanMeta:'')+'.</div><div class=\"wxrow\">Klik poligon di peta untuk popup CUACA PERAIRAN.</div></div>');
 if(typeof avDotsOn!=='undefined'&&avDotsOn)secs.push('<div class="wxsec"><b>🛬 Visibilitas Bandara (METAR)</b>'+[8001,4800,1600,0].map(v=>{const vc=avVisClass(v);return '<div class="wxrow"><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:'+vc.color+';margin-right:6px"></span>'+vc.label+'</div>'}).join('')+'<div class="wxrow"><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#f59e0b;margin-right:6px"></span>AUTO (sensor inoperatif)</div><div class="wxrow"><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#9ca3af;margin-right:6px"></span>Data belum diperbarui</div></div>');
 if(typeof sgOn!=='undefined'&&sgOn)secs.push('<div class="wxsec"><b>⛈ SIGMET — Bahaya Penerbangan</b>'+Object.keys(SGDEFS).map(k=>'<div class="wxrow"><span style="display:inline-block;width:9px;height:9px;background:'+SGDEFS[k][0]+';margin-right:6px"></span>'+SGDEFS[k][1]+'</div>').join('')+'</div>');
 if(typeof ltOn!=='undefined'&&ltOn)secs.push('<div class="wxsec"><b>⚡ Petir — 15 Menit Terakhir'+(ltCount?' ('+ltCount+' sambaran)':'')+'</b><div class="wxrow"><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#ef4444;margin-right:6px"></span>Intensitas negatif</div><div class="wxrow"><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#fbbf24;margin-right:6px"></span>Intensitas positif</div></div>');
 if(typeof firOn!=='undefined'&&firOn)secs.push('<div class="wxsec"><b>🛰 Batas FIR</b><div class="wxrow"><span style="display:inline-block;width:14px;border-top:2px solid #3b82f6;margin-right:6px"></span>Garis batas FIR — klik peta untuk nama wilayah</div></div>');
 if(typeof radarLayer!=='undefined'&&radarLayer)secs.push('<div class="wxsec"><b>📡 Radar BMKG (dBZ)</b><div class="wxgrad" style="background:linear-gradient(90deg,#a0d8ef,#01b8ff,#00e500,#b4dc00,#ffdc00,#ff7100,#ff0000,#b800d6)"></div><div class="wxcap"><span>5 ringan</span><span>35 deras</span><span>55 ekstrem</span><span>75 hail</span></div></div>');
 if(typeof rainLayer!=='undefined'&&rainLayer)secs.push('<div class="wxsec"><b>🌧 Hujan — GPM IMERG</b><div class="wxrow">Estimasi laju hujan satelit (mm/jam) · data '+(rainLayer._date||'')+'</div></div>');
 if(typeof gibsLayer!=='undefined'&&gibsLayer)secs.push('<div class="wxsec"><b>🛰 VIIRS NOAA-20 True Color</b><div class="wxrow">Citra warna asli NASA GIBS · '+(gibsLayer._date||'')+'</div></div>');
 if(typeof pmOn!=='undefined'&&pmOn)secs.push('<div class="wxsec"><b>🌫 PM2.5 — BMKG PCM (SPARTAN)</b><div style="height:9px;border-radius:5px;margin:6px 0 2px;background:linear-gradient(90deg,#22c55e,#eab308,#f97316,#ef4444,#7c3aed,#7f1d1d)"></div><div style="display:flex;justify-content:space-between;font-size:9.5px;color:var(--mut)"><span>0</span><span>15</span><span>55</span><span>150</span><span>250</span><span>500 µg/m³</span></div>'+[[15,'#22c55e','≤ 15 · Baik'],[55,'#eab308','15–55 · Sedang'],[150,'#f97316','55–150 · Tidak Sehat'],[250,'#ef4444','150–250 · Sangat Tidak Sehat'],[999,'#7f1d1d','> 250 · Berbahaya']].map(r=>'<div class="wxrow"><span class="wxdot" style="background:'+r[1]+';border-radius:3px"></span>PM2.5 '+r[2]+'</div>').join('')+'<div class="wxrow">Tile model PCM BMKG (run '+(typeof pmRunInfo!=='undefined'&&pmRunInfo?pmRunInfo.slice(6,8)+'/'+pmRunInfo.slice(4,6)+' '+pmRunInfo.slice(8,10)+'.00 UTC':'harian')+') · klik peta untuk nilai titik</div></div>');
 if(typeof quakeLayer!=='undefined'&&quakeLayer&&map.hasLayer(quakeLayer))secs.push('<div class="wxsec"><b>🌋 Gempa BMKG — magnitudo</b>'+[[6,'#b91c1c','≥ 6'],[5,'#dc2626','5 – 6'],[4,'#ea580c','4 – 5'],[3,'#d97706','3 – 4'],[0,'#009444','< 3']].map(r=>'<div class="wxrow"><span class="wxdot" style="background:'+r[1]+';border-radius:50%"></span>M '+r[2]+'</div>').join('')+'</div>');
 const el=wxLegendEl();if(!secs.length){el.style.display='none';return}
 el.style.display='block';document.getElementById('wxBadge').textContent=secs.length;document.getElementById('wxBody').style.display=wxLegOpen?'block':'none';document.getElementById('wxChev').textContent=wxLegOpen?'▾':'▸';document.getElementById('wxBody').innerHTML=secs.join('')}
let wxSigLast='';setInterval(()=>{const sig=[typeof iaKey!=='undefined'&&iaKey,satKey,typeof radarLayer!=='undefined'&&!!radarLayer,typeof rainLayer!=='undefined'&&!!rainLayer,typeof gibsLayer!=='undefined'&&!!gibsLayer,typeof quakeLayer!=='undefined'&&!!quakeLayer&&map.hasLayer(quakeLayer),typeof avDotsOn!=='undefined'&&avDotsOn,typeof sgOn!=='undefined'&&sgOn,typeof ltOn!=='undefined'&&ltOn,typeof firOn!=='undefined'&&firOn,typeof pmOn!=='undefined'&&pmOn,typeof sstOn!=='undefined'&&sstOn,typeof anginOn!=='undefined'&&anginOn,typeof portOn!=='undefined'&&portOn,typeof perairanOn!=='undefined'&&perairanOn].join('|');if(sig!==wxSigLast){wxSigLast=sig;wxRender()}},1500);
(function(){const nm=document.querySelector('#side header .rk-name')||document.querySelector('#side header');if(!nm)return;const c=document.createElement('div');c.id='utcClock';c.style.cssText='font-size:11px;font-weight:600;letter-spacing:.03em;opacity:.88;margin-top:3px';nm.appendChild(c);const q=n=>String(n).padStart(2,'0');const tick=()=>{const d=new Date();const w=new Date(d.getTime()+8*3600*1000);c.textContent='🕐 UTC '+q(d.getUTCHours())+':'+q(d.getUTCMinutes())+':'+q(d.getUTCSeconds())+' · WITA '+q(w.getUTCHours())+':'+q(w.getUTCMinutes())+':'+q(w.getUTCSeconds())};tick();setInterval(tick,1000)})();
function satMenuChange(v){const sel=document.getElementById('satMenu');if(v===''){if(satKey)setSatProduct(satKey);if(typeof iaKey!=='undefined'&&iaKey)iaOff();if(sel)sel.value='';return}
 if(v.indexOf('ia:')===0){const k=v.slice(3);if(typeof iaKey==='undefined'||iaKey!==k)setIa(k)}else if(v!==satKey)setSatProduct(v);if(v&&v.indexOf('ia:')!==0){const ap=()=>{if(satKey&&!satPlaying&&satRuns.length>=2)satPlayToggle()};setTimeout(ap,2500);setTimeout(ap,6000)}}
function satMenuSync(){const sel=document.getElementById('satMenu');if(!sel||document.activeElement===sel)return;const cur=(typeof iaKey!=='undefined'&&iaKey)?'ia:'+iaKey:((satKey)||'');if(sel.value!==cur)sel.value=cur}
setInterval(satMenuSync,1500);
// ===== Penerbangan — METAR/TAF (MET Norway & AviationWeather/NOAA) =====
const AVSTATIONS=[
 {icao:'WAQQ',name:'Juwata Intl — Tarakan',lat:3.327,lon:117.568},
 {icao:'WBKW',name:'Tawau — Sabah, Malaysia',lat:4.316,lon:118.119},
 {icao:'WBKS',name:'Sandakan — Sabah, Malaysia',lat:5.901,lon:118.059},
 {icao:'WBKK',name:'Kota Kinabalu Intl — Sabah, Malaysia',lat:5.937,lon:116.051},
 {icao:'WBSB',name:'Brunei Intl — Brunei',lat:4.944,lon:114.928},
 {icao:'WALL',name:'Sepinggan Intl — Balikpapan',lat:-1.268,lon:116.894},
 {icao:'WAOO',name:'Syamsudin Noor — Banjarmasin',lat:-3.44,lon:114.759},
 {icao:'WIOO',name:'Supadio — Pontianak',lat:-0.151,lon:109.404},
 {icao:'WIII',name:'Soekarno-Hatta Intl — Jakarta',lat:-6.126,lon:106.656},
 {icao:'WADD',name:'Ngurah Rai Intl — Denpasar, Bali',lat:-8.748,lon:115.167},
 {icao:'WARR',name:'Juanda — Surabaya',lat:-7.38,lon:112.787},
 {icao:'WAAA',name:'Sultan Hasanuddin — Makassar',lat:-5.062,lon:119.554},
 {icao:'WIMM',name:'Kualanamu Intl — Medan',lat:3.642,lon:98.885},
 {icao:'WIBB',name:'Sultan Syarif Kasim II — Pekanbaru',lat:0.461,lon:101.42},
 {icao:'WIDD',name:'Hang Nadim — Batam',lat:1.121,lon:104.119},
 {icao:'WIPP',name:'Sultan Mahmud Badaruddin II — Palembang',lat:-2.9,lon:104.7},
 {icao:'WIEE',name:'Minangkabau Intl — Padang',lat:-0.7855,lon:100.2805},
 {icao:'WITT',name:'Sultan Iskandar Muda — Banda Aceh',lat:5.524,lon:95.42},
 {icao:'WAHI',name:'Yogyakarta Intl — Kulon Progo',lat:-7.788,lon:110.057},
 {icao:'WAHS',name:'Ahmad Yani — Semarang',lat:-6.973,lon:110.375},
 {icao:'WADL',name:'Lombok Intl — Praya',lat:-8.757,lon:116.277},
 {icao:'WATT',name:'El Tari — Kupang',lat:-10.172,lon:123.671},
 {icao:'WAMM',name:'Sam Ratulangi — Manado',lat:1.549,lon:124.927},
 {icao:'WAFF',name:'Mutiara SIS Al-Jufri — Palu',lat:-0.9146,lon:119.9075},
 {icao:'WAWW',name:'Haluoleo — Kendari',lat:-4.082,lon:122.418},
 {icao:'WAGG',name:'Tjilik Riwut — Palangkaraya',lat:-2.225,lon:113.943},
 {icao:'WAPP',name:'Pattimura — Ambon',lat:-3.708,lon:128.0869},
 {icao:'WAEE',name:'Babullah — Ternate',lat:0.832,lon:127.381},
 {icao:'WASS',name:'Domine Eduard Osok — Sorong',lat:-0.894,lon:131.288},
 {icao:'WAJJ',name:'Sentani — Jayapura',lat:-2.577,lon:140.516}];
let avIcao='WAQQ',avInit=false,avTimer=null;
const WXID={RA:'Hujan',DZ:'Gerimis',TS:'Badai petir',SH:'Hujan shower',FU:'Asap',HZ:'Kabut asap (haze)',BR:'Kabut tipis (mist)',FG:'Kabut tebal (fog)',GR:'Hujan es',GS:'Hujan es kecil',SN:'Salju',SQ:'Squall',NSW:'Tidak ada cuaca signifikan'};
const COVID={FEW:'Sedikit (few)',SCT:'Tersebar (scattered)',BKN:'Menutup sebagian besar (broken)',OVC:'Menutup penuh (overcast)',SKC:'Cerah',CLR:'Cerah',NSC:'Tidak ada awan signifikan',NCD:'Tidak terdeteksi (AUTO)',VV:'Langit tertutup vertikal'};
function avParseMetar(raw){
 const tk=raw.replace(/=/g,'').split(/\s+/).filter(Boolean);const o={raw,clouds:[],wx:[]};
 let i=tk.findIndex(t=>/^\d{6}Z$/.test(t));if(i<0)return o;
 o.time=tk[i];i++;
 if(tk[i]==='AUTO'){o.auto=true;i++}
 if(tk[i]==='COR')i++;
 const wm=/^(\d{3}|VRB)(\d{2,3})(G(\d{2,3}))?(KT|MPS)$/.exec(tk[i]||'');
 if(wm){o.wind={dir:wm[1]==='VRB'?null:+wm[1],spd:wm[5]==='MPS'?Math.round(+wm[2]*1.944):+wm[2],gust:wm[4]?+wm[4]:null};i++}
 if(/^\d{3}V\d{3}$/.test(tk[i]||'')){o.windVar=tk[i];i++}
 if(tk[i]==='CAVOK'){o.vis=9999;o.cavok=true;i++}
 else if(/^\d{4}$/.test(tk[i]||'')){o.vis=+tk[i];i++}
 else if(/^\d+SM$/.test(tk[i]||'')){o.vis=Math.round(parseFloat(tk[i])*1609);i++}
 else if(/^\d+\/\d+SM$/.test(tk[i]||'')){const ab=tk[i].replace('SM','').split('/');o.vis=Math.round((+ab[0]/+ab[1])*1609);i++}
 for(;i<tk.length;i++){const t=tk[i];
  if(/^R\d{2}/.test(t)||t==='NOSIG'){if(t==='NOSIG')o.nosig=true;continue}
  const cm=/^(FEW|SCT|BKN|OVC)(\d{3})/.exec(t);if(cm){o.clouds.push({cover:cm[1],baseFt:+cm[2]*100});continue}
  const vv=/^VV(\d{3})$/.exec(t);if(vv){o.clouds.push({cover:'VV',baseFt:+vv[1]*100});continue}
  if(/^(SKC|CLR|NSC|NCD)$/.test(t)){o.clouds.push({cover:t,baseFt:null});continue}
  const tm=/^(M?\d{2})\/(M?\d{2})$/.exec(t);if(tm){o.temp=tm[1][0]==='M'?-(+tm[1].slice(1)):+tm[1];o.dewp=tm[2][0]==='M'?-(+tm[2].slice(1)):+tm[2];continue}
  const q=/^Q(\d{4})$/.exec(t);if(q){o.qnh=+q[1];continue}
  if(/^[+-]?(VC)?(MI|BC|PR|DR|BL|SH|TS|FZ)?(DZ|RA|SN|SG|IC|PL|GR|GS|UP|BR|FG|FU|VA|DU|SA|HZ|PY|PO|SQ|FC|SS|DS)+$/.test(t)&&t.length>=2){o.wx.push(t);continue}
 }
 o.ceiling=null;for(const c of o.clouds){if((c.cover==='BKN'||c.cover==='OVC'||c.cover==='VV')&&c.baseFt!=null)o.ceiling=o.ceiling==null?c.baseFt:Math.min(o.ceiling,c.baseFt)}
 return o}
function avObsDate(ts){const m=/^(\d{2})(\d{2})(\d{2})Z$/.exec(ts||'');if(!m)return null;const now=new Date();let d=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),+m[1],+m[2],+m[3]));if(d-now>6*3600e3)d=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()-1,+m[1],+m[2],+m[3]));if(now-d>20*24*3600e3)d=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()+1,+m[1],+m[2],+m[3]));return d}
function avCat(o){if(o.vis==null&&o.ceiling==null)return{cat:'—',color:'#64748b',label:'Visibilitas/ceiling tidak dilaporkan pada METAR ini'};
 const v=o.vis==null?99999:o.vis,c=o.ceiling==null?99999:o.ceiling;
 if(v<1600||c<500)return{cat:'LIFR',color:'#c026d3',label:'LIFR — sangat rendah'};
 if(v<4800||c<1000)return{cat:'IFR',color:'#dc2626',label:'IFR — rendah'};
 if(v<=8000||c<=3000)return{cat:'MVFR',color:'#2563eb',label:'MVFR — marginal'};
 return{cat:'VFR',color:'#16a34a',label:'VFR — baik'}}
function avVisClass(v){if(v==null)return{color:'#9ca3af',label:'Data belum diperbarui'};if(v>8000)return{color:'#22c55e',label:'> 8 km'};if(v>=4800)return{color:'#38bdf8',label:'4,8 – 8 km'};if(v>=1600)return{color:'#eab308',label:'1,6 – 4,8 km'};return{color:'#ef4444',label:'< 1,6 km'}}
function avWxText(w){let s=w.replace(/^[+-]/,'');if(s.startsWith('VC'))s=s.slice(2);s=s.replace(/^(SH|TS|FZ|MI|BC|DR|BL)/,'');return WXID[s]||w}
async function loadAvMetar(){const body=document.getElementById('avMetarBody');if(!body)return;body.innerHTML='<p style="color:var(--mut)">Memuat METAR '+avIcao+'…</p>';
 let avLine=null,avSrc='MET Norway (api.met.no)';
 try{const r=await fetchTimeout('https://inasiam.bmkg.go.id/api/v1/opmet/'+avIcao+'?active=true',12000);const j=await r.json();if(j&&j.metar&&j.metar.raw){avLine=j.metar.raw;avSrc='BMKG — OPMET InaSIAM'}}catch(e){}
 try{
 if(!avLine){const r=await fetchTimeout('https://api.met.no/weatherapi/tafmetar/1.0/?content=metar&content_type=text/plain&icao='+avIcao,15000);const txt=await r.text();
 const lines=txt.split('\n').map(s=>s.trim()).filter(s=>s.startsWith(avIcao));
 if(!lines.length)throw new Error('kosong');avLine=lines[lines.length-1]}
 const o=avParseMetar(avLine);const cat=avCat(o);const vc=avVisClass(o.vis);const od=avObsDate(o.time);
 const age=od!=null?Math.max(0,Math.round((Date.now()-od)/60000)):null;
 const windTxt=o.wind?(o.wind.spd===0?'Tenang (calm)':((o.wind.dir==null?'Variabel (VRB)':String(o.wind.dir).padStart(3,'0')+'°')+' · '+o.wind.spd+' kt'+(o.wind.gust?' · gust '+o.wind.gust+' kt':''))+(o.windVar?' · arah bervariasi '+o.windVar:'')):'—';
 const cloudTxt=o.cavok?'CAVOK — cerah, vis ≥ 10 km':(o.clouds.length?o.clouds.map(c=>(COVID[c.cover]||c.cover)+(c.baseFt!=null?' · '+c.baseFt.toLocaleString('id-ID')+' ft':'')).join('; '):'—');
 const wxTxt=o.wx.length?o.wx.map(avWxText).join(', '):(o.nosig?'NOSIG — tidak ada perubahan signifikan':'Tidak ada cuaca terlaporkan');
 body.innerHTML=`<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><span style="background:${cat.color};color:#fff;font-weight:800;font-size:12px;padding:4px 10px;border-radius:999px">${cat.cat}</span><span style="font-size:12px;color:var(--mut)">${cat.label}</span><span style="margin-left:auto;font-size:12px;color:var(--mut)">${od?('Obs '+od.toISOString().slice(11,16)+' UTC · '+fmtWita(od.toISOString())):''}${age!=null?' · '+age+' mnt lalu':''}</span></div>
 <div class="avgrid">
 <div><small>Angin</small><b>${windTxt}</b></div>
 <div><small>Visibilitas</small><b><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${vc.color};margin-right:5px"></span>${o.vis!=null?(o.vis>=9999?'≥ 10 km':(o.vis/1000).toLocaleString('id-ID')+' km'):'—'}</b> <span style="color:var(--mut);font-size:11px">${vc.label}</span></div>
 <div><small>Suhu / Titik Embun</small><b>${o.temp!=null?o.temp+' °C / '+o.dewp+' °C':'—'}</b></div>
 <div><small>QNH</small><b>${o.qnh?o.qnh+' hPa':'—'}</b></div>
 <div><small>Cuaca</small><b>${wxTxt}</b></div>
 <div><small>Awan${o.ceiling!=null?' — ceiling '+o.ceiling.toLocaleString('id-ID')+' ft':''}</small><b>${cloudTxt}</b></div>
 </div>
 <div class="avraw">${o.raw}</div>
 <p style="font-size:11px;color:var(--mut)">Sumber: observasi METAR stasiun ${avIcao} via ${avSrc}. Auto-refresh 10 menit.</p>`;
 }catch(e){body.innerHTML='<p style="color:var(--mut)">METAR belum dapat dimuat — periksa koneksi lalu tekan Muat Ulang.</p>'}}
async function loadAvTaf(){const el=document.getElementById('avTafBody');if(!el)return;el.innerHTML='<p style="color:var(--mut)">Memuat TAF '+avIcao+'…</p>';
 const url='https://aviationweather.gov/api/data/taf?ids='+avIcao+'&format=json';
 let raw=null,valid=null,tafSrc='AviationWeather (NOAA)';
 try{const r=await fetchTimeout('https://inasiam.bmkg.go.id/api/v1/opmet/'+avIcao+'?active=true',12000);const j=await r.json();if(j&&j.taf&&j.taf.raw){raw=j.taf.raw;valid=[Date.parse(j.taf.validFrom)/1000,Date.parse(j.taf.validTo)/1000];tafSrc='BMKG — OPMET InaSIAM'}}catch(e){}
 if(!raw)try{const r=await fetchTimeout(url,12000);const j=await r.json();if(j&&j[0]&&j[0].rawTAF){raw=j[0].rawTAF;valid=[j[0].validTimeFrom,j[0].validTimeTo]}}catch(e){}
 if(!raw){try{const r=await fetchTimeout('https://api.allorigins.win/raw?url='+encodeURIComponent(url),20000);const j=await r.json();if(j&&j[0]&&j[0].rawTAF){raw=j[0].rawTAF;valid=[j[0].validTimeFrom,j[0].validTimeTo]}}catch(e){}}
 if(!raw){el.innerHTML='<p style="color:var(--mut)">TAF belum dapat dimuat dari server (pembatasan akses lintas-situs). Gunakan tombol InaSIAM di bawah untuk TAF resmi, atau tekan Muat Ulang pada kartu METAR.</p>';return}
 const f=e=>{const d=new Date(e*1000);const pz=x=>String(x).padStart(2,'0');return d.getUTCDate()+' '+BULAN[d.getUTCMonth()]+' '+pz(d.getUTCHours())+':'+pz(d.getUTCMinutes())+' UTC'};
 const vtxt=valid&&valid[0]?('Berlaku '+f(valid[0])+' s/d '+f(valid[1])):'';
 el.innerHTML=(vtxt?`<p style="font-size:12px"><b>${vtxt}</b> · ${fmtWita(new Date(valid[0]*1000).toISOString())} s/d ${fmtWita(new Date(valid[1]*1000).toISOString())}</p>`:'')+`<div class="avraw">${raw}</div><p style="font-size:11px;color:var(--mut)">Sumber: TAF ${avIcao} via ${tafSrc}, teks resmi apa adanya.</p>`}
function havKm(a,b,c,d){const R=6371,t=Math.PI/180;const s=Math.sin((c-a)*t/2)**2+Math.cos(a*t)*Math.cos(c*t)*Math.sin((d-b)*t/2)**2;return 2*R*Math.asin(Math.sqrt(s))}
async function loadAvList(){const el=document.getElementById('avAptList');if(!el)return;el.innerHTML='<p style="color:var(--mut)">Memuat METAR bandara sekitar…</p>';
 const rows=await Promise.allSettled(AVSTATIONS.map(async s=>{let line=null;try{const r=await fetchTimeout('https://inasiam.bmkg.go.id/api/v1/opmet/'+s.icao+'?active=true',12000);const j=await r.json();if(j&&j.metar&&j.metar.raw)line=j.metar.raw}catch(e){} if(!line){const r=await fetchTimeout('https://api.met.no/weatherapi/tafmetar/1.0/?content=metar&content_type=text/plain&icao='+s.icao,12000);const t=await r.text();const lines=t.split('\n').map(x=>x.trim()).filter(x=>x.startsWith(s.icao));if(!lines.length)throw new Error('kosong');line=lines[lines.length-1]}return{s,o:avParseMetar(line),dKm:Math.round(havKm(3.327,117.568,s.lat,s.lon))}}));
 const ok=rows.filter(r=>r.status==='fulfilled').map(r=>r.value).sort((a,b)=>a.dKm-b.dKm);
 if(!ok.length){el.innerHTML='<p style="color:var(--mut)">Data bandara sekitar belum dapat dimuat.</p>';return}
 el.innerHTML=ok.map(({s,o,dKm})=>{const vc=avVisClass(o.vis);const od=avObsDate(o.time);return `<button class="ghost avapt ${s.icao===avIcao?'on':''}" onclick="pilihBandara('${s.icao}',${s.lat},${s.lon})"><span style="width:9px;height:9px;border-radius:50%;background:${vc.color};flex:0 0 auto"></span><b>${s.icao}</b><span style="flex:1;text-align:left">${s.name}</span><span style="font-size:11px;opacity:.75">${dKm} km · ${od?od.toISOString().slice(11,16)+'Z':''} · ${o.wind?o.wind.spd+' kt':''} ${o.temp!=null?o.temp+'°C':''} · ${o.vis!=null?(o.vis>=9999?'≥10 km':(o.vis/1000).toLocaleString('id-ID')+' km'):'vis —'}</span></button>`}).join('')+'<p style="font-size:11px;color:var(--mut)">Titik warna = kelas visibilitas ala InaSIAM. Klik bandara untuk memuat METAR/TAF-nya dan terbang ke lokasinya.</p>'}
function pilihBandara(icao,lat,lon){avIcao=icao;document.getElementById('avTitle').textContent='Cuaca Penerbangan — '+icao;map.flyTo([lat,lon],9);loadAvMetar();loadAvTaf();loadAvList()}
function avClocks(){const u=document.getElementById('avUtc'),w=document.getElementById('avWita');if(!u)return;const n=new Date();const pz=x=>String(x).padStart(2,'0');u.textContent=pz(n.getUTCHours())+':'+pz(n.getUTCMinutes())+':'+pz(n.getUTCSeconds())+' UTC';const wt=new Date(n.getTime()+8*3600e3);w.textContent=pz(wt.getUTCHours())+':'+pz(wt.getUTCMinutes())+':'+pz(wt.getUTCSeconds())+' WITA'}
setInterval(avClocks,1000);
function initAv(){avClocks();if(avInit)return;avInit=true;loadAvMetar();loadAvTaf();loadAvList();avTimer=setInterval(()=>{loadAvMetar();loadAvList()},600000)}
function openAv(){document.getElementById('side').classList.remove('hidden');document.querySelector('[data-p="penerbangan"]').click();chipState('WAQQ',true)}
document.querySelector('[data-p="penerbangan"]').addEventListener('click',initAv);



// BMKG earthquakes
let quakeLayer=null;
function quakeMagColor(m){m=parseFloat(m);return m>=6?'#b91c1c':m>=5?'#dc2626':m>=4?'#ea580c':m>=3?'#d97706':'#009444'}
function richQuakePopup(g){const dt=g.DateTime?new Date(g.DateTime):null;const wita=dt&&!isNaN(dt)?fmtWita(dt.toISOString()).split('· ')[1]:'';const jam=(g.Jam||'').replace(/\s*WIB\s*/,'');
 return `<div class="qpop"><div class="qpop-head"><span class="qpop-mag" style="background:${quakeMagColor(g.Magnitude)}">M ${g.Magnitude}</span><div class="qpop-t"><b>Gempa Bumi</b><small>${g.Tanggal||''} · ${jam} WIB${wita?' · '+wita:''}</small></div></div><div class="qpop-grid"><div><small>Kedalaman</small><b>${g.Kedalaman||'—'}</b></div><div><small>Koordinat</small><b>${g.Lintang||''} — ${g.Bujur||''}</b></div></div><p class="qpop-wil">${g.Wilayah||''}</p>${g.Potensi?`<p class="qpop-row"><b>Potensi:</b> ${g.Potensi}</p>`:''}${g.Dirasakan?`<p class="qpop-row"><b>Dirasakan:</b> ${g.Dirasakan}</p>`:''}${g.Shakemap?`<img class="qpop-img" src="https://data.bmkg.go.id/DataMKG/TEWS/${g.Shakemap}" alt="Shakemap gempa" loading="lazy" onload="if(window.__qimg)window.__qimg()" onerror="this.style.display='none'"><small class="qpop-src">Shakemap (MMI) · Sumber: BMKG (data.bmkg.go.id)</small>`:'<small class="qpop-src">Sumber: BMKG (data.bmkg.go.id)</small>'}</div>`}
let lastQuakeMark=null;
window.__qimg=function(){setTimeout(()=>{if(map._popup)map._popup.update()},40)};
function qpopOpts(){return{className:'qpop-wrap',maxWidth:Math.min(330,Math.round(window.innerWidth*.86)),maxHeight:Math.max(240,Math.round(window.innerHeight*.68)),autoPan:true,keepInView:true,autoPanPaddingTopLeft:L.point(14,200),autoPanPaddingBottomRight:L.point(14,84)}}
function showQuakePopup(la,ln,g){if(lastQuakeMark)lastQuakeMark.remove();lastQuakeMark=L.circleMarker([la,ln],{radius:10,color:'#c0392b',fillColor:'#e74c3c',fillOpacity:.6}).addTo(map).bindPopup(richQuakePopup(g),qpopOpts());map.flyTo([la,ln],9);let opened=false;const tryOpen=()=>{if(!opened){opened=true;if(lastQuakeMark)lastQuakeMark.openPopup()}};map.once('moveend',tryOpen);setTimeout(tryOpen,2800)}
let pmLoadedAt=0;
function ispuCat(a){if(a==null)return{label:'—',color:'#64748b',txt:'#fff'};if(a<=50)return{label:'Baik',color:'#22c55e',txt:'#fff'};if(a<=100)return{label:'Sedang',color:'#2563eb',txt:'#fff'};if(a<=200)return{label:'Tidak Sehat',color:'#eab308',txt:'#1f2937'};if(a<=300)return{label:'Sangat Tidak Sehat',color:'#ef4444',txt:'#fff'};return{label:'Berbahaya',color:'#111827',txt:'#fff'}}
async function loadPM(force){
  const body=document.getElementById('pmBody');if(!body)return;
  if(!force&&pmLoadedAt&&Date.now()-pmLoadedAt<30*60000)return;
  body.innerHTML='<p style="color:var(--mut)">Memuat PM2.5 Tarakan…</p>';
  try{
    const j=await (await fetchTimeout('https://air-quality-api.open-meteo.com/v1/air-quality?latitude=3.3270&longitude=117.5683&current=pm2_5,pm10,us_aqi&hourly=pm2_5&timezone=Asia%2FMakassar&forecast_days=1',15000)).json();
    const c=j.current;if(!c)throw 0;
    pmLoadedAt=Date.now();
    const cat=ispuCat(pmToIspu(c.pm2_5));
    const hrs=j.hourly&&j.hourly.time?j.hourly.time:[],vals=j.hourly&&j.hourly.pm2_5?j.hourly.pm2_5:[];
    const nowH=hrs.indexOf(c.time);const upto=nowH>=0?nowH:vals.length-1;
    let mx=0,mxT='';for(let i=0;i<=upto&&i<vals.length;i++){if(vals[i]!=null&&vals[i]>mx){mx=vals[i];mxT=hrs[i]}}
    let bars='';const cap=Math.max(50,mx);
    for(let i=0;i<=upto&&i<vals.length;i++){const v=vals[i];if(v==null)continue;const hgt=Math.max(8,Math.round(v/cap*44));const bc=ispuCat(pmToIspu(v)).color;bars+='<div title="'+hrs[i].slice(11,16)+' · '+v+' µg/m³" style="flex:1;background:'+bc+';height:'+hgt+'px;border-radius:2px 2px 0 0"></div>'}
    body.innerHTML='<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><span style="background:'+cat.color+';color:'+(cat.txt||'#fff')+';font-weight:800;font-size:12px;padding:4px 10px;border-radius:999px">ISPU '+pmToIspu(c.pm2_5)+'</span><span style="font-size:12px;color:var(--mut)">'+cat.label+' · '+String(c.time).slice(11,16)+' WITA</span></div>'
     +'<div class="avgrid"><div><small>PM2.5</small><b>'+c.pm2_5+' µg/m³</b></div><div><small>PM10</small><b>'+c.pm10+' µg/m³</b></div><div><small>Puncak hari ini</small><b>'+mx+' µg/m³</b> <span style="color:var(--mut);font-size:11px">'+(mxT?mxT.slice(11,16)+' WITA':'')+'</span></div><div><small>Titik model</small><b>Juwata, Tarakan</b></div></div>'
     +(bars?'<div style="display:flex;align-items:flex-end;gap:2px;height:46px;margin:4px 0 2px">'+bars+'</div><p style="font-size:10.5px;color:var(--mut);margin:0">PM2.5 per jam hari ini (00.00–sekarang)</p>':'');
  }catch(e){body.innerHTML='<p style="color:var(--mut)">PM2.5 belum dapat dimuat — periksa koneksi lalu tekan Perbarui.</p>'}
}
let pmLayer=null,pmOn=false,pmRunInfo='';
function pmZoomLock(on){const db=L.latLngBounds(INDO_BOUNDS);if(on){map.options.minZoom=3;pmLockZ=map.getBoundsZoom(db,true);applyMinZoom();if(pmLockZ!==null&&map.getZoom()<pmLockZ)map.setZoom(pmLockZ);applyViewBounds()}else{pmLockZ=null;applyMinZoom();applyViewBounds()}}
function pmToIspu(v){if(v==null)return null;const B=[[0,15.5,0,50],[15.5,55.4,50,100],[55.4,150.4,100,200],[150.4,250.4,200,300],[250.4,500.4,300,500]];for(const s of B){if(v<=s[1])return Math.round((s[3]-s[2])/(s[1]-s[0])*(v-s[0])+s[2])}return 500}
const PMSPARTAN='https://spartan.bmkg.go.id/map/rgb_req/pcm_pm25/pm25/1000/';
function pmDs(d){const q=n=>String(n).padStart(2,'0');return ''+d.getUTCFullYear()+q(d.getUTCMonth()+1)+q(d.getUTCDate())+q(d.getUTCHours())+'00'}
function pmProbe(url){return new Promise(res=>{const im=new Image();let done=false;const t=setTimeout(()=>{if(!done){done=true;try{im.src=''}catch(_){}res(false)}},6000);im.onload=()=>{if(!done){done=true;clearTimeout(t);res(true)}};im.onerror=()=>{if(!done){done=true;clearTimeout(t);res(false)}};im.src=url})}
async function pmFindRun(){
  const now=new Date();const runs=[];
  for(let d=0;d<3;d++)for(const h of [18,0]){const r=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()-d,h,0));if(r<=now)runs.push(r)}
  for(const r of runs){
    const f1=new Date(r);f1.setUTCDate(f1.getUTCDate()+1);f1.setUTCHours(3,0,0,0);
    const f2=new Date(r.getTime()+3*3600e3);
    const f3=new Date(r);f3.setUTCDate(f3.getUTCDate()+1);f3.setUTCHours(12,0,0,0);
    for(const f of [f1,f2,f3]){const mr=pmDs(r),fc=pmDs(f);if(await pmProbe(PMSPARTAN+mr+'/'+fc+'/5/24/16.png'))return{mr,fc}}
  }
  return null;
}
let pmPopup=null;
async function pmTileClick(e){
  const lat=e.latlng.lat,lon=((e.latlng.lng+540)%360+360)%360-180;
  if(!pmPopup)pmPopup=L.popup(qpopOpts());
  pmPopup.setLatLng(e.latlng).setContent('<div class="qpop"><b>PM2.5 — Kualitas Udara</b><br><small>Memuat nilai titik…</small></div>').openOn(map);
  try{
    const r=await fetch('https://air-quality-api.open-meteo.com/v1/air-quality?latitude='+lat.toFixed(4)+'&longitude='+lon.toFixed(4)+'&current=pm2_5&timezone=Asia%2FMakassar');
    const j=await r.json();const v=j&&j.current?j.current.pm2_5:null;
    if(v==null)throw 0;
    const aq=pmToIspu(v),cat=ispuCat(aq);
    pmPopup.setContent('<div class="qpop"><div class="qpop-head"><span class="qpop-mag" style="background:'+cat.color+';color:'+(cat.txt||'#fff')+'">ISPU '+aq+'</span><div class="qpop-t"><b>PM2.5 — Kualitas Udara</b><small>'+lat.toFixed(3)+'°, '+lon.toFixed(3)+'°</small></div></div><div class="qpop-grid"><div><small>PM2.5 (estimasi titik)</small><b>'+v.toFixed(1)+' µg/m³</b></div><div><small>Kategori ISPU</small><b>'+cat.label+'</b></div></div><small class="qpop-src">Lapisan peta: model PCM BMKG (SPARTAN) · Nilai titik: estimasi CAMS via Open-Meteo (bukan stasiun ukur darat)</small></div>');
  }catch(_){pmPopup.setContent('<div class="qpop"><b>PM2.5 — Kualitas Udara</b><br><small>Nilai titik tidak tersedia untuk lokasi ini. Lapisan peta: model PCM BMKG (SPARTAN).</small></div>')}
}
async function togglePM(){
  if(pmOn){pmOn=false;pmZoomLock(false);if(pmLayer){map.removeLayer(pmLayer);pmLayer=null}map.off('click',pmTileClick);chipState('PM2.5',false);if(typeof wxRender==='function')wxRender();toast('Layer PM2.5 BMKG dimatikan');return}
  pmZoomLock(true);
  toast('🌫 Mencari data PM2.5 BMKG (SPARTAN)…');
  const f=await pmFindRun();
  if(!f){pmZoomLock(false);toast('⚠️ Tile PM2.5 BMKG belum tersedia saat ini — coba lagi nanti');return}
  pmLayer=L.tileLayer(PMSPARTAN+f.mr+'/'+f.fc+'/{z}/{x}/{y}.png',{tms:true,maxNativeZoom:8,opacity:.7,attribution:'PM2.5 © BMKG — model PCM (SPARTAN)'}).addTo(map);
  pmOn=true;pmRunInfo=f.mr;pmZoomLock(true);
  map.on('click',pmTileClick);
  chipState('PM2.5',true);if(typeof wxRender==='function')wxRender();
  toast('🌫 PM2.5 BMKG (PCM) aktif — run '+f.mr.slice(6,8)+'/'+f.mr.slice(4,6)+' '+f.mr.slice(8,10)+'.00 UTC');
}
async function loadQuake(mode){try{const url=mode==='terkini'?'https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json':'https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json';const r=await fetch(url);const j=await r.json();const list=j.Infogempa.gempa;if(quakeLayer)map.removeLayer(quakeLayer);quakeLayer=L.markerClusterGroup();let html='<table><tr><th>M</th><th>Wilayah</th><th>Waktu</th></tr>';list.slice(0,15).forEach(g=>{const [la,ln]=g.Coordinates.split(',').map(Number);const m=L.circleMarker([la,ln],{radius:Math.max(5,g.Magnitude*1.6),color:'#ef4444',fillColor:'#f97316',fillOpacity:.7}).bindPopup(richQuakePopup(g),qpopOpts());quakeLayer.addLayer(m);html+=`<tr><td>${g.Magnitude}</td><td>${g.Wilayah}</td><td>${g.Tanggal} ${g.Jam}</td></tr>`});quakeLayer.addTo(map);chipState('Gempa',true);document.getElementById('quakeList').innerHTML=html+'</table>';toast('Data gempa BMKG dimuat: '+list.length+' kejadian')}catch(e){document.getElementById('quakeList').innerHTML='<p>Gagal memuat BMKG (CORS/jaringan). Coba lagi atau buka data.bmkg.go.id.</p>'}}
function toggleQuake(){if(quakeLayer&&map.hasLayer(quakeLayer)){map.removeLayer(quakeLayer);chipState('Gempa',false);toast('Layer gempa dimatikan');return}document.querySelector('[data-p="geodisaster"]').click();chipState('Gempa',true);flyIndo();loadQuake('terkini')}
// Klik peta: detail lokasi & cuaca — model popup bandara (avpop)
let clickPopup=null,lastPopupTs=0;
map.on('popupopen',e=>{if(e.popup!==clickPopup)lastPopupTs=Date.now()});
map.on('click',e=>{
  const clickTs=Date.now();const lat=e.latlng.lat,lng=((e.latlng.lng+540)%360+360)%360-180;
  setTimeout(async()=>{
    if(lastPopupTs>=clickTs-10)return;
    if(!clickPopup)clickPopup=L.popup(avPopOpts());
    clickPopup.setLatLng(e.latlng).setContent('<b style="display:block;font-size:14px;line-height:1.3;padding-right:20px">Detail Lokasi</b><div style="font-size:10.5px;color:#5b7a99;margin:3px 0 0;line-height:1.5">Koordinat: '+lat.toFixed(6)+', '+lng.toFixed(6)+'</div><p style="font-size:12px;color:var(--mut);margin:10px 0 2px">Memuat alamat & cuaca…</p>').openOn(map);
    let addr=null,addrParts=null;
    try{const r=await fetch('https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat='+lat+'&lon='+lng+'&zoom=18',{headers:{'Accept-Language':'id'}});const j=await r.json();addr=j.display_name||null;addrParts=j.address||null}catch(_){}
    let wx=null;
    try{const w=await (await fetch('https://api.open-meteo.com/v1/forecast?latitude='+lat+'&longitude='+lng+'&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&timezone=auto')).json();wx=w.current||null}catch(_){}
    if(!map.hasLayer(clickPopup))return;
    const nm=addrParts?([addrParts.village,addrParts.suburb,addrParts.neighbourhood,addrParts.town,addrParts.city,addrParts.county].find(Boolean)||'Detail Lokasi'):'Detail Lokasi';
    const cell=(l,v)=>'<div><small>'+l+'</small><b>'+v+'</b></div>';
    clickPopup.setContent('<b style="display:block;font-size:14px;line-height:1.3;padding-right:20px">'+nm+'</b>'
      +'<div style="font-size:10.5px;color:#5b7a99;margin:3px 0 0;line-height:1.5">Koordinat: '+lat.toFixed(6)+', '+lng.toFixed(6)+'</div>'
      +(wx?'<div class="avgrid">'+cell('Suhu',wx.temperature_2m+' °C')+cell('Kelembaban',wx.relative_humidity_2m+' %')+cell('Angin',wx.wind_speed_10m+' km/j')+cell('Hujan',wx.precipitation+' mm')+'</div>':'<p style="font-size:12px;color:var(--mut);margin:10px 0 2px">Cuaca titik ini belum termuat.</p>')
      +(addr?'<p style="font-size:11.5px;color:var(--mut2);line-height:1.5;margin:2px 0 0">'+addr+'</p>':'')
      +'<small class="qpop-src" style="padding:6px 0 0">Sumber: alamat © OpenStreetMap · cuaca Open-Meteo</small>');
  },80);
});
// Search (Nominatim)
async function cari(){const q=document.getElementById('q').value.trim();if(!q)return;const r=await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q+', Indonesia')}`);const j=await r.json();if(j[0]){map.flyTo([+j[0].lat,+j[0].lon],12);L.marker([+j[0].lat,+j[0].lon]).addTo(map).bindPopup(j[0].display_name).openPopup()}else toast('Tidak ditemukan')}
// ===== Data Wilayah LENGKAP: API statis Kemendagri (Emsifa v2, CORS terbuka, lazy per level) =====
const WILAPI='https://www.emsifa.com/api-wilayah-indonesia/v2';
const provSel=document.getElementById('prov'),kabSel=document.getElementById('kab'),kecSel=document.getElementById('kec'),desaSel=document.getElementById('desa');
let wilData={prov:null,kab:null,kec:null,desa:null},wilPathGeo=null,wilLayer=null,wilMarker=null;
const rpFmt=n=>n==null?'-':Number(n).toLocaleString('id-ID');
async function wilFetch(path){const r=await fetch(`${WILAPI}/${path}`);if(!r.ok)throw new Error(r.status);const j=await r.json();return j.data}
function isiSelect(sel,items,ph){sel.innerHTML='';sel.add(new Option(ph,''));items.forEach(x=>{const o=new Option(x.name,x.id);o.dataset.raw=JSON.stringify(x);sel.add(o)})}
function selObj(sel){const o=sel.options[sel.selectedIndex];if(!o||!o.dataset.raw)return null;try{return JSON.parse(o.dataset.raw)}catch(_){return null}}
async function initWilayah(){try{const d=await wilFetch('provinces.json');isiSelect(provSel,d,'— Pilih provinsi (38) —');document.getElementById('wilayahStatus').textContent='Data wilayah termuat: 38 provinsi. Pilih berurutan sampai desa.'}catch(e){document.getElementById('wilayahStatus').textContent='Gagal memuat API wilayah — cek koneksi lalu muat ulang halaman.'}}
provSel.onchange=async()=>{clearWilMap();wilData={prov:selObj(provSel),kab:null,kec:null,desa:null};isiSelect(kabSel,[],'Memuat kab/kota…');isiSelect(kecSel,[],'Pilih kab/kota dahulu');isiSelect(desaSel,[],'Pilih kecamatan dahulu');tampilIndikator();if(!provSel.value)return;try{const d=await wilFetch(`regencies/${provSel.value}.json`);isiSelect(kabSel,d,`— Pilih kab/kota (${d.length}) —`)}catch(e){isiSelect(kabSel,[],'Gagal memuat')}};
kabSel.onchange=async()=>{clearWilMap();wilData.kab=selObj(kabSel);wilData.kec=null;wilData.desa=null;isiSelect(kecSel,[],'Memuat kecamatan…');isiSelect(desaSel,[],'Pilih kecamatan dahulu');tampilIndikator();if(!kabSel.value)return;try{const d=await wilFetch(`districts/${kabSel.value}.json`);isiSelect(kecSel,d,`— Pilih kecamatan (${d.length}) —`)}catch(e){isiSelect(kecSel,[],'Gagal memuat')}};
kecSel.onchange=async()=>{clearWilMap();wilData.kec=selObj(kecSel);wilData.desa=null;isiSelect(desaSel,[],'Memuat desa/kelurahan…');tampilIndikator();if(!kecSel.value)return;try{const d=await wilFetch(`villages/${kecSel.value}.json`);isiSelect(desaSel,d,`— Pilih desa/kelurahan (${d.length}) —`)}catch(e){isiSelect(desaSel,[],'Gagal memuat')}};
desaSel.onchange=()=>{clearWilMap();wilData.desa=selObj(desaSel);tampilIndikator()};
function wilTerpilih(){return wilData.desa||wilData.kec||wilData.kab||wilData.prov}
function wilNamaLengkap(){return [wilData.desa?.name,wilData.kec?.name,wilData.kab?.name,wilData.prov?.name].filter(Boolean).join(', ')}
function tampilIndikator(){const w=wilTerpilih();const el=document.getElementById('indikator');if(!w){el.innerHTML='<p>Belum ada wilayah dipilih.</p>';return}
let h=`<table><tr><td>Kode Kemendagri</td><td><b>${w.id}</b></td></tr><tr><td>Nama</td><td><b>${w.name}</b></td></tr>`;if(w.capital)h+=`<tr><td>Ibu kota</td><td>${w.capital}</td></tr>`;if(w.population)h+=`<tr><td>Penduduk</td><td>${rpFmt(w.population)} jiwa</td></tr>`;if(w.total_area)h+=`<tr><td>Luas</td><td>${rpFmt(w.total_area)} km²</td></tr>`;if(w.elv!=null)h+=`<tr><td>Elevasi</td><td>${w.elv} mdpl</td></tr>`;if(w.tz)h+=`<tr><td>Zona waktu</td><td>UTC+${w.tz}</td></tr>`;if(w.postal_code)h+=`<tr><td>Kode pos</td><td>${w.postal_code}</td></tr>`;if(w.lat)h+=`<tr><td>Titik pusat</td><td>${Number(w.lat).toFixed(5)}, ${Number(w.lng).toFixed(5)}</td></tr>`;el.innerHTML=h+'</table>'}
function terbangWilayah(){const w=wilTerpilih();if(!w||w.lat==null){toast('Pilih wilayah dulu sampai level yang punya koordinat');return}const z=wilData.desa?15:wilData.kec?13:wilData.kab?11:8;map.flyTo([w.lat,w.lng],z);if(wilMarker)map.removeLayer(wilMarker);wilMarker=L.marker([w.lat,w.lng]).addTo(map).bindPopup(richWilPopup(w,null),qpopOpts());wilMarker.openPopup();toast(wilNamaLengkap())}
function wilLevel(){return wilData.desa?'Desa/Kelurahan':wilData.kec?'Kecamatan':wilData.kab?'Kabupaten/Kota':'Provinsi'}
function geoAreaKm2(path){const R=6378137;let t=0;const ring=a=>{let s=0;for(let i=0;i<a.length;i++){const p1=a[i],p2=a[(i+1)%a.length];s+=(p2[1]-p1[1])*Math.PI/180*(2+Math.sin(p1[0]*Math.PI/180)+Math.sin(p2[0]*Math.PI/180))}return s*R*R/2};(path||[]).forEach(poly=>{t+=Math.abs(ring(poly))});return t/1e6}
function richWilPopup(w,path){const chain=[wilData.desa?.name,wilData.kec?.name,wilData.kab?.name,wilData.prov?.name].filter(Boolean);const parents=chain.slice(1).join(' · ');let ctr=null;if(w.lat!=null)ctr=[w.lat,w.lng];else if(path&&path.length){let a=90,b=-90,c=180,d=-180;path.flat().forEach(pt=>{a=Math.min(a,pt[0]);b=Math.max(b,pt[0]);c=Math.min(c,pt[1]);d=Math.max(d,pt[1])});ctr=[(a+b)/2,(c+d)/2]}
 const luas=w.total_area?rpFmt(w.total_area)+' km²':(path&&path.length?'± '+geoAreaKm2(path).toLocaleString('id-ID',{maximumFractionDigits:2})+' km² (dari geometri)':null);
 const lvl=wilLevel();const badge=lvl==='Desa/Kelurahan'?'DESA':lvl==='Kecamatan'?'KEC.':lvl==='Kabupaten/Kota'?'KAB/KOTA':'PROV.';
 return `<div class="qpop"><div class="qpop-head"><span class="qpop-mag" style="background:#009444;font-size:13px">${badge}</span><div class="qpop-t"><b>${w.name}</b><small>${lvl}${parents?' · '+parents:''}</small></div></div><div class="qpop-grid"><div><small>Kode Kemendagri</small><b>${w.id}</b></div><div><small>Kode Pos</small><b>${w.postal_code||'—'}</b></div>${ctr?`<div><small>Titik Pusat</small><b>${ctr[0].toFixed(5)}, ${ctr[1].toFixed(5)}</b></div>`:''}${luas?`<div><small>Luas Wilayah</small><b>${luas}</b></div>`:''}</div>${w.capital?`<p class="qpop-row"><b>Ibu kota:</b> ${w.capital}</p>`:''}${w.population?`<p class="qpop-row"><b>Penduduk:</b> ${rpFmt(w.population)} jiwa</p>`:''}${w.elv!=null?`<p class="qpop-row"><b>Elevasi:</b> ${w.elv} mdpl</p>`:''}<small class="qpop-src">${path?`Batas wilayah · ${path.length} poligon · `:''}Sumber: API Wilayah Kemendagri (Emsifa) — batas indikatif untuk visualisasi</small></div>`}
async function ambilPath(code){const d=await wilFetch(`paths/${code}.json`);return d.path}
async function gambarBatas(){const w=wilTerpilih();if(!w){toast('Pilih wilayah dulu');return}if(w.has_path===false){toast('Wilayah ini belum punya polygon di API');return}const st=document.getElementById('wilayahStatus');st.textContent='Memuat polygon batas '+w.name+'…';try{const path=await ambilPath(w.id);wilPathGeo=path;if(wilLayer)map.removeLayer(wilLayer);const __core=L.polygon(path,{color:'#005baa',weight:3.5,fillColor:'#0072bc',fillOpacity:.16});const __casing=L.polygon(path,{color:'#ffffff',weight:8,opacity:.65,fill:false,interactive:false});wilLayer=L.layerGroup([__casing,__core]).addTo(map);__core.bindPopup(richWilPopup(w,path),qpopOpts());map.fitBounds(__core.getBounds());let __op=false;const __tryO=()=>{if(!__op){__op=true;__core.openPopup()}};map.once('moveend',__tryO);setTimeout(__tryO,1600);st.textContent='Batas '+w.name+' tampil di peta ('+path.length+' poligon).'}catch(e){st.textContent='Gagal memuat polygon batas wilayah ini.'}}
function downloadWilayah(){if(!wilPathGeo){toast('Klik "Gambar Batas" dulu');return}const w=wilTerpilih();const fc={type:'FeatureCollection',features:[{type:'Feature',properties:{kode:w.id,nama:wilNamaLengkap()},geometry:{type:'MultiPolygon',coordinates:wilPathGeo.map(poly=>[poly.map(p=>[p[1],p[0]])])}}]};const b=new Blob([JSON.stringify(fc)],{type:'application/geo+json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='batas-'+w.id+'.geojson';a.click()}
function clearWilMap(){if(wilLayer)map.removeLayer(wilLayer);wilLayer=null;if(wilMarker)map.removeLayer(wilMarker);wilMarker=null;wilPathGeo=null;map.closePopup()}
function resetWilayah(){clearWilMap();provSel.selectedIndex=0;kabSel.innerHTML='<option>Pilih provinsi dahulu</option>';kecSel.innerHTML='<option>Pilih kab/kota dahulu</option>';desaSel.innerHTML='<option>Pilih kecamatan dahulu</option>';wilData={prov:null,kab:null,kec:null,desa:null};tampilIndikator();document.getElementById('wilayahStatus').textContent='Pilihan wilayah direset.'}
initWilayah();

// fetchTimeout (dipakai panel cuaca & data live)
async function fetchTimeout(url,ms){const c=new AbortController();const t=setTimeout(()=>c.abort(),ms||20000);try{return await fetch(url,{signal:c.signal})}finally{clearTimeout(t)}}
// GeoFarm calculator
// GeoPangan demo chart
// Tanya SIGAP (rule-based lokal; produksi: sambungkan LLM)

document.getElementById('gibsDate').value=new Date(Date.now()-864e5).toISOString().slice(0,10);document.getElementById('gibsDate').dataset.auto='1';document.getElementById('gibsDate').addEventListener('change',e=>{e.target.dataset.auto=''})
toast('Selamat datang di SIGAP JUWATA — klik peta untuk cuaca & alamat, atau muat Gempa BMKG.');


// ===== Shell v2: elemen melayang, loading, modal sambutan (struktur mengikuti situs acuan) =====
(function(){
 // Search & quick bar adalah elemen melayang di atas peta (bukan isi sidebar) — pindahkan ke body
 const s=document.getElementById('search'),q=document.getElementById('quick');
 if(s)document.body.appendChild(s); if(q)document.body.appendChild(q);
 // Tambah item quick-layer sesuai daftar situs acuan
 if(q){const extra=[['✈ WAQQ',"openAv()"],['🛰 Himawari',"document.querySelector('[data-p=geoportal]').click();document.getElementById('side').classList.remove('hidden');setSatProduct('eh')"],['🌫 PM2.5',"togglePM();document.querySelector('[data-p=geodisaster]').click();document.getElementById('side').classList.remove('hidden')"],['🌊 SST',"toggleSST()"],['💨 Angin',"toggleAngin()"],['🗺 Boundaries',"bndToggle()"],['⚓ Pelabuhan',"openPorts()"],['🌊 Perairan',"togglePerairan()"]];
 extra.forEach(([label,fn])=>{const b=document.createElement('button');b.textContent=label;b.setAttribute('onclick',fn);q.appendChild(b)});}
 // Klik peta membuka sheet detail kanan
 
 // ===== Panel Gempa Terkini BMKG (autogempa) + ticker, ala beranda bmkg.go.id =====
 const fab=document.createElement('button');fab.id='fabMenu';fab.title='Buka/tutup menu';fab.innerHTML='<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h10"/></svg>';fab.onclick=()=>document.getElementById('side').classList.toggle('hidden');document.body.appendChild(fab);
 const sideEl=document.getElementById('side');
 const handle=document.createElement('div');handle.id='sheetHandle';handle.title='Ubah tinggi panel';handle.innerHTML='<i></i>';
 handle.onclick=()=>{if(handle._dragged){handle._dragged=false;return}if(sideEl.classList.contains('sheet-full')){sideEl.classList.remove('sheet-full');sideEl.classList.add('sheet-peek')}else if(sideEl.classList.contains('sheet-peek')){sideEl.classList.remove('sheet-peek')}else sideEl.classList.add('sheet-full')};
 sideEl.insertBefore(handle, sideEl.firstChild);
  let _dy=null,_dh=0,_dm=false;
  handle.addEventListener('pointerdown',e=>{_dy=e.clientY;_dh=sideEl.getBoundingClientRect().height;_dm=false;sideEl.classList.add('sheet-drag');try{handle.setPointerCapture(e.pointerId)}catch(_){}});
  handle.addEventListener('pointermove',e=>{if(_dy===null)return;const dy=_dy-e.clientY;if(Math.abs(dy)>6)_dm=true;sideEl.style.height=Math.max(120,Math.min(window.innerHeight*0.9,_dh+dy))+'px'});
  const _dEnd=()=>{if(_dy===null)return;_dy=null;sideEl.classList.remove('sheet-drag');handle._dragged=_dm;const cur=sideEl.getBoundingClientRect().height;sideEl.style.height='';const vh=window.innerHeight;const cand=[['sheet-peek',138],[null,vh*0.56],['sheet-full',vh*0.88]];let best=null,bd=1e9;cand.forEach(c=>{const d=Math.abs(cur-c[1]);if(d<bd){bd=d;best=c}});sideEl.classList.remove('sheet-full','sheet-peek');if(best&&best[0])sideEl.classList.add(best[0])};
  handle.addEventListener('pointerup',_dEnd);handle.addEventListener('pointercancel',_dEnd);
 const geoPanel=document.getElementById('p-geonusa');
 if(geoPanel){
   const bq=document.getElementById('bmkgQuake'),bw=document.getElementById('bmkgWeather'),bn=document.getElementById('bmkgWarn');
   [bq,bw,bn].forEach(el=>{if(el){el.classList.add('subA');el.style.margin='0 0 10px'}});
   if(bq)geoPanel.prepend(bq,bw,bn);
   geoPanel.querySelectorAll(':scope > .card').forEach(c=>c.classList.add('subB'));
   const seg=document.createElement('div');seg.id='geonusaSeg';
   seg.innerHTML='<button class="on" data-seg="A">Info Terkini</button><button data-seg="B">Data Wilayah</button>';
   geoPanel.insertBefore(seg, geoPanel.firstChild);
   const applySeg=A=>{geoPanel.querySelectorAll('.subA').forEach(e=>e.style.display=A?'':'none');geoPanel.querySelectorAll('.subB').forEach(e=>e.style.display=A?'none':'');geoPanel.scrollTop=0};
   seg.querySelectorAll('button').forEach(b=>b.onclick=()=>{seg.querySelectorAll('button').forEach(x=>x.classList.remove('on'));b.classList.add('on');applySeg(b.dataset.seg==='A')});
   applySeg(true);
   const dashFit=document.createElement('div');dashFit.id='dashFit';dashFit.style.transformOrigin='top center';
   dashFit.append(seg,bq,bw,bn);geoPanel.insertBefore(dashFit,geoPanel.firstChild);
   const fitDash=()=>{const isA=seg.querySelector('[data-seg="A"]').classList.contains('on');dashFit.style.transform='';dashFit.style.height='';dashFit.style.marginTop='';if(!isA)return;const scroller=document.getElementById('panels');const cs=getComputedStyle(scroller);const avail=scroller.clientHeight-(parseFloat(cs.paddingTop)||0)-(parseFloat(cs.paddingBottom)||0);const need=dashFit.scrollHeight;};
   let fitPend=false;const fitSoon=()=>{if(fitPend)return;fitPend=true;requestAnimationFrame(()=>{fitPend=false;fitDash()})};
   new MutationObserver(fitSoon).observe(dashFit,{childList:true,subtree:true,characterData:true});
   window.addEventListener('resize',fitSoon);window.addEventListener('orientationchange',fitSoon);
   if(window.ResizeObserver){try{new ResizeObserver(fitSoon).observe(document.getElementById('panels'))}catch(_){}}
   handle.addEventListener('click',()=>setTimeout(fitSoon,340));
   fab.addEventListener('click',()=>setTimeout(fitSoon,80));
   fitSoon();
 }
 const BMKG_URI='data:image/webp;base64,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';
 const bl=document.getElementById('brandLogo');if(bl)bl.src=BMKG_URI;
 const fav=document.createElement('link');fav.rel='icon';fav.type='image/webp';fav.href=BMKG_URI;document.head.appendChild(fav);
 const modalCard=document.querySelector('#welcomeModal .wel-card')||document.querySelector('.modal-card');
 if(modalCard&&!modalCard.querySelector('.bmkg-emblem')){const im=document.createElement('img');im.className='bmkg-emblem';im.src=BMKG_URI;im.alt='Logo BMKG';im.width=61;im.height=76;im.style.cssText='display:block;margin:2px auto 8px';modalCard.insertBefore(im,modalCard.firstChild)}
 const loadCard=document.querySelector('#loading .load-card, #loading>div');
 if(loadCard&&!loadCard.querySelector('.bmkg-emblem')){const im2=document.createElement('img');im2.className='bmkg-emblem';im2.src=BMKG_URI;im2.alt='Logo BMKG';im2.width=52;im2.height=64;im2.style.cssText='display:block;margin:0 auto 8px';loadCard.insertBefore(im2,loadCard.firstChild)}
 const tick=document.createElement('div');tick.id='ticker';tick.innerHTML='<b>INFO TERKINI</b><span class="track" id="tickerText">Memuat informasi gempa terkini BMKG…</span>';document.body.appendChild(tick);
 async function loadBmkgQuake(){try{const j=await (await fetch('https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json')).json();const g=j.Infogempa.gempa;const [la,ln]=String(g.Coordinates).split(',').map(Number);
 window.__gq={la,ln,g};
 document.getElementById('bmkgQuakeBody').innerHTML=`<div style="display:flex;gap:12px;align-items:center"><div class="mag">M ${g.Magnitude}</div><div style="font-size:12px;color:var(--mut2)">${g.Tanggal} · ${g.Jam}<br>Kedalaman: ${g.Kedalaman}</div></div><table><tr><td>Koordinat</td><td><b>${g.Lintang} — ${g.Bujur}</b></td></tr><tr><td>Wilayah</td><td>${g.Wilayah}</td></tr><tr><td>Potensi</td><td>${g.Potensi}</td></tr>${g.Dirasakan?`<tr><td>Dirasakan</td><td>${g.Dirasakan}</td></tr>`:''}</table><button class="ghost" style="margin-top:6px;font-size:12px" onclick="showQuakePopup(window.__gq.la,window.__gq.ln,window.__gq.g)">Lihat di Peta</button>`;
 document.getElementById('tickerText').textContent=`Gempa terkini: M ${g.Magnitude} — ${g.Wilayah} · ${g.Tanggal} ${g.Jam} · Kedalaman ${g.Kedalaman} · ${g.Potensi} ——— Data: BMKG (data.bmkg.go.id) · Peta: SIGAP JUWATA · Stasiun Meteorologi Juwata Tarakan · Informasi bersifat informatif, verifikasi ke sumber resmi untuk keperluan formal.`;}catch(e){document.getElementById('bmkgQuakeBody').innerHTML='<p style="color:var(--mut);font-size:12px;margin:0">Gagal memuat data BMKG saat ini — coba muat ulang.</p>'}}
 loadBmkgQuake();setInterval(loadBmkgQuake,300000);
 // ===== Cuaca Saat Ini + Peringatan Dini BMKG (API publik per adm4, fallback Open-Meteo berlabel) =====
 const WXDEF={adm4:'65.71.01.1003',lat:3.323078286644417,lng:117.56477091091234,nama:'Karang Anyar Pantai, Kota Tarakan'};
 function wxJam(e){const s=e.local_datetime||e.datetime||e.utc_datetime||'';const m=String(s).match(/(\d{2}):(\d{2})/);return m?m[1]+':'+m[2]:''}
 function wxWaktu(e){const s=e.local_datetime||e.datetime||'';const d=new Date(String(s).replace(' ','T'));return isNaN(d)?null:d}
 function renderWarn(list,nama,sumber){const el=document.getElementById('bmkgWarnBody');if(!list.length){el.innerHTML=`<div class="warn-item" style="border-left-color:#009444;background:#ecfdf3;color:#14532d">Tidak ada potensi cuaca signifikan (hujan lebat / hujan petir / angin kencang) di ${nama} dalam 24 jam ke depan menurut ${sumber}.</div>`;return}
 el.innerHTML=list.map(w=>`<div class="warn-item"><b>${w.jenis}</b> — potensi pada ${w.kapan} di ${nama}. Waspada dampak turunan (genangan, pohon tumbang, jarak pandang turun). Ini penilaian otomatis dari prakiraan, bukan Peringatan Dini resmi — rujuk tombol resmi BMKG di bawah.</div>`).join('')}
 async function loadBmkgWeather(adm4,lat,lng,namaLabel){const wb=document.getElementById('bmkgWeatherBody');wb.innerHTML='<p style="color:var(--mut);font-size:12px;margin:0">Memuat prakiraan cuaca BMKG…</p>';
 try{const r=await fetchTimeout(`https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${adm4}`,15000);if(!r.ok)throw new Error('http '+r.status);const j=await r.json();
 const grup=(j.data&&j.data[0]&&j.data[0].cuaca)||[];const flat=[];grup.forEach(h=>{if(Array.isArray(h))h.forEach(e=>flat.push(e))});if(!flat.length)throw new Error('struktur kosong');
 const lok=(j.data[0]&&j.data[0].lokasi)||j.lokasi||{};const nama=namaLabel||[lok.desa,lok.kecamatan,lok.kotakab].filter(Boolean).join(', ')||adm4;
 const now=new Date();let idx=flat.findIndex(e=>{const d=wxWaktu(e);return d&&d>=new Date(now.getTime()-90*60000)});if(idx<0)idx=0;const e=flat[idx];
 wb.innerHTML=`<div class="wx-now"><div class="t">${e.t}°C</div><div style="font-size:12.5px;color:var(--mut2)"><b style="color:var(--txt)">${e.weather_desc||'-'}</b><br>${nama}<br>💧 ${e.hu}% · 💨 ${e.ws} km/j ${e.wd||''} · 🌧 ${e.tp} mm${e.vs_text?` · 👁 ${e.vs_text}`:''}</div></div><div class="wx-row">${flat.slice(idx+1,idx+5).map(x=>`<div>${wxJam(x)}<br><b>${x.weather_desc||''}</b><br>${x.t}°C</div>`).join('')}</div><p style="color:var(--mut);font-size:11px;margin:6px 0 0">Sumber: API publik BMKG per wilayah adm4 ${adm4} · diperbarui ${new Date().toLocaleTimeString('id-ID')}.</p>`;
 const batas=new Date(now.getTime()+24*3600000);const warns=[];flat.forEach(x=>{const d=wxWaktu(x);if(!d||d<now||d>batas)return;const ds=String(x.weather_desc||'');if(/petir/i.test(ds))warns.push({jenis:'Hujan Petir',kapan:wxJam(x)+' ('+d.toLocaleDateString('id-ID',{weekday:'short'})+')'});else if(/lebat/i.test(ds))warns.push({jenis:'Hujan Lebat',kapan:wxJam(x)+' ('+d.toLocaleDateString('id-ID',{weekday:'short'})+')'});if(Number(x.ws)>=38)warns.push({jenis:'Angin Kencang '+x.ws+' km/j',kapan:wxJam(x)})});
 renderWarn(warns.slice(0,4),nama,'prakiraan BMKG')}catch(err){
 // Fallback transparan: Open-Meteo pada titik wilayah
 try{const w=await (await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&hourly=weather_code,wind_speed_10m&forecast_days=2&timezone=auto`)).json();const c=w.current;const kode={0:'Cerah',1:'Cerah Berawan',2:'Berawan',3:'Berawan Tebal',45:'Berkabut',48:'Berkabut',51:'Gerimis Ringan',53:'Gerimis',55:'Gerimis Lebat',61:'Hujan Ringan',63:'Hujan Sedang',65:'Hujan Lebat',71:'Salju',80:'Hujan Ringan',81:'Hujan Sedang',82:'Hujan Lebat',95:'Hujan Petir',96:'Hujan Petir & Es',99:'Hujan Petir & Es'};
 wb.innerHTML=`<div class="wx-now"><div class="t">${c.temperature_2m}°C</div><div style="font-size:12.5px;color:var(--mut2)"><b style="color:var(--txt)">${kode[c.weather_code]||'—'}</b><br>${namaLabel||'Wilayah terpilih'}<br>💧 ${c.relative_humidity_2m}% · 💨 ${c.wind_speed_10m} km/j</div></div><p style="color:var(--mut);font-size:11px;margin:6px 0 0">API BMKG belum terjangkau dari browser ini — menampilkan cadangan Open-Meteo untuk titik yang sama. Bukan data BMKG.</p>`;
 const warns=[];const jam=w.hourly.time||[],kc=w.hourly.weather_code||[],ws=w.hourly.wind_speed_10m||[];const now2=new Date();for(let i=0;i<jam.length;i++){const d=new Date(jam[i]);if(d<now2||d>new Date(now2.getTime()+24*3600000))continue;if([95,96,99].includes(kc[i]))warns.push({jenis:'Hujan Petir',kapan:d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})});else if([65,82].includes(kc[i]))warns.push({jenis:'Hujan Lebat',kapan:d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})});if(ws[i]>=38)warns.push({jenis:'Angin Kencang '+ws[i]+' km/j',kapan:d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})})}
 renderWarn(warns.slice(0,4),namaLabel||'wilayah ini','prakiraan cadangan Open-Meteo')}catch(e2){wb.innerHTML='<p style="color:var(--mut);font-size:12px;margin:0">Cuaca belum bisa dimuat (BMKG & cadangan gagal). Coba lagi nanti.</p>'}}}
 loadBmkgWeather(WXDEF.adm4,WXDEF.lat,WXDEF.lng,WXDEF.nama);setInterval(()=>loadBmkgWeather(WXCUR.adm4,WXCUR.lat,WXCUR.lng,WXCUR.nama),1800000);
 let WXCUR={...WXDEF};
 if(typeof desaSel!=='undefined'){desaSel.addEventListener('change',()=>{const o=(typeof selObj==='function')?selObj(desaSel):null;if(desaSel.value&&/^\d{2}\.\d{2}\.\d{2}\.\d{4}$/.test(desaSel.value)){WXCUR={adm4:desaSel.value,lat:o&&o.lat!=null?o.lat:WXDEF.lat,lng:o&&o.lng!=null?o.lng:WXDEF.lng,nama:(typeof wilNamaLengkap==='function'&&wilNamaLengkap())||desaSel.value};loadBmkgWeather(WXCUR.adm4,WXCUR.lat,WXCUR.lng,WXCUR.nama)}})}
 // ===== Ikon SVG garis (gambar sendiri, gaya ikon garis 14px) =====
 const IC=(p,s)=>`<svg class="ic" viewBox="0 0 24 24" width="${s||16}" height="${s||16}">${p}</svg>`;
 const ICONS={
 pin:IC('<path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11z"/><circle cx="12" cy="10" r="3"/>',14),
 globe:IC('<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2c3.2 3.4 4.8 6.4 4.8 10s-1.6 6.6-4.8 10c-3.2-3.4-4.8-6.4-4.8-10S8.8 5.4 12 2z"/>',14),
 cloud:IC('<path d="M18 10.5a5 5 0 0 0-9.5-1.6A4.6 4.6 0 0 0 7 18h11a3.6 3.6 0 0 0 0-7.5z"/>',14),
 alert:IC('<path d="M12 3 2.5 20h19L12 3z"/><line x1="12" y1="9.5" x2="12" y2="14"/><circle cx="12" cy="17" r=".4" fill="currentColor"/>',14),
 video:IC('<rect x="2" y="6" width="13" height="12" rx="2"/><path d="M15 10.5 22 7v10l-7-3.5z"/>',14),
 plane:IC('<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4Z"/>',14),
 sliders:IC('<line x1="4" y1="6" x2="20" y2="6"/><circle cx="9" cy="6" r="2"/><line x1="4" y1="12" x2="20" y2="12"/><circle cx="15" cy="12" r="2"/><line x1="4" y1="18" x2="20" y2="18"/><circle cx="7" cy="18" r="2"/>',14),
 scale:IC('<path d="M12 3v18M6 21h12"/><path d="M8 6 5 12.5h6L8 6zM16 6l-3 6.5h6L16 6z"/><path d="M4 6h16"/>',14),
 sprout:IC('<path d="M12 22v-8"/><path d="M12 14a5 5 0 0 0-5-5H4a5 5 0 0 0 5 5h3z"/><path d="M12 10a5 5 0 0 1 5-5h3a5 5 0 0 1-5 5h-3z"/>',14),
 cart:IC('<circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/><path d="M2 3h3l2.6 12.2h10.6L20 7H6"/>',14),
 chart:IC('<line x1="4" y1="20" x2="20" y2="20"/><path d="M7 20v-6M12 20V6M17 20v-9"/>'),
 users:IC('<circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.4 2.7-5.5 6-5.5s6 2.1 6 5.5"/><circle cx="17" cy="9" r="2.6"/><path d="M16.2 14.7c2.7.3 4.8 2 4.8 5.3"/>'),
 bus:IC('<rect x="4" y="3" width="16" height="14" rx="2"/><line x1="4" y1="10" x2="20" y2="10"/><circle cx="8" cy="20" r="1.5"/><circle cx="16" cy="20" r="1.5"/>'),
 mountain:IC('<path d="M3 19 9.5 6.5 14 14l2.5-4L21 19z"/>'),
 city:IC('<rect x="5" y="4" width="9" height="16"/><rect x="14" y="9" width="6" height="11"/><path d="M8.5 8h.4M8.5 12h.4M8.5 16h.4M17 13h.4M17 17h.4"/>'),
 activity:IC('<polyline points="2 12 7 12 10 5 14 19 17 12 22 12"/>'),
 flame:IC('<path d="M12 22a6 6 0 0 0 6-6c0-4-3-5.6-3-9-3 1.6-4.6 4-4.8 7C9.6 12.7 9 11.3 9 9c-1.9 1.8-3 3.9-3 7a6 6 0 0 0 6 6z"/>'),
 wave:IC('<path d="M2 9c2.5 0 2.5 2.5 5 2.5S9.5 9 12 9s2.5 2.5 5 2.5S19.5 9 22 9M2 15c2.5 0 2.5 2.5 5 2.5S9.5 15 12 15s2.5 2.5 5 2.5S19.5 15 22 15"/>'),
 pencil:IC('<path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1z"/>'),
 inbox:IC('<path d="M12 3v10M7.5 9.5 12 14l4.5-4.5"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>'),
 refresh:IC('<path d="M20 12a8 8 0 1 1-2.3-5.6M20 3v4h-4"/>'),
 bot:IC('<rect x="4" y="8" width="16" height="11" rx="2"/><path d="M12 8V4M8 4h8"/><circle cx="9" cy="13" r=".5" fill="currentColor"/><circle cx="15" cy="13" r=".5" fill="currentColor"/><path d="M9.5 16.5h5"/>'),
 book:IC('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>'),
 doc:IC('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>'),
 compass:IC('<circle cx="12" cy="12" r="10"/><polygon points="15.5 8.5 13.8 13.8 8.5 15.5 10.2 10.2"/>')};
 const TABICON={geonusa:'pin',geoportal:'globe',geodisaster:'alert',penerbangan:'plane'};
 document.querySelectorAll('#tabs button').forEach(b=>{const k=TABICON[b.dataset.p];if(k)b.insertAdjacentHTML('afterbegin',ICONS[k])});
 const EMOJIICON={'📊':'chart','👥':'users','🚌':'bus','🌐':'globe','🏔':'mountain','🏙':'city','🌋':'activity','☁️':'cloud','🔥':'flame','🌊':'wave','📹':'video','✏️':'pencil','📥':'inbox','⚙️':'sliders','🔄':'refresh','🤖':'bot','🌱':'sprout','📖':'book','🛒':'cart','⚖️':'scale','📜':'doc','🧭':'compass','📍':'pin','🛰':'globe','🧰':'sliders'};
 document.querySelectorAll('.card h3,.wel-grid div').forEach(el=>{const t=el.innerHTML.trimStart();for(const [e,k] of Object.entries(EMOJIICON)){if(t.startsWith(e)){el.innerHTML=el.innerHTML.replace(e,ICONS[k]);break}}});
 // Quick bar & topbar: chips teks bersih tanpa emoji (seperti situs acuan)
 document.querySelectorAll('#quick button,#topbar button').forEach(b=>{b.textContent=b.textContent.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu,'').trim()});
 // Search bar: mark mini + tombol ikon kaca pembesar

 // Loading overlay
 const lo=document.createElement('div');lo.id='loadingOverlay';lo.innerHTML='<img src="'+BMKG_URI+'" alt="Logo BMKG" width="58" height="72" style="display:block;margin:0 auto 10px"><div style="font-size:26px;font-weight:800;letter-spacing:1px">SIGAP <span style="color:#4ade80">JUWATA</span></div><div style="font-size:12px;letter-spacing:3px;color:#dbeafe">SISTEM INFORMASI GEOSPASIAL & CUACA · TARAKAN</div><div class="loadbar"><i></i></div>';document.body.appendChild(lo);
 // Modal sambutan (ringkasan fitur dengan kata sendiri)
 const wm=document.createElement('div');wm.id='welcomeModal';wm.innerHTML=`<div class="wel-card"><img class="bmkg-emblem" src="${BMKG_URI}" alt="Logo BMKG" width="61" height="76" style="display:block;margin:2px auto 8px"><small style="color:var(--acc);font-weight:700;letter-spacing:2px">SELAMAT DATANG DI</small><h2><span style="color:#005baa">SIGAP</span> <span style="color:#009444">JUWATA</span> — Sistem Informasi Geospasial & Cuaca</h2><p style="color:var(--mut)">Portal peta Stasiun Meteorologi Juwata Tarakan: cuaca & peringatan dini BMKG, gempa bumi, citra satelit, data wilayah, dan alat geospasial untuk Tarakan & Kalimantan Utara — dalam satu tampilan.</p><div class="wel-grid"><div>📍 <b>Data Wilayah Lengkap</b><br>38 provinsi sampai 83.762 desa/kelurahan + polygon batas & download GeoJSON.</div><div>🛰 <b>Citra Satelit</b><br>Basemap satelit, layer harian NASA VIIRS per tanggal.</div><div>🌋 <b>Gempa & Cuaca Live</b><br>Gempa BMKG terkini/dirasakan dan cuaca titik dari Open-Meteo saat peta diklik.</div></div><p style="color:var(--mut);font-size:12px">Catatan: portal prototype Stasiun Meteorologi Juwata Tarakan. Informasi bersifat informatif — untuk keperluan resmi verifikasi ke BMKG dan instansi berwenang.</p><button style="width:100%" onclick="document.getElementById('welcomeModal').classList.remove('open')">Mulai Jelajahi →</button></div>`;document.body.appendChild(wm);
 document.querySelectorAll('.wel-grid div').forEach(el=>{const t=el.innerHTML.trimStart();for(const [e,k] of Object.entries(EMOJIICON)){if(t.startsWith(e)){el.innerHTML=el.innerHTML.replace(e,ICONS[k]);break}}});
 window.addEventListener('load',()=>{setTimeout(()=>{lo.classList.add('hide');wm.classList.add('open')},700)});
 setTimeout(()=>{lo.classList.add('hide')},3500); // pengaman bila event load sudah lewat
})();


/* ===== Titik bandara di peta (OPMET BMKG) + bawaan awal ===== */
let avDots=null,avDotsOn=false,avDotsTimer=null;
function avDotStyle(p){const st=(p.icon_state||'').toLowerCase();if(st.includes('red'))return{color:'#ef4444',r:6};if(st.includes('yellow'))return{color:'#eab308',r:5.5};if(st.includes('blue'))return{color:'#38bdf8',r:5.5};if(st.includes('green'))return{color:'#22c55e',r:5.5};if(p.metar&&p.metar.includes(' AUTO ')&&(+p.visibility_m<0))return{color:'#f59e0b',r:5};if(+p.visibility_m>=0)return{color:avVisClass(+p.visibility_m).color,r:5.5};return{color:'#9ca3af',r:4}}
function avPopOpts(){const o=qpopOpts();o.className='qpop-wrap avpop';o.autoPanPaddingTopLeft=L.point(14,200);o.maxWidth=Math.min(326,Math.round(window.innerWidth*.9));o.minWidth=Math.min(252,Math.round(window.innerWidth*.8));return o}
function avPopupHTML(st){
  const btn='<button class="mini" style="display:block;width:100%;text-align:center;padding:7px 0" onclick="pilihBandara(\''+st.icao+'\','+st.lat+','+st.lon+');document.querySelector(\'#tabs button[data-p=penerbangan]\').click()">Lihat METAR/TAF</button>';
  const head='<b style="display:block;font-size:14px;line-height:1.3;padding-right:20px">'+st.name+'</b>';
  if(!st.raw)return head+'<div style="font-size:11.5px;color:#5b7a99;margin:4px 0 8px">'+st.icao+' · Data belum diperbarui — METAR belum tersedia.</div>'+btn;
  const o=avParseMetar(st.raw);const cat=avCat(o);const vc=avVisClass(o.vis);const od=avObsDate(o.time);
  const age=od!=null?Math.max(0,Math.round((Date.now()-od)/60000)):null;
  const windTxt=o.wind?(o.wind.spd===0?'Tenang (calm)':((o.wind.dir==null?'Variabel (VRB)':String(o.wind.dir).padStart(3,'0')+'°')+' · '+o.wind.spd+' kt'+(o.wind.gust?' · gust '+o.wind.gust+' kt':''))+(o.windVar?' · arah bervariasi '+o.windVar:'')):'—';
  const cloudTxt=o.cavok?'CAVOK — cerah, vis ≥ 10 km':(o.clouds.length?o.clouds.map(c=>(COVID[c.cover]||c.cover)+(c.baseFt!=null?' · '+c.baseFt.toLocaleString('id-ID')+' ft':'')).join('; '):'—');
  const wxTxt=o.wx.length?o.wx.map(avWxText).join(', '):(o.nosig?'NOSIG — tidak ada perubahan signifikan':'Tidak ada cuaca terlaporkan');
  const visTxt=o.vis!=null?(o.vis>=9999?'≥ 10 km':(o.vis/1000).toLocaleString('id-ID')+' km'):'—';
  return head+'<div style="font-size:10.5px;color:#5b7a99;margin:3px 0 8px;line-height:1.5">'+st.icao+' · Obs '+(od?od.toISOString().slice(11,16)+' UTC · '+fmtWita(od.toISOString()):'—')+(age!=null?' · '+age+' mnt lalu':'')+'</div>'
   +'<div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-bottom:2px"><span style="background:'+cat.color+';color:#fff;font-weight:800;font-size:11.5px;padding:3px 10px;border-radius:999px">'+cat.cat+'</span><span style="font-size:11.5px;color:#5b7a99">'+cat.label+'</span></div>'
   +'<div class="avgrid">'
   +'<div><small>Angin</small><b>'+windTxt+'</b></div>'
   +'<div><small>Visibilitas</small><b><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:'+vc.color+';margin-right:5px"></span>'+visTxt+'</b> <span style="color:var(--mut);font-size:11px">'+vc.label+'</span></div>'
   +'<div><small>Suhu / Titik Embun</small><b>'+(o.temp!=null?o.temp+' °C / '+o.dewp+' °C':'—')+'</b></div>'
   +'<div><small>QNH</small><b>'+(o.qnh?o.qnh+' hPa':'—')+'</b></div>'
   +'<div><small>Cuaca</small><b>'+wxTxt+'</b></div>'
   +'<div><small>Awan'+(o.ceiling!=null?' — ceiling '+o.ceiling.toLocaleString('id-ID')+' ft':'')+'</small><b>'+cloudTxt+'</b></div>'
   +'</div>'
   +'<div class="avraw" style="font-size:11px;margin:4px 0 8px">'+o.raw+'</div>'+btn;
}
async function avDotsRefresh(){
  if(!avDots)avDots=L.layerGroup();
  let done=false;
  try{
    const Z=5,seen=new Map(),jobs=[];
    for(let x=24;x<=28;x++)for(let y=15;y<=17;y++)jobs.push([x,y]);
    await Promise.all(jobs.map(async([x,y])=>{
      const r=await fetchTimeout('https://inasiam.bmkg.go.id/api/v1/tiles/opmet/'+Z+'/'+x+'/'+y+'.pbf',15000);
      if(!r.ok)return;
      const t=mvtDecode(new Uint8Array(await r.arrayBuffer()));
      const ly=t['airports'];if(!ly)return;
      for(const f of ly.feats){const pr=f.props;if(!pr||!pr.icao||seen.has(pr.icao))continue;
        const pt=f.pts&&f.pts[0];if(!pt)continue;
        const gx=x+pt[0]/ly.extent,gy=y+pt[1]/ly.extent,n=Math.pow(2,Z);
        seen.set(pr.icao,{p:pr,lat:Math.atan(Math.sinh(Math.PI*(1-2*gy/n)))*180/Math.PI,lon:gx/n*360-180});}
    }));
    if(seen.size>50){
      avDots.clearLayers();
      seen.forEach(({p:pr,lat,lon})=>{
        const ds=avDotStyle(pr);const vm=+pr.visibility_m;
        const visTxt=vm>=9999?'≥10 km':vm>0?(vm/1000).toLocaleString('id-ID')+' km':'tidak dilaporkan';
        const vc=vm>=0?avVisClass(vm):null;
        const m=L.circleMarker([lat,lon],{radius:ds.r,color:'#ffffff',weight:1.2,fillColor:ds.color,fillOpacity:.95});
        m.bindPopup(avPopupHTML({name:pr.name||pr.icao,icao:pr.icao,lat:lat,lon:lon,raw:pr.metar||null}),avPopOpts());
        m.addTo(avDots);});
      done=true;
    }
  }catch(e){}
  if(done)return;
const rs=await Promise.allSettled(AVSTATIONS.map(s=>fetchTimeout('https://inasiam.bmkg.go.id/api/v1/opmet/'+s.icao+'?active=true',12000).then(r=>r.json())));
  const raws=rs.map(r=>(r.status==='fulfilled'&&r.value&&r.value.metar&&r.value.metar.raw)?r.value.metar.raw:null);
  const miss=[];raws.forEach((x,ix)=>{if(!x)miss.push(ix)});
  if(miss.length){
    const rn=await Promise.allSettled(miss.map(ix=>fetchTimeout('https://api.met.no/weatherapi/tafmetar/1.0/?content=metar&content_type=text/plain&icao='+AVSTATIONS[ix].icao,12000).then(r=>r.text())));
    rn.forEach((r,k)=>{if(r.status==='fulfilled'&&r.value){const lines=String(r.value).split('\n').map(s=>s.trim()).filter(s=>s.startsWith(AVSTATIONS[miss[k]].icao));if(lines.length)raws[miss[k]]=lines[lines.length-1]}});
  }
  avDots.clearLayers();
  AVSTATIONS.forEach((s,ix)=>{const raw=raws[ix];const o=raw?avParseMetar(raw):null;const vc=avVisClass(o?o.vis:null);const cat=o?avCat(o):null;const visTxt=o&&o.vis!=null?(o.vis>=9999?'≥10 km':(o.vis/1000).toLocaleString('id-ID')+' km'):'tidak dilaporkan';const m=L.circleMarker([s.lat,s.lon],{radius:6,color:'#ffffff',weight:1.5,fillColor:vc.color,fillOpacity:.95});m.bindPopup(avPopupHTML({name:s.name,icao:s.icao,lat:s.lat,lon:s.lon,raw:raw||null}),avPopOpts());m.addTo(avDots)});
}
function avDotsToggle(force){const on=typeof force==='boolean'?force:!avDotsOn;avDotsOn=on;const b=document.getElementById('avDotsBtn');if(b)b.textContent=on?'🛬 Titik Bandara di Peta: Aktif':'🛬 Titik Bandara di Peta: Nonaktif';if(on){if(!avDots)avDots=L.layerGroup();avDots.addTo(map);avDotsRefresh();if(avDotsTimer)clearInterval(avDotsTimer);avDotsTimer=setInterval(()=>{if(avDotsOn)avDotsRefresh()},600000)}else{if(avDots)map.removeLayer(avDots);if(avDotsTimer)clearInterval(avDotsTimer)}if(typeof wxRender==='function')wxRender()}
setTimeout(()=>{try{if(!satKey)satMenuChange('eh')}catch(e){}try{avDotsToggle(true)}catch(e){}try{bndToggle(true)}catch(e){}},900);

/* ===== Bilah waktu melayang (bawah-tengah) ===== */
(function(){const st=document.createElement('style');st.textContent="#timeBar{position:absolute;left:50%;transform:translateX(-50%);bottom:64px;z-index:1300;display:none;align-items:center;gap:6px;background:var(--panel);border:1px solid var(--bord);border-radius:999px;box-shadow:var(--shadow);padding:6px 10px;font-size:12.5px;color:var(--txt);max-width:min(460px,calc(100vw - 20px));box-sizing:border-box}@media(min-width:901px){body:has(#side:not(.hidden)) #timeBar{left:calc(50% + 180px)}}#timeBar button{border:1px solid var(--bord);background:var(--card);color:var(--txt);border-radius:999px;height:30px;min-width:34px;padding:0 10px;cursor:pointer;font-size:13px}#timeBar button:disabled{opacity:.35;cursor:default}#tbLabel{font-weight:600;padding:0 4px;white-space:nowrap;min-width:0;overflow:hidden;text-overflow:ellipsis}#tbLive{color:#b91c1c;border-color:#fecaca;background:#fef2f2;font-weight:700}#tbLive.on{background:#dc2626;color:#fff;border-color:#dc2626}@media(max-width:900px){#timeBar{bottom:150px}}@media(max-width:560px){#timeBar{gap:4px;padding:5px 7px;font-size:11.5px}#timeBar button{height:27px;min-width:29px;padding:0 6px;font-size:12px}#tbLive{padding:0 8px}}";document.head.appendChild(st);
const bar=document.createElement('div');bar.id='timeBar';bar.innerHTML='<button id="tbPrev" title="Frame lebih lama">⏮</button><button id="tbPlay" title="Putar / jeda animasi">▶</button><button id="tbNext" title="Frame lebih baru">⏭</button><span id="tbLabel">—</span><button id="tbLive" title="Kembali ke waktu terkini">● LIVE</button>';document.getElementById('app').appendChild(bar);
const $=id=>document.getElementById(id);
$('tbPrev').onclick=()=>tbStep(1);$('tbNext').onclick=()=>tbStep(-1);
$('tbPlay').onclick=()=>{if(typeof iaKey!=='undefined'&&iaKey)return;satPlayToggle();tbSync()};
$('tbLive').onclick=()=>tbLive();
setInterval(tbSync,1000);tbSync()})();
function tbStep(dir){if(!satKey||!satRuns.length)return;const ni=Math.min(satRuns.length-1,Math.max(0,satIdx+dir));if(ni===satIdx)return;const sl=document.getElementById('satSlider');sl.value=satRuns.length-1-ni;satSliderMove(sl.value);tbSync()}
function tbLive(){if(typeof iaKey!=='undefined'&&iaKey){setIa(iaKey);return}if(!satKey)return;if(satPlaying)satStopPlay();const sl=document.getElementById('satSlider');sl.value=satRuns.length-1;satSliderMove(sl.value);tbSync()}
function tbSync(){const bar=document.getElementById('timeBar');if(!bar)return;const ia=typeof iaKey!=='undefined'&&iaKey;const show=ia||satKey;bar.style.display=show?'flex':'none';if(!show)return;const prev=document.getElementById('tbPrev'),next=document.getElementById('tbNext'),play=document.getElementById('tbPlay'),lab=document.getElementById('tbLabel'),live=document.getElementById('tbLive');
 if(ia){lab.textContent=fmtWita(iaRun.slice(0,4)+'-'+iaRun.slice(4,6)+'-'+iaRun.slice(6,8)+'T'+iaRun.slice(8,10)+':'+iaRun.slice(10,12)+':00Z');prev.disabled=true;next.disabled=true;play.disabled=true;play.textContent='▶';live.classList.add('on');return}
 play.disabled=false;play.textContent=satPlaying?'⏸':'▶';
 if(satRuns.length&&satRuns[satIdx]){lab.textContent=fmtWita(satRuns[satIdx])}else lab.textContent='—';
 prev.disabled=satIdx>=satRuns.length-1;next.disabled=satIdx<=0;live.classList.toggle('on',satIdx===0)}

/* ===== Panel Lapisan: sakelar cepat ===== */
function lpQuakeToggle(){if(quakeLayer&&map.hasLayer(quakeLayer)){map.removeLayer(quakeLayer);chipState('Gempa',false);toast('Layer gempa dimatikan')}else{loadQuake('terkini')}setTimeout(lpSync,400)}
function lpSync(){const set=(id,on)=>{const b=document.getElementById(id);if(!b)return;b.textContent=on?'Aktif':'Nonaktif';b.classList.toggle('on',!!on)};set('lpDots',typeof avDotsOn!=='undefined'&&avDotsOn);set('lpQuake',typeof quakeLayer!=='undefined'&&!!quakeLayer&&map.hasLayer(quakeLayer));set('lpGibs',typeof gibsLayer!=='undefined'&&!!gibsLayer);set('lpRadar',typeof radarLayer!=='undefined'&&!!radarLayer);set('lpRain',typeof rainLayer!=='undefined'&&!!rainLayer);set('lpSigmet',typeof sgOn!=='undefined'&&sgOn);set('lpPetir',typeof ltOn!=='undefined'&&ltOn);set('lpFir',typeof firOn!=='undefined'&&firOn);set('lpBnd',typeof bndOn!=='undefined'&&bndOn)}
setInterval(lpSync,1500);

/* ===== SIGMET, PETIR & FIR — InaSIAM (Tahap 4) ===== */
const INAAPI='https://inasiam.bmkg.go.id';
let ltLayer=null,ltOn=false,ltTimer=null,ltCount=0;
async function ltRefresh(){try{const r=await fetchTimeout(INAAPI+'/api/lightningserver/strikes?last=15m',20000);if(!r.ok)throw 0;const j=await r.json();const pts=Array.isArray(j&&j.data)?j.data:[];ltCount=pts.length;if(!ltLayer)ltLayer=L.layerGroup();ltLayer.clearLayers();const MAX=4000,step=pts.length>MAX?Math.ceil(pts.length/MAX):1;for(let i=0;i<pts.length;i+=step){const s=pts[i];if(!s||typeof s.lat!=='number'||typeof s.lon!=='number')continue;const neg=(+s.intensity)<0;L.circleMarker([s.lat,s.lon],{radius:3.5,color:neg?'#dc2626':'#d97706',weight:1,fillColor:neg?'#ef4444':'#fbbf24',fillOpacity:.85}).bindPopup('<b>⚡ Sambaran Petir</b><br>'+(s.type==='nuage-sol'?'Awan ke tanah (CG)':'Intra-awan (IC)')+'<br>Intensitas: '+s.intensity+' kA<br>Waktu: '+String(s.timestamp||'').slice(0,19).replace('T',' ')+' UTC<br><span style="color:#64748b;font-size:11px">Sumber: BMKG InaSIAM (CATS)</span>').addTo(ltLayer)}if(ltOn&&!map.hasLayer(ltLayer))ltLayer.addTo(map)}catch(e){}}
function ltToggle(force){ltOn=(typeof force==='boolean')?force:!ltOn;if(ltOn){ltRefresh();clearInterval(ltTimer);ltTimer=setInterval(()=>{if(ltOn)ltRefresh()},120000)}else{clearInterval(ltTimer);if(ltLayer&&map.hasLayer(ltLayer))map.removeLayer(ltLayer)}}
const SGDEFS={ts:['#e11d48','TS — Badai petir'],tsgr:['#7c3aed','TS + hujan es'],turb:['#f59e0b','Turbulensi'],llws:['#ec4899','Wind shear (LLWS)'],mtw:['#0ea5e9','Mountain wave'],ice:['#2563eb','Icing'],tc:['#9333ea','Siklon tropis'],va:['#78716c','Abu vulkanik'],ss:['#ca8a04','Badai pasir'],ds:['#a16207','Badai debu']};
let sgLayer=null,sgOn=false;
function sgBuild(){if(sgLayer)return sgLayer;const styles={};for(const k in SGDEFS)styles[k]={color:SGDEFS[k][0],weight:1.4,fillColor:SGDEFS[k][0],fillOpacity:.25,fill:true};styles.va={color:'#44403c',weight:2,fillColor:'#78716c',fillOpacity:.45,fill:true};styles.va_mnt={radius:4,color:'#92400e',weight:1,fillColor:'#fbbf24',fillOpacity:1,fill:true};
sgLayer=L.vectorGrid.protobuf(INAAPI+'/api/v1/tiles/sigmet/{z}/{x}/{y}.pbf',{rendererFactory:L.canvas.tile,vectorTileLayerStyles:styles,interactive:false,maxNativeZoom:6});
return sgLayer}
function sgToggle(force){sgOn=(typeof force==='boolean')?force:!sgOn;if(sgOn){try{sgBuild().addTo(map)}catch(e){sgOn=false;alert('Layer SIGMET butuh pustaka VectorGrid — periksa koneksi lalu coba lagi.')}}else if(sgLayer&&map.hasLayer(sgLayer))map.removeLayer(sgLayer)}
let firLayer=null,firOn=false;
function firToggle(force){firOn=(typeof force==='boolean')?force:!firOn;if(firOn){if(!firLayer){try{firLayer=L.vectorGrid.protobuf(INAAPI+'/api/v1/tiles/firs/{z}/{x}/{y}.pbf',{rendererFactory:L.canvas.tile,vectorTileLayerStyles:{firs:{color:'#3b82f6',weight:1.2,fillColor:'#3b82f6',fillOpacity:.03,fill:true}},interactive:false,maxNativeZoom:8});}catch(e){firOn=false;alert('Layer FIR butuh pustaka VectorGrid — periksa koneksi lalu coba lagi.');return}}firLayer.addTo(map)}else if(firLayer&&map.hasLayer(firLayer))map.removeLayer(firLayer)}
function sgPopupHtml(p){let h='<b>⛈ SIGMET'+(p.hazard?' — '+p.hazard:'')+'</b>';if(p.phenomenon)h+='<br><b>'+p.phenomenon+'</b>';if(p.geom_type==='point'&&p.raw)h+='<br>'+p.raw;if(p.fir)h+='<br>FIR: '+p.fir;if(p.valid_from&&p.valid_to&&String(p.valid_from).indexOf('0001')!==0)h+='<br>Berlaku: '+String(p.valid_from).slice(0,16).replace('T',' ')+' s.d. '+String(p.valid_to).slice(11,16)+' UTC';if(p.raw&&p.geom_type!=='point')h+='<details style="margin-top:4px"><summary style="cursor:pointer;font-size:11px">Teks SIGMET lengkap</summary><span style="font-size:11px">'+p.raw+'</span></details>';h+='<br><span style="color:#64748b;font-size:11px">Sumber: BMKG InaSIAM</span>';return h}
function firPopupHtml(p){return '<b>🛰 FIR '+p.code+'</b><br>'+(p.name||'')+'<br><span style="color:#64748b;font-size:11px">Batas wilayah informasi penerbangan — BMKG InaSIAM</span>'}
/* Dekoder tile vektor (MVT) mini — spesifikasi publik; untuk uji klik SIGMET/FIR di semua zoom */
function _uv(buf,pos){let v=0,s=0,b;do{b=buf[pos++];v+=(b&0x7f)*Math.pow(2,s);s+=7}while(b&0x80);return[v,pos]}
function _fields(buf){const out=[];let pos=0;while(pos<buf.length){let k;[k,pos]=_uv(buf,pos);const f=k>>3,w=k&7;if(w===0){let v;[v,pos]=_uv(buf,pos);out.push([f,v])}else if(w===2){let ln;[ln,pos]=_uv(buf,pos);out.push([f,buf.subarray(pos,pos+ln)]);pos+=ln}else if(w===5){out.push([f,buf.subarray(pos,pos+4)]);pos+=4}else if(w===1){out.push([f,buf.subarray(pos,pos+8)]);pos+=8}else break}return out}
function _txt(b){return new TextDecoder().decode(b)}
function _val(b){let s=null,n=null;for(const[f,v]of _fields(b)){if(f===1)s=_txt(v);else if(f===6)n=(v%2?-(v+1)/2:v/2);else if(f===7)n=!!v;else if(typeof v==='number')n=v}return s!==null?s:n}
function _geom(g,type){let p=0,x=0,y=0;const rings=[];let cur=null;while(p<g.length){let c;[c,p]=_uv(g,p);const cmd=c&7,cnt=c>>3;if(cmd===7){if(cur){rings.push(cur);cur=null}continue}for(let i=0;i<cnt;i++){let dx,dy;[dx,p]=_uv(g,p);[dy,p]=_uv(g,p);x+=(dx>>1)^-(dx&1);y+=(dy>>1)^-(dy&1);if(cmd===1){if(i===0){if(cur)rings.push(cur);cur=[[x,y]]}else if(cur)cur.push([x,y])}else if(cmd===2){if(!cur)cur=[];cur.push([x,y])}}}if(cur)rings.push(cur);return type===1?rings.flat():rings}
function mvtDecode(buf){const layers={};for(const[f,v]of _fields(buf)){if(f!==3||typeof v==='number')continue;let name='',extent=4096;const keys=[],vals=[],raw=[];for(const[lf,lv]of _fields(v)){if(lf===1)name=_txt(lv);else if(lf===5)extent=lv;else if(lf===3)keys.push(_txt(lv));else if(lf===4)vals.push(_val(lv));else if(lf===2){let type=0,geom=null;const tags=[];for(const[ff,fv]of _fields(lv)){if(ff===3)type=fv;else if(ff===2){let pp=0;while(pp<fv.length){let t;[t,pp]=_uv(fv,pp);tags.push(t)}}else if(ff===4)geom=fv}raw.push({type,tags,geom})}}const feats=raw.map(r=>{const props={};for(let i=0;i+1<r.tags.length;i+=2){const k=keys[r.tags[i]];if(k)props[k]=vals[r.tags[i+1]]}const gg=r.geom?_geom(r.geom,r.type):null;return{type:r.type,props,rings:r.type===3?gg:null,pts:r.type===1?gg:null}});layers[name]={extent,feats}}return layers}
function _pip(px,py,rings){let inside=false;for(const ring of rings){for(let i=0,j=ring.length-1;i<ring.length;j=i++){const xi=ring[i][0],yi=ring[i][1],xj=ring[j][0],yj=ring[j][1];if(((yi>py)!==(yj>py))&&(px<(xj-xi)*(py-yi)/(yj-yi)+xi))inside=!inside}}return inside}
const _tileCache=new Map();
async function _getTile(kind,z,lat,lng){const n=Math.pow(2,z),tx=Math.floor((lng+180)/360*n),latr=lat*Math.PI/180,ty=Math.floor((1-Math.log(Math.tan(latr)+1/Math.cos(latr))/Math.PI)/2*n),key=kind+'/'+z+'/'+tx+'/'+ty;if(_tileCache.has(key))return _tileCache.get(key);let out=null;try{const r=await fetch(INAAPI+'/api/v1/tiles/'+kind+'/'+z+'/'+tx+'/'+ty+'.pbf');if(r.status===200)out={layers:mvtDecode(new Uint8Array(await r.arrayBuffer())),tx,ty,n}}catch(e){}if(_tileCache.size>48)_tileCache.clear();_tileCache.set(key,out);return out}
async function _hitTest(kind,z,lat,lng){lng=((lng+540)%360+360)%360-180;const t=await _getTile(kind,z,lat,lng);if(!t)return null;for(const ln in t.layers){const L=t.layers[ln],n=t.n,fx=(lng+180)/360*n-t.tx,latr=lat*Math.PI/180,fy=(1-Math.log(Math.tan(latr)+1/Math.cos(latr))/Math.PI)/2*n-t.ty,px=fx*L.extent,py=fy*L.extent;for(const f of L.feats){if(f.type===3&&f.rings&&_pip(px,py,f.rings))return f.props;if(f.type===1&&f.pts)for(const pt of f.pts){const plng=((t.tx+pt[0]/L.extent)/n)*360-180,plat=Math.atan(Math.sinh(Math.PI*(1-2*((t.ty+pt[1]/L.extent)/n))))*180/Math.PI;if(Math.abs(plng-lng)<0.35&&Math.abs(plat-lat)<0.35)return f.props}}}return null}
map.on('click',async e=>{if(!sgOn&&!firOn)return;const ll=e.latlng;if(sgOn){const p=await _hitTest('sigmet',6,ll.lat,ll.lng);if(p){L.popup().setLatLng(ll).setContent(sgPopupHtml(p)).openOn(map);return}}if(firOn){const p=await _hitTest('firs',8,ll.lat,ll.lng);if(p&&p.code)L.popup().setLatLng(ll).setContent(firPopupHtml(p)).openOn(map)}});
setTimeout(()=>ltToggle(true),1700);


/* ===== Batas pulau & garis pantai (Natural Earth 50m, berkas lokal) ===== */
let bndLayer=null,bndOn=false,bndLoading=false;
function syncBndChip(){document.querySelectorAll('#quick button').forEach(b=>{if(b.textContent.includes('Boundaries'))b.classList.toggle('on',bndOn)})}
async function bndToggle(force){
  const on=typeof force==='boolean'?force:!bndOn;
  if(on&&!bndLayer){
    if(bndLoading)return;
    bndLoading=true;
    try{
      const parts=await Promise.all([1,2,3].map(i=>fetch('batas-pulau-'+i+'.geojson').then(r=>{if(!r.ok)throw new Error('http');return r.json()})));
      const feats=[];parts.forEach(pc=>pc.features.forEach(f=>feats.push(f)));
      const gj={type:'FeatureCollection',features:feats};
      bndLayer=L.layerGroup([
        L.geoJSON(gj,{pane:'bndPane',style:{color:'#0b1c2c',weight:4.6,opacity:.55,fill:false},interactive:false}),
        L.geoJSON(gj,{pane:'bndPane',style:{color:'#ffffff',weight:2.4,opacity:1,fill:false},interactive:false})
      ]);
    }catch(e){bndLoading=false;toast('Gagal memuat data batas pulau');return}
    bndLoading=false;
  }
  if(on){bndLayer.addTo(map);bndOn=true}
  else{if(bndLayer)map.removeLayer(bndLayer);bndOn=false}
  syncBndChip();
  if(typeof lpSync==='function')setTimeout(lpSync,60);
}
