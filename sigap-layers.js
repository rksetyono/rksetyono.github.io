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
function portPopupShell(nm,slug){return '<div class="portpop"><div class="portpop-h"><span class="portpop-pill">⚓ CUACA PELABUHAN</span><div class="portpop-t">'+nm+'</div></div><div class="portpop-b" id="pop-'+slug+'">Memuat prakiraan BMKG…</div></div>'}
function portIcon(){return L.divIcon({className:'',html:'<div style="background:#005baa;color:#fff;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,.45)">⚓</div>',iconSize:[26,26],iconAnchor:[13,13]})}
function renderPorts(){const el=document.getElementById('portList');if(!el||el.dataset.done)return;el.dataset.done='1';el.innerHTML=PORTS.map((x,i)=>'<div style="border-top:1px solid var(--line);padding:7px 0"><button class="ghost" style="width:100%;text-align:left" onclick="portGo('+i+')">⚓ '+x[0]+'</button><div id="port-'+i+'" style="font-size:12.5px;margin-top:4px"></div></div>').join('')}
const PORTBLN={Jan:0,Feb:1,Mar:2,Apr:3,Mei:4,Jun:5,Jul:6,Agu:7,Sep:8,Okt:9,Nov:10,Des:11};
function portKoma(x){return String(x).replace('.',',')}
function portParseRows(html){
 const out=[];const trs=html.match(/<tr class="transition-all[\s\S]*?<\/tr>/g)||[];
 for(const tr of trs){
  const tds=[...tr.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(m=>m[1].replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim());
  if(tds.length<9)continue;
  const tm=tds[0].match(/(\d{1,2}) (\w{3}) (\d{2}), (\d{2})\.(\d{2})/);if(!tm)continue;
  const t=Date.UTC(2000+ +tm[3],PORTBLN[tm[2]],+tm[1],+tm[4],+tm[5]);
  const wv=tds[3].match(/([\d.]+)\s*m\s*(.*)/);const wd=tds[2].match(/^(.+?)\s(\d+)\s*kt/);const cu=tds[4].match(/^(.+?)\s([\d.]+)\s*Knot/i);
  out.push({t,waktu:tm[1]+' '+tm[2]+' 20'+tm[3]+' · '+tm[4]+'.'+tm[5]+' UTC',cuaca:tds[1],anginDir:wd?wd[1]:tds[2],anginKt:wd?+wd[2]:null,gel: wv?+wv[1]:null,gelKat:wv?(wv[2]||'').trim():'',arusDir:cu?cu[1]:tds[4],arusKt:cu?cu[2]:'',jarak:tds[5],suhu:parseFloat(tds[6]),lembap:parseFloat(tds[7]),pasut:tds[8]});
 }
 return out;
}
function portRichHTML(rows){
 const f=rows[0];
 const suhu=rows.map(r=>r.suhu).filter(x=>!isNaN(x)),lem=rows.map(r=>r.lembap).filter(x=>!isNaN(x));
 const sRange=suhu.length?Math.min(...suhu)+'–'+Math.max(...suhu)+' °C':'—',lRange=lem.length?Math.min(...lem)+'–'+Math.max(...lem)+' %':'—';
 const ep=x=>Math.floor(x.t/1000);
 const baris=[['CUACA',f.cuaca],['GELOMBANG',(f.gelKat?f.gelKat+' ':'')+'('+f.gel+')'],['ANGIN',f.anginDir+' — '+f.anginKt+'–'+f.anginKt+' knot'],['JARAK PANDANG',f.jarak],['SUHU',sRange],['KELEMBAPAN',lRange],['BERLAKU',portFmtBerlaku(ep(rows[0]))+' s.d.<br>'+portFmtBerlaku(ep(rows[rows.length-1]))]];
 return portRowsHTML(baris)+'<div class="portpop-f">Sumber: BMKG Maritim</div>';
}
let portDataCache=null,portDataPromise=null;
async function portLoadData(){
 if(portDataPromise)return portDataPromise;
 portDataPromise=(async()=>{try{const r=await fetch('ports-data.json');portDataCache=await r.json();const n=document.getElementById('portNote');if(n&&portDataCache.dibuat)n.textContent='Sumber: BMKG Maritim (maritim.bmkg.go.id/cuaca/pelabuhan), dipanen berkala dari situs resmi — terakhir '+portDataCache.dibuat+'. Penanda ⚓ di peta mencakup pelabuhan BMKG se-Indonesia; posisinya perkiraan dari OpenStreetMap. Daftar ringkas di panel ini khusus Kalimantan Utara.'}catch(e){portDataCache=null}return portDataCache})();
 return portDataPromise;
}
function portFmtEpoch(sec){const d=new Date(sec*1000);const q=n=>String(n).padStart(2,'0');return d.getUTCDate()+' '+SSTBLN[d.getUTCMonth()]+' '+d.getUTCFullYear()+' · '+q(d.getUTCHours())+'.'+q(d.getUTCMinutes())+' UTC'}
function portFmtBerlaku(sec){const d=new Date(sec*1000);const q=n=>String(n).padStart(2,'0');return d.getUTCFullYear()+'-'+q(d.getUTCMonth()+1)+'-'+q(d.getUTCDate())+' '+q(d.getUTCHours())+':'+q(d.getUTCMinutes())+' UTC'}
function portRowsHTML(baris){return baris.map(b=>'<div class="portpop-row"><span>'+b[0]+'</span><b>'+b[1]+'</b></div>').join('')}
function portFromRecord(slug,rec,full,dibuat){
 const url='https://maritim.bmkg.go.id/cuaca/pelabuhan/'+slug;
 const link='<div style="margin-top:3px"><a href="'+url+'" target="_blank" rel="noopener">Detail resmi BMKG ↗</a></div>';
 if(rec[0]==='og'){const t='<b>'+String(rec[1]).replace(/^Prakiraan cuaca maritim terkini untuk Pelabuhan[^.]*\.\s*Data cuaca:\s*/,'')+'</b>';return t+link}
 const ringkas='<b>'+rec[0]+'</b> · Gelombang '+(rec[1]?rec[1]+' ':'')+'('+rec[2]+' m) · Angin '+rec[3]+' '+rec[4]+' kt';
 if(!full)return ringkas+link;
 const baris=[['CUACA',rec[0]],['GELOMBANG',(rec[1]?rec[1]+' ':'')+'('+rec[2]+')'],['ANGIN',rec[3]+' — '+rec[4]+'–'+rec[4]+' knot'],['JARAK PANDANG',rec[5]],['SUHU',rec[6]+'–'+rec[7]+' °C'],['KELEMBAPAN',rec[8]+'–'+rec[9]+' %'],['BERLAKU',portFmtBerlaku(rec[10])+' s.d.<br>'+portFmtBerlaku(rec[11])]];
 return portRowsHTML(baris)+'<div class="portpop-f">Sumber: BMKG Maritim · dipanen '+(dibuat||'')+'</div>'+link.replace('margin-top:3px','margin:6px 16px 12px');
}
async function portSummaryHTML(slug,full){
 const key=full?slug+'#full':slug;
 if(portCache[key])return portCache[key];
 const pd=await portLoadData();
 if(pd&&pd.data&&pd.data[slug]){const hasil=portFromRecord(slug,pd.data[slug],full,pd.dibuat);portCache[key]=hasil;return hasil}
 const url='https://maritim.bmkg.go.id/cuaca/pelabuhan/'+slug;
 const relays=['https://api.allorigins.win/raw?url='+encodeURIComponent(url),'https://api.codetabs.com/v1/proxy?quest='+encodeURIComponent(url)];
 let ringkas='',lengkap='';
 for(const r of relays){try{const resp=await fetchTimeout(r,12000);const html=await resp.text();
   const rows=portParseRows(html);
   if(rows.length){const now=Date.now();let cur=rows[rows.length-1];for(const x of rows){if(x.t>=now-1800e3){cur=x;break}}
    ringkas='<b>'+cur.cuaca+'</b> · Gelombang '+(cur.gelKat?cur.gelKat+' ':'')+portKoma(cur.gel)+' m · Angin '+cur.anginDir+' '+cur.anginKt+' kt';
    lengkap=portRichHTML(rows);break}
   const m=html.match(/og:description" content="([^"]+)"/);if(m){ringkas=m[1].replace(/^Prakiraan cuaca maritim terkini untuk Pelabuhan[^.]*\.\s*Data cuaca:\s*/,'').replace(/, Angin:/,' · Angin:').replace(/, Gelombang:/,' · Gelombang:').replace(/Gelombang: ([\d.]+)m/,'Gelombang: $1 m');ringkas='<b>'+ringkas+'</b>';break}
  }catch(e){}}
 const link='<div style="margin-top:3px"><a href="'+url+'" target="_blank" rel="noopener">Detail resmi BMKG ↗</a></div>';
 if(ringkas){portCache[slug]=ringkas+link;portCache[slug+'#full']=(lengkap||ringkas)+link}
 else{const gagal='<span style="color:var(--mut)">Ringkasan belum dapat dimuat dari sini (halaman BMKG tidak mengizinkan pengambilan lintas situs).</span>'+link;portCache[slug]=gagal;portCache[slug+'#full']=gagal}
 return portCache[key];
}
async function loadPort(i){const box=document.getElementById('port-'+i);if(box)box.innerHTML=await portSummaryHTML(PORTS[i][1],false)}
function portShowMarkers(){
 if(!portGroup){portGroup=L.layerGroup();
  PORTS.forEach((x,i)=>{const mk=L.marker([x[2],x[3]],{icon:portIcon()}).bindPopup(portPopupShell(x[0],x[1]),{maxWidth:330,className:'port-pop'});
   mk.on('popupopen',async()=>{const d=document.getElementById('pop-'+x[1]);if(d)d.innerHTML=await portSummaryHTML(x[1],true)});
   portMarkers[i]=mk;portGroup.addLayer(mk)})}
 portGroup.addTo(map);portOn=true;portLoadNasional();
}
let portNasDone=false;
async function portLoadNasional(){
 if(portNasDone||!portGroup)return;portNasDone=true;
 try{
  const r=await fetch('ports-nasional.json');const rows=await r.json();
  const ada=new Set(PORTS.map(x=>x[1]));let n=0;
  rows.forEach(row=>{const nm=row[0],slug=row[1],lat=row[2],lng=row[3];if(lat==null||ada.has(slug))return;
   const mk=L.marker([lat,lng],{icon:portIcon()}).bindPopup(portPopupShell(nm,slug),{maxWidth:330,className:'port-pop'});
   mk.on('popupopen',async()=>{const d=document.getElementById('pop-'+slug);if(d)d.innerHTML=await portSummaryHTML(slug,true)});
   portGroup.addLayer(mk);n++});
  if(portOn&&n)toast('⚓ '+n+' pelabuhan BMKG lain se-Indonesia ikut ditandai di peta');
 }catch(e){}
}
function portGo(i){
 if(!portOn){portShowMarkers();chipState('Pelabuhan',true)}
 loadPort(i);
 map.flyTo([PORTS[i][2],PORTS[i][3]],Math.max(map.getZoom(),11),{duration:1.1});
 setTimeout(()=>{if(portMarkers[i])portMarkers[i].openPopup()},1250);
}
function openPorts(){
 if(portOn){portOn=false;if(portGroup)map.removeLayer(portGroup);chipState('Pelabuhan',false);toast('Fitur pelabuhan & perairan dimatikan');return}
 const b=document.querySelector('[data-p=geodisaster]');if(b)b.click();
 document.getElementById('side').classList.remove('hidden');
 renderPorts();portShowMarkers();chipState('Pelabuhan',true);
 map.flyToBounds(L.latLngBounds(PORTS.map(x=>[x[2],x[3]])).pad(0.12),{duration:1.1});
 setTimeout(()=>{const c=document.getElementById('portCard');if(c)c.scrollIntoView({behavior:'smooth',block:'start'})},90);
 loadPort(0);loadPort(1);
 toast('⚓ Pelabuhan & perairan aktif: gelombang BMKG + penanda 658 pelabuhan BMKG se-Indonesia');
}

// ===== PERAIRAN BMKG: poligon resmi GIS BMKG + prakiraan situs BMKG Maritim (hasil panen sendiri) =====
let perairanOn=false,perairanLayer=null,perairanData=null,perairanMeta='',perairanLinked=0;
function perairanPopupHTML(p){
 const rec=(p&&p.slug&&perairanData)?perairanData[p.slug]:null;
 let inner;
 if(rec){
  if(rec[2]==='og'){inner='<div style="padding:10px 16px 4px;font-size:12.5px"><b>'+rec[3]+'</b></div>'}
  else{inner=portRowsHTML([['KODE WILAYAH',rec[0]],['CUACA',rec[2]],['GELOMBANG',rec[3]+' ('+rec[4]+')'],['ANGIN',rec[5]+' — '+rec[6]+'–'+rec[6]+' knot'],['BERLAKU',portFmtBerlaku(rec[7])+' s.d.<br>'+portFmtBerlaku(rec[8])]]);
  if(rec[1]!==p.nama)inner+='<div class="portpop-f" style="border-top:none;padding-top:0">Poligon GIS BMKG: '+p.nama+' ('+p.kode+')</div>'}
  inner+='<div class="portpop-f">Sumber: BMKG Maritim · dipanen '+perairanMeta+'</div><div style="margin:6px 16px 12px"><a href="https://maritim.bmkg.go.id/cuaca/perairan/'+p.slug+'" target="_blank" rel="noopener">Detail resmi BMKG ↗</a></div>';
  return '<div class="portpop"><div class="portpop-h"><span class="portpop-pill">● CUACA PERAIRAN</span><div class="portpop-t">'+rec[1]+'</div></div><div class="portpop-b">'+inner+'</div></div>';
 }
 inner=portRowsHTML([['KODE WILAYAH (GIS BMKG)',p.kode]])+'<div style="padding:2px 16px 4px;font-size:12px;color:#475569">Prakiraan situs BMKG Maritim untuk wilayah ini belum terhubung ke poligon resminya.</div><div class="portpop-f">Sumber: poligon GIS BMKG</div><div style="margin:6px 16px 12px"><a href="https://maritim.bmkg.go.id/cuaca/perairan" target="_blank" rel="noopener">Indeks Perairan BMKG ↗</a></div>';
 return '<div class="portpop"><div class="portpop-h"><span class="portpop-pill">● CUACA PERAIRAN</span><div class="portpop-t">'+p.nama+'</div></div><div class="portpop-b">'+inner+'</div></div>';
}
async function perairanLoad(){
 if(perairanLayer)return true;
 try{
  const [g,d]=await Promise.all([fetch('perairan-geom.geojson').then(r=>{if(!r.ok)throw new Error('geom');return r.json()}),fetch('perairan-data.json').then(r=>{if(!r.ok)throw new Error('data');return r.json()})]);
  perairanData=d.data||{};perairanMeta=d.dibuat||'';perairanLinked=0;
  perairanLayer=L.geoJSON(g,{style:{color:'#1773b8',weight:1,fillColor:'#35b26f',fillOpacity:.16},onEachFeature:(f,l)=>{if(f.properties&&f.properties.slug)perairanLinked++;l.bindPopup(perairanPopupHTML(f.properties),{maxWidth:330,className:'port-pop'});l.on('mouseover',()=>l.setStyle({fillOpacity:.35,weight:1.8}));l.on('mouseout',()=>{if(perairanLayer)perairanLayer.resetStyle(l)})}});
  return true;
 }catch(e){return false}
}
async function togglePerairan(){
 if(perairanOn){perairanOn=false;if(perairanLayer)map.removeLayer(perairanLayer);chipState('Perairan',false);wxRender();return}
 toast('🌊 Memuat poligon wilayah perairan BMKG…');
 if(!await perairanLoad()){toast('⚠️ Data perairan belum bisa dimuat — coba lagi sebentar lagi.');return}
 perairanOn=true;perairanLayer.addTo(map);chipState('Perairan',true);
 toast('🌊 Perairan BMKG aktif — '+perairanLinked+' dari 232 poligon terhubung prakiraan situs BMKG Maritim. Klik poligon untuk detailnya.');
 wxRender();
}
