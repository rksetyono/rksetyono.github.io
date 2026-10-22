// SIGAP JUWATA — lapisan SST & Angin (dimuat sesudah sigap-app.js; berbagi global yang sama)
// ===== SST — utama BMKG Ina-Flows (OFS), cadangan sementara NASA GHRSST MUR selama BMKG gangguan =====
let sstLayer=null,sstOn=false,sstValidTxt='',sstErrT=false,sstSrc='',sstTimer=null;
function sstFmt(d){const q=n=>String(n).padStart(2,'0');return ''+d.getUTCFullYear()+q(d.getUTCMonth()+1)+q(d.getUTCDate())+q(d.getUTCHours())+q(d.getUTCMinutes())}
function sstProbe(url){return new Promise(res=>{const im=new Image();im.onload=()=>res(true);im.onerror=()=>res(false);im.src=url})}
const SSTBLN=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
function sstTgl(d){return d.getUTCDate()+' '+SSTBLN[d.getUTCMonth()]+' '+d.getUTCFullYear()}
async function sstBmkgTimes(){
 let runD=null;
 try{const r=await fetchTimeout('https://maritim.bmkg.go.id/api21/modelrun',12000);const j=await r.json();if(j&&j.inaflows&&j.inaflows.length)runD=new Date(j.inaflows[0])}catch(e){}
 if(!runD){const n=new Date();n.setUTCMinutes(0,0,0);n.setUTCHours(n.getUTCHours()>=12?12:0);runD=n}
 let valid=new Date(Math.floor(Date.now()/108e5)*108e5);if(valid<runD)valid=runD;
 return{runD,valid,runStr:sstFmt(runD),valStr:sstFmt(valid)}
}
function sstBmkgUrl(t){return 'https://maritim.bmkg.go.id/api21/mpl_req/inaflows/st/0/'+t.runStr+'/'+t.valStr+'/{z}/{x}/{y}.png?ci=1&overlays=,contourf&conc=snow'}
function sstPasangBmkg(t){
 if(sstLayer)map.removeLayer(sstLayer);
 sstLayer=L.tileLayer(sstBmkgUrl(t),{tms:true,opacity:.8,attribution:'SST © BMKG — OFS Ina-Flows'});
 let errs=0,oks=0;sstErrT=false;
 sstLayer.on('tileerror',()=>{errs++;if(errs>=6&&!oks&&sstOn&&sstSrc==='bmkg'&&!sstErrT){sstErrT=true;sstPasangNasa(true)}});
 sstLayer.on('tileload',()=>{oks++});
 sstLayer.addTo(map);sstSrc='bmkg';sstValidTxt=fmtWita(t.valid.toISOString());
}
async function sstPasangNasa(dariGagal){
 for(let back=1;back<=6;back++){
  const d=new Date(Date.now()-back*864e5);const ds=d.toISOString().slice(0,10);
  const tpl='https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/GHRSST_L4_MUR_Sea_Surface_Temperature/default/'+ds+'/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png';
  const ok=await sstProbe(tpl.replace('{z}',6).replace('{y}',33).replace('{x}',51));
  if(!ok)continue;
  if(sstLayer)map.removeLayer(sstLayer);
  sstLayer=L.tileLayer(tpl,{maxNativeZoom:7,opacity:.8,attribution:'SST © NASA GHRSST MUR (sementara — BMKG gangguan)'});
  sstLayer.addTo(map);sstSrc='nasa';sstValidTxt='data '+sstTgl(d);
  if(typeof wxRender==='function')wxRender();if(typeof updateProdPill==='function')updateProdPill();
  toast(dariGagal?'⚠️ SST BMKG belum termuat (gangguan Ina-Flows) — menampilkan SST NASA GHRSST untuk sementara':'🌊 SST NASA GHRSST (sementara) aktif · '+sstValidTxt);
  return true;
 }
 return false;
}
async function toggleSST(){
 if(sstOn){sstOn=false;sstSrc='';if(sstTimer){clearInterval(sstTimer);sstTimer=null}if(sstLayer){map.removeLayer(sstLayer);sstLayer=null}chipState('SST',false);if(typeof wxRender==='function')wxRender();if(typeof updateProdPill==='function')updateProdPill();toast('Layer SST dimatikan');return}
 chipState('SST',true);toast('🌊 Memuat SST…');
 const t=await sstBmkgTimes();
 const probeOk=await sstProbe(sstBmkgUrl(t).replace('{z}',5).replace('{x}',26).replace('{y}',15));
 if(probeOk){sstPasangBmkg(t);sstOn=true;toast('🌊 SST BMKG Ina-Flows aktif · berlaku '+sstValidTxt)}
 else{const okN=await sstPasangNasa(false);if(okN){sstOn=true}else{chipState('SST',false);toast('⚠️ SST belum dapat dimuat — BMKG sedang gangguan dan NASA tak terjangkau');return}}
 if(typeof wxRender==='function')wxRender();if(typeof updateProdPill==='function')updateProdPill();
 if(sstTimer)clearInterval(sstTimer);
 sstTimer=setInterval(async()=>{if(!sstOn){clearInterval(sstTimer);sstTimer=null;return}if(sstSrc==='nasa'){const tt=await sstBmkgTimes();const okB=await sstProbe(sstBmkgUrl(tt).replace('{z}',5).replace('{x}',26).replace('{y}',15));if(okB&&sstOn&&sstSrc==='nasa'){sstPasangBmkg(tt);if(typeof wxRender==='function')wxRender();if(typeof updateProdPill==='function')updateProdPill();toast('✅ SST kembali memakai BMKG — Ina-Flows sudah pulih')}}},600000);
}
// ===== Angin BMKG — kecepatan & arah angin 10 m model W3G (OFS BMKG, maritim.bmkg.go.id/api21) =====
let anginGroup=null,anginOn=false,anginValidTxt='';
async function anginTimes(){
 let runD=null;
 try{const r=await fetchTimeout('https://maritim.bmkg.go.id/api21/modelrun',12000);const j=await r.json();if(j&&j.w3g_hires&&j.w3g_hires.length)runD=new Date(j.w3g_hires[0])}catch(e){}
 if(!runD){const n=new Date();n.setUTCMinutes(0,0,0);n.setUTCHours(n.getUTCHours()>=12?12:0);runD=n}
 let valid=new Date(Math.floor(Date.now()/108e5)*108e5);if(valid<runD)valid=runD;
 return{runD,valid,runStr:sstFmt(runD),valStr:sstFmt(valid)}
}
async function toggleAngin(){
 if(anginOn){anginOn=false;if(anginGroup){map.removeLayer(anginGroup);anginGroup=null}chipState('Angin',false);if(typeof wxRender==='function')wxRender();if(typeof updateProdPill==='function')updateProdPill();toast('Layer angin BMKG dimatikan');return}
 chipState('Angin',true);toast('💨 Memuat angin BMKG…');
 const t=await anginTimes();
 const mpl='https://maritim.bmkg.go.id/api21/mpl_req/w3g_hires/ws/0/'+t.runStr+'/'+t.valStr+'/{z}/{x}/{y}.png?ci=1&overlays=,contourf&conc=snow';
 const barb='https://maritim.bmkg.go.id/api21/barb_req/w3g_hires/ws/0/'+t.runStr+'/'+t.valStr+'/{z}/{x}/{y}.png';
 const sh=L.tileLayer(mpl,{tms:true,opacity:.72,attribution:'Angin © BMKG — OFS INAWAVES'});
 const bb=L.tileLayer(barb,{tms:true,opacity:.95});
 anginGroup=L.layerGroup([sh,bb]).addTo(map);
 anginOn=true;anginValidTxt=fmtWita(t.valid.toISOString());
 if(typeof wxRender==='function')wxRender();if(typeof updateProdPill==='function')updateProdPill();
 toast('💨 Angin BMKG aktif · berlaku '+anginValidTxt);
}

// ===== Cuaca Pelabuhan BMKG Maritim — 17 pelabuhan Kalimantan Utara (penanda peta + ringkasan) =====
const PORTS=[['Pelabuhan Malundung Tarakan','pelabuhan-malundung-tarakan',3.2833,117.5952],['Pelabuhan Feri Juata Laut Tarakan','pelabuhan-feri-juata-laut-tarakan',3.4309,117.5375],['Pelabuhan Tengkayu I','pelabuhan-tengkayu-i',3.2912,117.5876],['Pelabuhan Tanjung Selor','pelabuhan-tanjung-selor',2.8486,117.4559],['Pelabuhan Bunyu','pelabuhan-bunyu',3.4602,117.8358],['Pelabuhan Feri Ancam Bulungan','pelabuhan-feri-ancam-bulungan',3.1137,117.2463],['Pelabuhan KIPI Tanah Kuning Bulungan','pelabuhan-kipi-tanah-kuning-bulungan',2.6027,117.8172],['Pelabuhan Speedboat Tana Kuning','pelabuhan-speedboat-tana-kuning',2.6067,117.8172],['Pelabuhan Tunon Taka Nunukan','pelabuhan-tunon-taka-nunukan',4.1449,117.6672],['Pelabuhan Liem Hie Djung Nunukan','pelabuhan-liem-hie-djung-nunukan',4.1442,117.6479],['Pelabuhan Feri Sei Jepun Nunukan','pelabuhan-feri-sei-jepun-nunukan',4.0852,117.6260],['Pelabuhan Sei Nyamuk Sebatik','pelabuhan-sei-nyamuk-sebatik',4.1426,117.9117],['Pelabuhan Feri Liang Bunyu Sebatik','pelabuhan-feri-liang-bunyu-sebatik',4.1048,117.7542],['Pelabuhan Speedboat Malinau','pelabuhan-speedboat-malinau',3.5953,116.6325],['Pelabuhan Tideng Pale, Tana Tidung','pelabuhan-tideng-pale-kabupaten-tana-tidung',3.5855,116.9078],['Pelabuhan Feri Sei Bawan, Tana Tidung','pelabuhan-feri-sei-bawan-kabupaten-tana-tidung',3.5427,117.1904],['Pelabuhan Sembakung','pelabuhan-sembakung',3.7570,116.7509]];
const portCache={};let portGroup=null,portOn=false,portWave=null,portWaveTxt='';const portMarkers=[];
function portIcon(){return L.divIcon({className:'',html:'<div style="background:#005baa;color:#fff;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,.45)">⚓</div>',iconSize:[26,26],iconAnchor:[13,13]})}
function renderPorts(){const el=document.getElementById('portList');if(!el||el.dataset.done)return;el.dataset.done='1';el.innerHTML=PORTS.map((x,i)=>'<div style="border-top:1px solid var(--line);padding:7px 0"><button class="ghost" style="width:100%;text-align:left" onclick="portGo('+i+')">⚓ '+x[0]+'</button><div id="port-'+i+'" style="font-size:12.5px;margin-top:4px"></div></div>').join('')}
async function portSummaryHTML(i){
 if(portCache[i])return portCache[i];
 const url='https://maritim.bmkg.go.id/cuaca/pelabuhan/'+PORTS[i][1];
 const relays=['https://api.allorigins.win/raw?url='+encodeURIComponent(url),'https://api.codetabs.com/v1/proxy?quest='+encodeURIComponent(url)];
 let ringkas='';
 for(const r of relays){try{const resp=await fetchTimeout(r,12000);const html=await resp.text();const m=html.match(/og:description" content="([^"]+)"/);if(m){ringkas=m[1].replace(/^Prakiraan cuaca maritim terkini untuk Pelabuhan[^.]*\.\s*Data cuaca:\s*/,'');break}}catch(e){}}
 const link='<div style="margin-top:3px"><a href="'+url+'" target="_blank" rel="noopener">Detail resmi BMKG ↗</a></div>';
 if(ringkas){const cantik=ringkas.replace(/, Angin:/,' · Angin:').replace(/, Gelombang:/,' · Gelombang:').replace(/Gelombang: ([\d.]+)m/,'Gelombang: $1 m');portCache[i]='<b>'+cantik+'</b>'+link}
 else portCache[i]='<span style="color:var(--mut)">Ringkasan belum dapat dimuat dari sini (halaman BMKG tidak mengizinkan pengambilan lintas situs).</span>'+link;
 return portCache[i];
}
async function loadPort(i){const box=document.getElementById('port-'+i);if(box)box.innerHTML=await portSummaryHTML(i)}
async function portShowWave(){
 if(portWave){if(!map.hasLayer(portWave))portWave.addTo(map);return}
 const t=await anginTimes();
 portWave=L.tileLayer('https://maritim.bmkg.go.id/api21/mpl_req/w3g_hires/swh/0/'+t.runStr+'/'+t.valStr+'/{z}/{x}/{y}.png?ci=1&overlays=,contourf&conc=snow',{tms:true,opacity:.78,attribution:'Gelombang © BMKG — OFS INAWAVES'});
 portWave.addTo(map);portWaveTxt=fmtWita(t.valid.toISOString());
 if(typeof wxRender==='function')wxRender();if(typeof updateProdPill==='function')updateProdPill();
}
function portHideWave(){if(portWave){map.removeLayer(portWave)}if(typeof wxRender==='function')wxRender();if(typeof updateProdPill==='function')updateProdPill()}
function portShowMarkers(){
 if(!portGroup){portGroup=L.layerGroup();
  PORTS.forEach((x,i)=>{const mk=L.marker([x[2],x[3]],{icon:portIcon()}).bindPopup('<b>⚓ '+x[0]+'</b><div id="pop-port-'+i+'" style="font-size:12.5px;margin-top:4px">Memuat prakiraan BMKG…</div>',{maxWidth:290});
   mk.on('popupopen',async()=>{const d=document.getElementById('pop-port-'+i);if(d)d.innerHTML=await portSummaryHTML(i)});
   portMarkers[i]=mk;portGroup.addLayer(mk)})}
 portGroup.addTo(map);portOn=true;
}
function portGo(i){
 if(!portOn){portShowMarkers();chipState('Pelabuhan',true)}
 loadPort(i);
 map.flyTo([PORTS[i][2],PORTS[i][3]],Math.max(map.getZoom(),11),{duration:1.1});
 setTimeout(()=>{if(portMarkers[i])portMarkers[i].openPopup()},1250);
}
function openPorts(){
 if(portOn){portOn=false;if(portGroup)map.removeLayer(portGroup);portHideWave();chipState('Pelabuhan',false);toast('Fitur pelabuhan & perairan dimatikan');return}
 const b=document.querySelector('[data-p=geodisaster]');if(b)b.click();
 document.getElementById('side').classList.remove('hidden');
 renderPorts();portShowWave();portShowMarkers();chipState('Pelabuhan',true);
 map.flyToBounds(L.latLngBounds(PORTS.map(x=>[x[2],x[3]])).pad(0.12),{duration:1.1});
 setTimeout(()=>{const c=document.getElementById('portCard');if(c)c.scrollIntoView({behavior:'smooth',block:'start'})},90);
 loadPort(0);loadPort(1);
 toast('⚓ Pelabuhan & perairan aktif: gelombang BMKG + 17 penanda pelabuhan Kaltara');
}
