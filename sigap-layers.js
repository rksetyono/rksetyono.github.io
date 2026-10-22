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
