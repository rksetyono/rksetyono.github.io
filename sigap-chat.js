/* ================= TANYA SIGAP — asisten chat data wilayah =================
   Implementasi SIGAP: tanya-jawab data wilayah dari sumber publik yang sama
   (API Wilayah Kemendagri/Emsifa, BMKG, USGS, Open-Meteo, Aladhan). */
let tsHist=[], tsBusy=false, tsReg=new Map(), tsProvIdx=null, tsKabIdx=null, tsDistCache={}, tsVilCache={}, tsLayer=null, tsDroughtCache={};
const TSCHIPS=[['Profil Kota Tarakan','Kota Tarakan'],['Cuaca Tarakan','Cuaca Kota Tarakan'],['Riwayat Gempa Kaltara','Riwayat gempa Kalimantan Utara'],['Kekeringan Bulungan','Kekeringan Kabupaten Bulungan'],['Penduduk Kaltara','Penduduk Kalimantan Utara'],['Hotspot Kalimantan','Hotspot Kalimantan'],['Layer Aktif','Layer apa saja yang aktif?'],['Ringkasan Peta','Ringkasan peta']];
function tsEsc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function tsNum(n){return n==null||isNaN(n)?'-':Math.round(+n).toLocaleString('id-ID')}
function tsNum1(n){return n==null||isNaN(n)?'-':(+n).toLocaleString('id-ID',{maximumFractionDigits:1})}
function tsHav(a,b,c,d){const R=6371,t=Math.PI/180;const h=Math.sin((c-a)*t/2)**2+Math.cos(a*t)*Math.cos(c*t)*Math.sin((d-b)*t/2)**2;return 2*R*Math.asin(Math.sqrt(h))}
function tsNormQ(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim()}
function tsBare(name){return String(name||'').replace(/^(kabupaten|kota|provinsi|kecamatan|kelurahan|kab\.|kec\.|desa)\s+/i,'').trim()}
const TSALIAS={jatim:'jawa timur',jabar:'jawa barat',jateng:'jawa tengah',kaltara:'kalimantan utara',kalsel:'kalimantan selatan',kaltim:'kalimantan timur',kalbar:'kalimantan barat',kalteng:'kalimantan tengah',sumut:'sumatera utara',sumbar:'sumatera barat',sumsel:'sumatera selatan',sulsel:'sulawesi selatan',sulut:'sulawesi utara',sulteng:'sulawesi tengah',sultra:'sulawesi tenggara',jakarta:'dki jakarta',dki:'dki jakarta',jogja:'di yogyakarta',yogyakarta:'di yogyakarta',diy:'di yogyakarta',babel:'kepulauan bangka belitung',kepri:'kepulauan riau',papbar:'papua barat',ntb:'nusa tenggara barat',ntt:'nusa tenggara timur'};
function tsAlias(q){return q.split(' ').map(w=>TSALIAS[w]||w).join(' ')}
function tsStripSeq(qstr,seq){if(!seq)return qstr;const pad=' '+qstr+' ',nd=' '+seq+' ';const i=pad.lastIndexOf(nd);if(i<0)return qstr;return(pad.slice(0,i)+' '+pad.slice(i+nd.length)).replace(/\s+/g,' ').trim()}
async function tsFetch(p){const r=await fetch(`${WILAPI}/${p}`);if(!r.ok)throw new Error(r.status);const j=await r.json();return j.data}
async function tsProv(){if(tsProvIdx)return tsProvIdx;const d=await tsFetch('provinces.json');tsProvIdx=d.map(o=>({...o,level:'provinsi',lvlLabel:'Provinsi'}));return tsProvIdx}
async function tsKab(){if(tsKabIdx)return tsKabIdx;try{const c=localStorage.getItem('sigapKabIdxV1');if(c){const j=JSON.parse(c);if(Array.isArray(j)&&j.length>400){tsKabIdx=j;return j}}}catch(e){}
  const provs=await tsProv();const all=[];for(const p of provs){try{const d=await tsFetch('regencies/'+p.id+'.json');d.forEach(o=>all.push({...o,level:'kabupaten',lvlLabel:/^Kota/i.test(o.name)?'Kota':'Kabupaten',prov:p.name}))}catch(e){}}
  tsKabIdx=all;try{localStorage.setItem('sigapKabIdxV1',JSON.stringify(all))}catch(e){}return all}
async function tsDistricts(kab){if(tsDistCache[kab.id])return tsDistCache[kab.id];const d=await tsFetch('districts/'+kab.id+'.json');const out=d.map(o=>({...o,level:'kecamatan',lvlLabel:'Kecamatan',prov:kab.prov,parent:kab.name}));tsDistCache[kab.id]=out;return out}
async function tsVillages(kec){if(tsVilCache[kec.id])return tsVilCache[kec.id];const d=await tsFetch('villages/'+kec.id+'.json');const out=d.map(o=>({...o,level:'desa',lvlLabel:'Desa/Kelurahan',prov:kec.prov,parent:kec.parent+' > '+kec.name}));tsVilCache[kec.id]=out;return out}
function tsMatch(list,q){const out=[];if(!q)return out;for(const r of list){const b=tsNormQ(tsBare(r.name));let s=0;if(b===q)s=3;else if(b.startsWith(q+' ')||b===q)s=3;else if(b.startsWith(q))s=2;else if((' '+b+' ').includes(' '+q+' '))s=2;else if(b.includes(q))s=1;if(s)out.push({r,s})}return out.sort((x,y)=>y.s-x.s||x.r.name.length-y.r.name.length)}
async function tsResolve(qstr){
  const provs=await tsProv(), kabs=await tsKab();
  let pm=tsMatch(provs,qstr), km=tsMatch(kabs,qstr);
  const best=Math.max(pm.length?pm[0].s:0, km.length?km[0].s:0);
  if(best>0){let cand=[...pm.filter(x=>x.s===best).map(x=>x.r),...km.filter(x=>x.s===best).map(x=>x.r)];
    cand=[...new Map(cand.map(r=>[r.level+':'+r.id,r])).values()];
    if(cand.length===1)return{one:cand[0]}; if(cand.length>1)return{many:cand.slice(0,6)}}
  /* coba kecamatan/desa: temukan kabupaten yang namanya muncul di query, sisa token = nama kec/desa */
  const toks=qstr.split(' ');
  for(const k of kabs){const kb=tsNormQ(tsBare(k.name));if(kb&&(' '+qstr+' ').includes(' '+kb+' ')){
    const rest=tsStripSeq(qstr,kb);if(!rest)continue;
    const ds=await tsDistricts(k);const dm=tsMatch(ds,rest);
    if(dm.length&&dm[0].s>=2){if(dm.length===1||dm[0].s>dm[1].s){
      const vs=await tsVillages(dm[0].r);const vm=tsMatch(vs,tsStripSeq(rest,tsNormQ(tsBare(dm[0].r.name))));
      if(vm.length&&vm[0].s>=2)return{one:vm[0].r};
      return{one:dm[0].r}}return{many:dm.slice(0,6).map(x=>x.r)}}
    if(dm.length>1)return{many:dm.slice(0,6).map(x=>x.r)}}
  }
  return{}}
function tsDrawRegion(r){try{if(tsLayer){map.removeLayer(tsLayer);tsLayer=null}
  if(!r||r.has_path===false||!r.id)return;
  ambilPath(r.id).then(path=>{if(!path||!path.length)return;const core=L.polygon(path,{color:'#005baa',weight:3,dashArray:'9 6',fillColor:'#0072bc',fillOpacity:.10});const cas=L.polygon(path,{color:'#ffffff',weight:5,opacity:.45,dashArray:'9 6',fill:false,interactive:false});tsLayer=L.layerGroup([cas,core]).addTo(map);map.fitBounds(core.getBounds().pad(0.04))}).catch(()=>{})}catch(e){}}
function tsBoundsOf(r,path){if(path&&path.length){let a=[90,180,-90,-180];path.flat(3).forEach(()=>{});const walk=x=>{if(Array.isArray(x)&&typeof x[0]==='number'){a[0]=Math.min(a[0],x[0]);a[2]=Math.max(a[2],x[0]);a[1]=Math.min(a[1],x[1]);a[3]=Math.max(a[3],x[1])}else if(Array.isArray(x))x.forEach(walk)};walk(path);if(a[2]>a[0])return{minLat:a[0],minLng:a[1],maxLat:a[2],maxLng:a[3]}}
  const d=1.3;return{minLat:r.lat-d,minLng:r.lng-d*1.2,maxLat:r.lat+d,maxLng:r.lng+d*1.2}}

const TSVOLS=[['Merapi',-7.542,110.442,2968],['Semeru',-8.108,112.922,3676],['Kelud',-7.935,112.308,1731],['Bromo',-7.942,112.953,2329],['Ijen',-8.058,114.242,2799],['Raung',-8.125,114.042,3332],['Arjuno-Welirang',-7.725,112.578,3339],['Slamet',-7.242,109.208,3428],['Sumbing',-7.384,110.07,3371],['Sindoro',-7.3,109.996,3136],['Dieng',-7.2,109.92,2565],['Ciremai',-6.892,108.4,3078],['Gede',-6.78,106.98,2958],['Salak',-6.72,106.73,2211],['Tangkuban Parahu',-6.77,107.6,2084],['Papandayan',-7.32,107.73,2665],['Guntur',-7.15,107.85,2249],['Galunggung',-7.25,108.058,2168],['Anak Krakatau',-6.102,105.423,157],['Kerinci',-1.697,101.264,3805],['Sinabung',3.17,98.392,2460],['Marapi',-0.381,100.473,2891],['Talang',-0.978,100.679,2597],['Dempo',-4.016,103.13,3159],['Agung',-8.342,115.508,3142],['Batur',-8.242,115.375,1717],['Rinjani',-8.42,116.47,3726],['Tambora',-8.25,117.992,2722],['Sangeang Api',-8.2,119.07,1949],['Lewotobi',-8.542,122.775,1786],['Ili Lewotolok',-8.272,123.505,1423],['Dukono',1.68,127.88,1335],['Ibu',1.488,127.63,1325],['Gamalama',0.8,127.33,1715],['Soputan',1.108,124.725,1784],['Lokon',1.358,124.792,1580],['Karangetang',2.78,125.4,1827],['Ruang',2.3,125.37,725],['Awu',3.67,125.5,1320]];
function tsWxDesc(c){if(c==null)return'-';if(c===0)return'Cerah';if(c===1)return'Cerah Berawan';if(c===2)return'Berawan Sebagian';if(c===3)return'Berawan';if(c===45||c===48)return'Berkabut';if(c>=51&&c<=55)return'Gerimis';if(c===56||c===57)return'Gerimis Beku';if(c>=61&&c<=65)return'Hujan';if(c===66||c===67)return'Hujan Beku';if(c>=71&&c<=77)return'Salju';if(c>=80&&c<=82)return'Hujan Lokal';if(c===85||c===86)return'Salju';if(c===95)return'Hujan Petir';if(c>=96)return'Hujan Petir + Es';return'Berawan'}
async function tsWeatherOM(r){const u=`https://api.open-meteo.com/v1/forecast?latitude=${r.lat}&longitude=${r.lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=auto&forecast_days=4`;
  const j=await (await fetch(u)).json();const c=j.current,d=j.daily;const df=i=>new Date(d.time[i]+'T12:00:00').toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'short'});
  let h=`<p><b>Kondisi:</b> ${tsWxDesc(c.weather_code)} · <b>Suhu:</b> ${tsNum1(c.temperature_2m)}°C (terasa ${tsNum1(c.apparent_temperature)}°C)</p><p><b>Kelembapan:</b> ${tsNum(c.relative_humidity_2m)}% · <b>Angin:</b> ${tsNum1(c.wind_speed_10m)} km/j · <b>Hujan hari ini:</b> ${tsNum1(d.precipitation_sum[0])} mm</p><p><b>Prakiraan:</b></p><ul>`;
  for(let i=0;i<Math.min(3,d.time.length);i++)h+=`<li>${df(i)}: ${tsNum1(d.temperature_2m_min[i])}–${tsNum1(d.temperature_2m_max[i])}°C, ${tsWxDesc(d.weather_code[i])} (${tsNum1(d.precipitation_sum[i])} mm)</li>`;
  return h+'</ul>'}
async function tsWeatherBMKG(r){const j=await (await fetch('https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4='+encodeURIComponent(r.id))).json();
  const days=j.data[0].cuaca;const flat=days.flat();if(!flat.length)throw new Error('kosong');
  const now=flat[0];const df=s=>new Date(s).toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'short'});
  let h=`<p><b>Kondisi:</b> ${tsEsc(now.weather_desc)} · <b>Suhu:</b> ${tsNum1(now.t)}°C</p><p><b>Kelembapan:</b> ${tsNum(now.hu)}% · <b>Angin:</b> ${tsNum1(now.ws)} km/j · <b>Tutupan awan:</b> ${tsNum(now.tcc)}%</p><p><b>Prakiraan:</b></p><ul>`;
  days.slice(0,3).forEach(dy=>{if(!dy.length)return;const ts=dy.map(e=>+e.t);h+=`<li>${df(dy[0].datetime)}: ${Math.min(...ts)}–${Math.max(...ts)}°C, ${tsEsc(dy[Math.floor(dy.length/2)].weather_desc)}</li>`});
  return h+'</ul>'}
async function tsWeather(r){try{if(r.level==='desa')return{html:await tsWeatherBMKG(r),src:'BMKG (prakiraan per desa/kelurahan)'}}catch(e){}
  return{html:await tsWeatherOM(r),src:'Open-Meteo (estimasi grid di titik pusat wilayah)'}}
async function tsPrayer(r){const ts=Math.floor(Date.now()/1000);const j=await (await fetch(`https://api.aladhan.com/v1/timings/${ts}?latitude=${r.lat}&longitude=${r.lng}&method=20`)).json();
  const t=j.data.timings;const g=k=>String(t[k]||'').replace(/\s*\(.*\)/,'');
  return`<p>Imsak ${g('Imsak')} · Subuh ${g('Fajr')} · Terbit ${g('Sunrise')} · Dzuhur ${g('Dhuhr')} · Ashar ${g('Asr')} · Magrib ${g('Maghrib')} · Isya ${g('Isha')}</p><p class="sub">Metode Kemenag RI, dihitung untuk titik pusat ${tsEsc(tsBare(r.name))}.</p>`}
async function tsBmkgQuakes(){const out=[];for(const f of['gempaterkini','gempadirasakan']){try{const j=await (await fetch('https://data.bmkg.go.id/DataMKG/TEWS/'+f+'.json')).json();(j.Infogempa.gempa||[]).forEach(g=>{const co=String(g.Coordinates||'').split(',').map(Number);if(co.length===2&&!isNaN(co[0]))out.push({mag:+g.Magnitude,depth:g.Kedalaman,lat:co[0],lng:co[1],wil:g.Wilayah,dt:g.DateTime,dirasakan:g.Dirasakan||''})})}catch(e){}}return out}
async function tsQuakesNear(r){const qs=await tsBmkgQuakes();if(!qs.length)throw new Error('gempa kosong');
  const withD=qs.map(q=>({...q,d:tsHav(r.lat,r.lng,q.lat,q.lng)})).sort((a,b)=>a.d-b.d).slice(0,3);
  return'<ul>'+withD.map(q=>`<li><b>M${tsNum1(q.mag)}</b> — ${tsNum(q.d)} km · ${tsEsc(q.wil)} (kedalaman ${tsEsc(q.depth)})</li>`).join('')+'</ul>'}
async function tsUsgs(r){let path=null;try{if(r.has_path!==false)path=await ambilPath(r.id)}catch(e){}
  const b=tsBoundsOf(r,path);const now=new Date();const iso=d=>d.toISOString().slice(0,10);
  const bb=`minlatitude=${b.minLat}&maxlatitude=${b.maxLat}&minlongitude=${b.minLng}&maxlongitude=${b.maxLng}`;
  const cnt=async(days,minmag)=>{const s=new Date(now-days*864e5);const t=await (await fetch(`https://earthquake.usgs.gov/fdsnws/event/1/count?starttime=${iso(s)}&endtime=${iso(now)}&${bb}&minmagnitude=${minmag}`)).text();const j=JSON.parse(t);return j.count};
  const [c365,c30,top]=await Promise.all([cnt(365,4),cnt(30,2.5),(async()=>{const s=new Date(now-365*864e5);const j=await (await fetch(`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${iso(s)}&endtime=${iso(now)}&${bb}&minmagnitude=4&orderby=magnitude&limit=3`)).json();return j.features||[]})()]);
  let h=`<p>Dalam batas wilayah ini: <b>${tsNum(c365)} gempa M≥4</b> dalam 1 tahun terakhir · <b>${tsNum(c30)} gempa M≥2,5</b> dalam 30 hari terakhir (katalog USGS).</p>`;
  if(top.length)h+='<p><b>Terbesar (1 tahun):</b></p><ul>'+top.map(f=>`<li><b>M${tsNum1(f.properties.mag)}</b> — ${tsEsc(f.properties.place)} (kedalaman ${tsNum(f.geometry.coordinates[2])} km, ${new Date(f.properties.time).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})})</li>`).join('')+'</ul>';
  return h}
function tsVolcanoes(r){const v=TSVOLS.map(x=>({n:x[0],e:x[3],d:tsHav(r.lat,r.lng,x[1],x[2])})).sort((a,b)=>a.d-b.d).slice(0,3);
  return'<ul>'+v.map(x=>`<li><b>${x.n}</b> — ${tsNum(x.d)} km · ${tsNum(x.e)} mdpl</li>`).join('')+'</ul><p class="sub">Daftar referensi gunung berapi aktif (PVMBG); status aktivitas tidak ditampilkan — cek MAGMA Indonesia untuk status resmi terkini.</p>'}
async function tsDrought(r){if(tsDroughtCache[r.id])return tsDroughtCache[r.id];
  const now=new Date();const iso=d=>d.toISOString().slice(0,10);const end=new Date(now-5*864e5),start=new Date(now-95*864e5);
  const base=`https://archive-api.open-meteo.com/v1/archive?latitude=${r.lat}&longitude=${r.lng}&daily=precipitation_sum&timezone=UTC`;
  const [rj,cj]=await Promise.all([(await fetch(`${base}&start_date=${iso(start)}&end_date=${iso(end)}`)).json(),(await fetch(`${base}&start_date=1991-01-01&end_date=2020-12-31`)).json()]);
  const rt=rj.daily.time,rp=rj.daily.precipitation_sum.map(v=>v||0);const recent=rp.reduce((a,b)=>a+b,0);
  const cm={};cj.daily.time.forEach((t,i)=>{const k=t.slice(5);(cm[k]=cm[k]||[]).push(cj.daily.precipitation_sum[i]||0)});
  let clim=0,n=0;rt.forEach(t=>{const arr=cm[t.slice(5)];if(arr){clim+=arr.reduce((a,b)=>a+b,0)/arr.length;n++}});
  if(!n||!clim)throw new Error('iklim kosong');
  const def=(clim-recent)/clim*100;let streak=0;for(let i=rp.length-1;i>=0;i--){if(rp[i]<1)streak++;else break}
  let longest=0,run=0;rp.forEach(v=>{run=v<1?run+1:0;longest=Math.max(longest,run)});
  const cat=def<=0?'lebih basah dari normal':def<=15?'normal cenderung kering':def<=30?'kering':def<=50?'kering berat':'sangat kering';
  const out={recent,clim,def,streak,longest,cat,from:iso(start),to:iso(end)};tsDroughtCache[r.id]=out;return out}

function tsHead(r){const chain=r.level==='kabupaten'&&r.prov?`<p class="sub">${tsEsc(r.lvlLabel)} | Kode: ${tsEsc(r.id)} · Provinsi ${tsEsc(r.prov)}</p>`:r.level==='kecamatan'?`<p class="sub">Kecamatan | Kode: ${tsEsc(r.id)} · ${tsEsc(r.parent||'')}, ${tsEsc(r.prov||'')}</p>`:r.level==='desa'?`<p class="sub">Desa/Kelurahan | Kode: ${tsEsc(r.id)} · ${tsEsc(r.parent||'')}, ${tsEsc(r.prov||'')}</p>`:`<p class="sub">${tsEsc(r.lvlLabel)} | Kode: ${tsEsc(r.id)}</p>`;
  return`<h4>Profil Wilayah: ${tsEsc(r.name)}</h4>${chain}`}
function tsFakta(r){let h='<h5>🗺 Fakta Wilayah</h5>';
  if(r.total_area)h+=`<p><b>Luas:</b> ${tsNum(r.total_area)} km²</p>`;
  if(r.capital)h+=`<p><b>Ibu kota:</b> ${tsEsc(r.capital)}</p>`;
  if(r.population)h+=`<p><b>Penduduk:</b> ${tsNum(r.population)} jiwa${r.total_area?` · <b>Kepadatan:</b> ${tsNum(r.population/r.total_area)}/km²`:''}</p>`;
  if(r.elv!=null)h+=`<p><b>Elevasi titik pusat:</b> ${tsNum(r.elv)} mdpl</p>`;
  h+=`<p><b>Titik pusat:</b> ${(+r.lat).toFixed(4)}, ${(+r.lng).toFixed(4)}</p>`;return h}
function tsDroughtHTML(d){return`<p>Periode ${d.from} s.d. ${d.to} (90 hari): hujan tercatat <b>${tsNum1(d.recent)} mm</b>, normal iklim 1991–2020 untuk tanggal yang sama <b>${tsNum1(d.clim)} mm</b> → defisit <b>${d.def>0?tsNum1(d.def):'0'}%</b> (${d.cat}).</p><p><b>Hari tanpa hujan (&lt;1 mm):</b> ${d.streak} hari beruntun terakhir · terpanjang ${d.longest} hari dalam periode ini.</p>`}
async function tsProfile(r,focus){focus=focus||'profil';let h=tsHead(r);const srcs=['API Wilayah Kemendagri (Emsifa)'];
  const btn=`<div class="ts-acts"><button class="ts-btn" data-ts="kirim" data-q="${tsEsc(r.name)}">📋 Profil lengkap ${tsEsc(tsBare(r.name))}</button></div>`;
  if(focus==='penduduk'){h+='<h5>👥 Data Penduduk</h5>'+(r.population?`<p><b>Total:</b> ${tsNum(r.population)} jiwa</p>${r.total_area?`<p><b>Luas:</b> ${tsNum(r.total_area)} km² · <b>Kepadatan:</b> ${tsNum(r.population/r.total_area)}/km²</p>`:''}${r.capital?`<p><b>Ibu kota:</b> ${tsEsc(r.capital)}</p>`:''}`:'<p>Data penduduk untuk wilayah ini belum tersedia di API Wilayah.</p>')+btn;return{html:h,srcs}}
  if(focus==='cuaca'||focus==='profil'){try{const w=await tsWeather(r);h+='<h5>🌦 Cuaca</h5>'+w.html;srcs.push(w.src)}catch(e){if(focus==='cuaca')h+='<h5>🌦 Cuaca</h5><p>Data cuaca sedang tidak dapat dimuat.</p>'}}
  if(focus==='cuaca')return{html:h+btn,srcs};
  if(focus==='profil'){h=tsHead(r)+tsFakta(r)+h.slice(tsHead(r).length);
    try{h+='<h5>🕌 Waktu Sholat Hari Ini</h5>'+await tsPrayer(r);srcs.push('Aladhan (metode Kemenag)')}catch(e){}
    try{const d=await tsDrought(r);h+='<h5>🌵 Kekeringan — Defisit Hujan</h5>'+tsDroughtHTML(d);srcs.push('Arsip hujan Open-Meteo/ERA5')}catch(e){}}
  if(focus==='kekeringan'){try{const d=await tsDrought(r);h+='<h5>🌵 Kekeringan — Analisis Defisit Hujan</h5>'+tsDroughtHTML(d)+'<p class="sub">Catatan: ini analisis defisit hujan dari arsip satelit/model — bukan indeks SPI/SPEI atau produk Hari Tanpa Hujan resmi BMKG.</p>';srcs.push('Arsip hujan Open-Meteo/ERA5')}catch(e){h+='<p>Analisis kekeringan sedang tidak dapat dimuat.</p>'}return{html:h+btn,srcs}}
  if(focus==='gempa'||focus==='profil'){
    try{h+='<h5>📍 Gempa Terdekat (BMKG)</h5>'+await tsQuakesNear(r);srcs.push('Gempa BMKG (TEWS)')}catch(e){}
    if(r.level==='provinsi'||r.level==='kabupaten'){try{h+='<h5>🌐 Riwayat Gempa (Katalog USGS)</h5>'+await tsUsgs(r);srcs.push('Katalog gempa USGS')}catch(e){}}}
  if(focus==='gempa')return{html:h+btn,srcs};
  if(focus==='profil'){try{h+='<h5>🌋 Gunung Berapi Terdekat</h5>'+tsVolcanoes(r)}catch(e){}}
  return{html:h,srcs}}
function tsLayerList(){const out=[];document.querySelectorAll('#quick button.on').forEach(b=>out.push(b.textContent.trim()));
  if(satKey&&!out.some(x=>/Himawari/i.test(x)))out.push('Citra satelit: '+satKey);
  if(pmLayer&&!out.some(x=>/PM2.5/i.test(x)))out.push('PM2.5 (BMKG PCM)');
  if(quakeLayer&&!out.some(x=>/Gempa/i.test(x)))out.push('Gempa BMKG');
  if(gibsLayer&&!out.some(x=>/VIIRS|SST/i.test(x)))out.push('Layer NASA GIBS ('+(typeof gibsKind!=='undefined'?gibsKind:'')+')');
  if(ltLayer&&!out.some(x=>/Petir/i.test(x)))out.push('Petir (lightning)');
  return out}
function tsLayerAktif(){const l=tsLayerList();return`<h4>Layer Aktif di Peta</h4>`+(l.length?'<ul>'+l.map(x=>`<li>${tsEsc(x)}</li>`).join('')+'</ul>':'<p>Tidak ada layer aktif saat ini.</p>')}
async function tsRingkasan(){const c=map.getCenter();const l=tsLayerList();let h=`<h4>Ringkasan Data Peta</h4><p><b>Pusat peta:</b> ${c.lat.toFixed(4)}, ${c.lng.toFixed(4)} (zoom ${tsNum1(map.getZoom())})</p><p><b>Layer aktif:</b> ${l.length}${l.length?' — '+l.map(tsEsc).join(', '):''}</p>`;
  try{const j=await (await fetch('https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json')).json();const g=j.Infogempa.gempa;h+=`<p><b>Gempa terakhir (BMKG):</b> M${tsEsc(g.Magnitude)} — ${tsEsc(g.Wilayah)} (${tsEsc(g.DateTime)}, kedalaman ${tsEsc(g.Kedalaman)})</p>`}catch(e){}
  if(satKey){h+=`<p><b>Citra satelit aktif:</b> ${tsEsc(satKey)}${typeof satRuns!=='undefined'&&satRuns&&satRuns.length?` · frame ${tsEsc(satRuns[Math.min(typeof satIdx!=='undefined'?satIdx:0,satRuns.length-1)])}`:''}</p>`}
  return h}
function tsHotspot(){return`<h4>Data Hotspot Karhutla</h4><p>Jumlah titik panas resmi (SIPONGI KLHK / NASA FIRMS) belum dapat ditampilkan di SIGAP JUWATA karena layanan datanya memerlukan kunci akses tersendiri — saya tidak akan menampilkan angka yang tidak bisa diverifikasi.</p><p>Sebagai gantinya, aktifkan layer citra VIIRS untuk melihat area panas permukaan terkini dari satelit:</p><div class="ts-acts"><button class="ts-btn" data-ts="viirs">🔥 Tampilkan layer VIIRS</button></div>`}
const TSGLOSS={spi:'<b>SPI (Standardized Precipitation Index)</b> adalah indeks kekeringan meteorologis yang membandingkan curah hujan suatu periode dengan distribusi hujan jangka panjang di tempat yang sama. Nilai negatif berarti lebih kering dari normal; di bawah −2 tergolong sangat kering ekstrem.',spei:'<b>SPEI</b> mirip SPI, tetapi juga memperhitungkan evapotranspirasi (penguapan) sehingga menangkap kekeringan yang diperparah suhu tinggi.',hth:'<b>Hari Tanpa Hujan (HTH)</b> adalah jumlah hari berturut-turut tanpa hujan (atau hujan sangat kecil) yang dipantau BMKG untuk menilai kekeringan dan risiko karhutla.',hotspot:'<b>Hotspot (titik panas)</b> adalah titik di permukaan bumi yang terdeteksi satelit bersuhu jauh lebih tinggi dari sekitarnya — indikasi awal kebakaran hutan dan lahan, bukan luas kebakaran itu sendiri.',metar:'<b>METAR</b> adalah laporan cuaca hasil pengamatan aktual di bandara, diterbitkan berkala (umumnya tiap 30–60 menit) dalam format kode penerbangan.',taf:'<b>TAF</b> adalah prakiraan cuaca bandara untuk periode tertentu (mis. 24 jam) dalam format kode penerbangan.',sigmet:'<b>SIGMET</b> adalah peringatan cuaca signifikan untuk penerbangan (badai petir, turbulensi berat, icing, abu vulkanik) pada wilayah udara tertentu.',ispu:'<b>ISPU (Indeks Standar Pencemar Udara)</b> adalah skala kualitas udara resmi Indonesia: 1–50 Baik, 51–100 Sedang, 101–200 Tidak Sehat, 201–300 Sangat Tidak Sehat, di atas 300 Berbahaya.',dem:'<b>DEM (Digital Elevation Model)</b> adalah data digital ketinggian permukaan bumi yang dipakai untuk analisis topografi, aliran air, dan risiko banjir.',sig:'<b>SIG (Sistem Informasi Geografis)</b> adalah sistem untuk mengelola, menganalisis, dan menampilkan data yang bereferensi lokasi di permukaan bumi — seperti peta berlapis di SIGAP JUWATA ini.'};
function tsHelp(){return`<h4>Tanya SIGAP — Bantuan</h4><p>Saya menjawab pertanyaan seputar <b>data wilayah dan kebencanaan Indonesia</b>: profil wilayah, cuaca, kekeringan (defisit hujan), riwayat gempa, penduduk, layer peta, dan istilah geospasial.</p><h5>Contoh</h5><ul><li>“Kota Tarakan” — profil wilayah</li><li>“Kekeringan Kabupaten Bulungan”</li><li>“Riwayat gempa Kalimantan Utara”</li><li>“Apa itu SPI?”</li><li>“Layer apa saja yang aktif?”</li></ul><p>Gunakan awalan <b>Provinsi</b>, <b>Kabupaten</b>, <b>Kota</b>, <b>Kecamatan</b>, atau <b>Desa</b> untuk hasil yang lebih akurat.</p><p class="sub">Di luar cakupan: pengetahuan umum, berita, dan topik non-geospasial.</p>`}
function tsWelcome(){return`<h4>Selamat datang di Tanya SIGAP!</h4><p>Ketik nama wilayah untuk melihat profilnya — fakta wilayah, cuaca, waktu sholat, analisis defisit hujan, gempa terdekat (BMKG), dan riwayat gempa USGS.</p><h5>Contoh:</h5><ul><li>Kalimantan Utara</li><li>Kota Tarakan</li><li>Kecamatan Tarakan Barat, Kota Tarakan</li><li>Kekeringan Kabupaten Bulungan</li><li>Riwayat gempa Kalimantan Utara</li></ul><p>Gunakan awalan <b>Provinsi</b>, <b>Kabupaten</b>, <b>Kota</b>, <b>Kecamatan</b>, atau <b>Desa</b> untuk hasil lebih akurat.</p><p class="sub">Pilih quick action di bawah untuk analisis cepat:</p>`}

async function tsRegionAnswer(r,intent){tsDrawRegion(r);const p=await tsProfile(r,intent);return p.html+`<p class="src">Sumber: ${p.srcs.map(tsEsc).join(' · ')}</p>`}
async function tsProfileLite(r){let h=`<h4>${tsEsc(r.name)}</h4><p class="sub">Titik lokasi hasil pencarian peta — bukan wilayah administratif Kemendagri, jadi fakta wilayah resmi tidak tersedia. Berikut data di titik tersebut:</p>`;const srcs=['Pencarian lokasi (Nominatim/OSM)'];
  try{const w=await tsWeather(r);h+='<h5>🌦 Cuaca</h5>'+w.html;srcs.push(w.src)}catch(e){}
  try{h+='<h5>🕌 Waktu Sholat Hari Ini</h5>'+await tsPrayer(r);srcs.push('Aladhan (metode Kemenag)')}catch(e){}
  try{h+='<h5>📍 Gempa Terdekat (BMKG)</h5>'+await tsQuakesNear(r);srcs.push('Gempa BMKG (TEWS)')}catch(e){}
  return h+`<p class="src">Sumber: ${srcs.map(tsEsc).join(' · ')}</p>`}
async function tsAnswer(raw){
  const q0=raw.trim();const q=tsAlias(tsNormQ(q0));if(!q)return tsHelp();
  if(/^(bantuan|help|tolong|menu)$/.test(q))return tsHelp();
  const gl=q.match(/^apa itu ([a-z ]+)$/);const term=gl?gl[1].trim():q;
  if(TSGLOSS[term])return`<h4>Istilah Geospasial</h4><p>${TSGLOSS[term]}</p>`;
  if(q.includes('layer')&&(q.includes('aktif')||q.includes('apa')))return tsLayerAktif();
  if(q.startsWith('ringkasan'))return await tsRingkasan();
  if(q.includes('hotspot')||q.includes('titik panas')||q.includes('karhutla'))return tsHotspot();
  if(/\bwaqq\b/.test(q)||q.includes('bandara juwata'))return`<h4>Cuaca Penerbangan — WAQQ</h4><p>METAR/TAF Bandara Juwata (WAQQ) tersedia lengkap di panel Penerbangan:</p><div class="ts-acts"><button class="ts-btn" data-ts="waqq">✈ Buka Cuaca Penerbangan WAQQ</button></div>`;
  let intent='profil';
  if(/kekeringan|defisit|hari tanpa hujan/.test(q))intent='kekeringan';
  else if(/riwayat gempa|gempa/.test(q))intent='gempa';
  else if(/cuaca|prakiraan/.test(q))intent='cuaca';
  else if(/penduduk|populasi/.test(q))intent='penduduk';
  const rs=q.replace(/kekeringan|defisit hujan|hari tanpa hujan|riwayat gempa|gempa bumi|gempa|cuaca|prakiraan|penduduk|populasi|profil|data|wilayah|tentang|kabupaten|kota|provinsi|kecamatan|kelurahan|desa|di|ke|dari/g,' ').replace(/\s+/g,' ').trim();
  if(!rs){if(intent==='gempa'){const qs=await tsBmkgQuakes();qs.sort((a,b)=>String(b.dt).localeCompare(String(a.dt)));return`<h4>Gempa Terkini di Indonesia (BMKG)</h4><ul>`+qs.slice(0,5).map(x=>`<li><b>M${tsNum1(x.mag)}</b> — ${tsEsc(x.wil)} (${tsEsc(x.dt)})</li>`).join('')+`</ul><p class="src">Sumber: Gempa BMKG (TEWS)</p>`}return tsHelp()}
  const res=await tsResolve(rs);
  if(res.one)return await tsRegionAnswer(res.one,intent);
  if(res.many){tsReg.clear();const btns=res.many.map(r=>{const k=r.level+':'+r.id;tsReg.set(k,r);const lab=r.level==='kabupaten'?`${r.name} — ${r.prov}`:r.level==='provinsi'?r.name:`${r.name} — ${r.parent||''}`;return`<button class="ts-btn" data-ts="pilih" data-k="${k}">${tsEsc(lab)}</button>`}).join('');
    return`<p><b>"${tsEsc(q0)}"</b> ditemukan di beberapa wilayah:</p><ul>`+res.many.map(r=>`<li>${tsEsc(r.name)} (${tsEsc(r.lvlLabel)}${r.prov?', '+tsEsc(r.prov):''})</li>`).join('')+`</ul><p class="sub">Pilih salah satu:</p><div class="ts-acts">${btns}</div>`}
  try{const nr=await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&accept-language=id&q=${encodeURIComponent(q0+', Indonesia')}`);const nj=await nr.json();
    if(nj&&nj[0]){const r={level:'lokasi',lvlLabel:'Lokasi',name:nj[0].display_name.split(',').slice(0,2).join(','),lat:+nj[0].lat,lng:+nj[0].lon,has_path:false};map.flyTo([r.lat,r.lng],11);return await tsProfileLite(r)}}catch(e){}
  return`<p>Maaf, <b>"${tsEsc(q0)}"</b> tidak ditemukan sebagai wilayah. Coba nama lain, atau gunakan awalan Provinsi/Kabupaten/Kota/Kecamatan/Desa.</p>`+tsHelp()}
function tsSave(){try{localStorage.setItem('sigapChatV1',JSON.stringify(tsHist.slice(-30)))}catch(e){}}
function tsAdd(who,html){const m=document.getElementById('chatMsgs');const d=document.createElement('div');d.className='msg '+who;d.innerHTML=html;m.appendChild(d);m.scrollTop=m.scrollHeight;return d}
async function tsSend(text){text=String(text||'').trim();if(!text||tsBusy)return;tsBusy=true;
  tsAdd('u',tsEsc(text));tsHist.push({w:'u',h:tsEsc(text)});
  const load=tsAdd('a',`<span class="ts-load">Mencari data ${tsEsc(text)} <i></i><i></i><i></i></span>`);
  try{const ans=await tsAnswer(text);load.innerHTML=ans;tsHist.push({w:'a',h:ans})}catch(e){load.innerHTML='<p>Maaf, terjadi gangguan saat mengambil data. Coba lagi sebentar.</p>';tsHist.push({w:'a',h:load.innerHTML})}
  tsSave();document.getElementById('chatMsgs').scrollTop=1e7;tsBusy=false}
async function tsAskRegion(r,intent){if(tsBusy)return;tsBusy=true;tsAdd('u',tsEsc(r.name));tsHist.push({w:'u',h:tsEsc(r.name)});
  const load=tsAdd('a',`<span class="ts-load">Mencari data ${tsEsc(r.name)} <i></i><i></i><i></i></span>`);
  try{const ans=await tsRegionAnswer(r,intent||'profil');load.innerHTML=ans;tsHist.push({w:'a',h:ans})}catch(e){load.innerHTML='<p>Maaf, profil wilayah gagal dimuat.</p>';tsHist.push({w:'a',h:load.innerHTML})}
  tsSave();document.getElementById('chatMsgs').scrollTop=1e7;tsBusy=false}
(function tsInit(){const fab=document.getElementById('chatFab'),panel=document.getElementById('chatPanel');if(!fab||!panel)return;
  fab.onclick=()=>panel.classList.add('open');
  document.getElementById('chatClose').onclick=()=>panel.classList.remove('open');
  document.getElementById('chatClear').onclick=()=>{tsHist=[];tsReg.clear();document.getElementById('chatMsgs').innerHTML='';const w=tsWelcome();tsAdd('a',w);tsHist.push({w:'a',h:w});tsSave()};
  const chips=document.getElementById('chatChips');TSCHIPS.forEach(([label,qq])=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=()=>tsSend(qq);chips.appendChild(b)});
  document.getElementById('chatForm').addEventListener('submit',e=>{e.preventDefault();const inp=document.getElementById('chatInput');const v=inp.value;inp.value='';tsSend(v)});
  document.getElementById('chatMsgs').addEventListener('click',e=>{const b=e.target.closest('[data-ts]');if(!b)return;const act=b.dataset.ts;
    if(act==='kirim')tsSend(b.dataset.q);
    else if(act==='pilih'){const r=tsReg.get(b.dataset.k);if(r)tsAskRegion(r,'profil');else tsSend(b.textContent)}
    else if(act==='viirs'){try{toggleGibs('viirs')}catch(e){}}
    else if(act==='waqq'){try{openAv()}catch(e){}}});
  let restored=false;try{const s=localStorage.getItem('sigapChatV1');if(s){const j=JSON.parse(s);if(Array.isArray(j)&&j.length){tsHist=j;j.forEach(mm=>tsAdd(mm.w,mm.h));restored=true}}}catch(e){}
  if(!restored){const w=tsWelcome();tsAdd('a',w);tsHist=[{w:'a',h:w}];tsSave()}
})();
