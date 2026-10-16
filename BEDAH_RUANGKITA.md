# BEDAH MENYELURUH — ruangkita.net
Diperiksa langsung: 16 Okt 2026, dari HTML sumber, header server, robots.txt, sitemap.xml, dan file JS inti (map-core.js).

## 1. Kesimpulan singkat
RUANG KITA adalah **web GIS satu halaman (single-page app) statis** — bukan aplikasi server.
- Hosting: **GitHub Pages** (header `Server: GitHub.com`, CDN Fastly, cache 600 detik).
- Sitemap hanya berisi 1 URL: halaman utama itu sendiri.
- 1 file HTML ±280 KB + **158 file JS lokal** di `assets/js/` + 4 file CSS lokal.
- Tidak ada backend sendiri yang terlihat: semua data ditarik browser langsung dari API/tile publik (BMKG, BIG, NASA GIBS, USGS, BNPB, ATR/BPN, dll). Login Google/Firebase hanya dipakai sebagai gerbang untuk beberapa alat (mis. upload SHP).
- Monetisasi: Google AdSense + AMP Auto Ads + donasi Saweria/PayPal.

## 2. Menu utama (navigasi aplikasi)
Di peta ada pencarian terpadu (Unified Search), katalog layer, tombol AI "Tanya Ruang (Beta)", reset layer, dan quick-layer bar: Hotspot, Transjakarta, PM2.5, SST, Angin, Hujan, Boundaries, Radar, VIIRS, ECMWF Fire, Konsesi, Gambut, Sawit, Gunung Api, Pelabuhan, Perairan.

Menu aplikasi (6 modul):
1. **GEONUSA** — data wilayah & penduduk: statistik Indonesia (klaim di situs: 84.503 desa/kel, 7.432 kecamatan, 541 kab/kota, 38 provinsi, sumber BIG RBI), indikator penduduk Dukcapil, pencarian CCTV (GeoWatch), GeoTrans (rute/halte Transjakarta & Trans Jogja).
2. **GEOPORTAL** — katalog SatuPeta BIG (LSD, LBS, erosi, penggunaan tanah, geologi, penduduk Dukcapil per level), unduh DEMNAS (clip batas wilayah → GeoTIFF tanpa token), GeoJogja, GeoJakarta (batas sampai RT), SatuPeta downloader (export SHP).
3. **GEOMET / GEODISASTER** — pemantauan: gempa BMKG (terkini M5+, dirasakan, riwayat, katalog 1923–2022, katalog global USGS, sensor seismik BMKG & global), karhutla/hotspot (VIIRS, MODIS 48 jam & 7 hari, konsesi, gambut, kawasan hutan, PIPPIB, sawit), cuaca sekarang + maritim BMKG, kualitas udara (AirVisual + OpenAQ PM2.5/PM10/PM1), forecasting GFS (angin, kelembapan, hujan 24 jam, PM2.5, hari tanpa hujan, anomali SST, SPI/SPEI 1–12 bulan, animasi partikel angin), gunung api PVMBG + KRB, patahan, likuifaksi, karst, hillshade, Batnas, analisis risiko air (Water Risk).
4. **GEOWATCH** — CCTV: pencarian CCTV per lokasi/wilayah, pemutar video (Video.js + HLS.js), reset layer.
5. **GEOTOOLS** — kumpulan alat berat (lihat §3).
6. **GEOPANGAN / GEOTANI / GEOFARM** (di dalam GeoTools) — harga pangan PIHPS-BI & SP2KP-Kemendag (choropleth + grafik histori), analisis pertanian.

## 3. Fitur per modul GeoTools
- **GeoNusa**: pencarian wilayah berjenjang provinsi → kab/kota → kecamatan → desa, statistik + indikator penduduk.
- **GeoOSS**: pre-check zona peruntukan/RDTR ATR-BPN GISTARU sebelum ke OSS resmi (screening, bukan izin).
- **KKPR**: cari bidang tanah per NIB atau nama pemohon (WFS GISTARU ATR/BPN).
- **Cek NIB Tanah, SLS Desa BPS** (RT/RW/dusun), tutupan lahan 2020→2024, LBS & LSD, Land System BIG, jenis tanah HWSD v2.0 (FAO), data tanah ISRIC/SoilGrids.
- **GeoFarm**: gambar/unggah petak (SHP/GeoJSON) → analisis NDVI, NDMI, NDWI, NDRE, LST (Sentinel-2), kebutuhan air tanaman (Open-Meteo), kalkulator benih & pupuk, rekomendasi pupuk subsidi e-RDKK 2027, peta dasimetrik padi BPS, e-book Pertanian Press, database varietas (351 varietas), kamus pertanian ±5.605 istilah, hama/penyakit ±2.162, pestisida ±1.890 produk.
- **GeoData / Muat Data**: impor **SHP (.shp/.dbf/.shx/.prj/ZIP), GeoJSON/Esri JSON, GPX/KML, KMZ, Google Timeline JSON**, tambah layer dari **ArcGIS REST** dan **GeoServer WFS**, tabel atribut, animasi track GPX + export MP4.
- **Alat peta**: Draw (titik/garis/poligon/rectangle/circle), Measure jarak & luas, Cek Lokasi (koordinat → wilayah), Konverter Koordinat (DD/DMS/DMM/UTM, WGS84, proj4), Geoprocessing Turf.js (**Clip, Buffer, Intersect, Union, Merge, Dissolve**), Legenda, Tabel Atribut, Detail Administrasi saat peta diklik (reverse geocode).
- **Cetak/Export**: PDF peta (jsPDF + html2canvas, legenda/skala/koordinat otomatis), GeoTIFF (maks 4096 px, EPSG:3857), JPEG, SHP, GeoJSON, export citra satelit PNG berlegenda.

## 4. Layer & basemap
- Basemap (dari map-core.js): OpenStreetMap, Esri Satellite/World Imagery, Esri Dark Gray, Topo, Terrain, Street, Shaded Relief, Physical, NatGeo, Rupabumi BIG, Google Maps, Google Satellite, Peta Dasar ATR/BPN (WMS), Landsat Agriculture (Esri ImageServer), MODIS Terra/Aqua & VIIRS (NASA GIBS).
- Citra time-series dengan time slider: BMKG Himawari-9 & GK-2A (IR, Natural Color, Water Vapor, Rainfall, SST, Volcanic Ash), MODIS, VIIRS SNPP/NOAA-20, OCI PACE (klorofil, PAR), Sentinel-1 RTC, Sentinel-2, Landsat, EOX S2Cloudless, GSMaP hujan.
- Peta awal: pusat Surabaya (-7,2575; 112,7521), zoom 13, zoom 3–22, skala metrik.

## 5. Tech stack (terverifikasi dari tag script)
- Peta: **Leaflet 1.9.4** + MarkerCluster, LocateControl, Leaflet Draw, Esri-Leaflet, Protomaps-Leaflet, VectorGrid, leaflet-heat.
- Format/analisis: shpjs, @mapbox/shp-write, JSZip, GeoTIFF.js, toGeoJSON, **Turf.js 7**, proj4js, GeographicLib (luas geodesik).
- Media/grafik: Video.js + HLS.js (CCTV), Chart.js 4, jsPDF + html2canvas (cetak), jQuery + jsTree (pohon layer ArcGIS/GeoServer).
- Analitik/iklan: Google Tag Manager, GA4, AdSense. Auth gerbang fitur: Firebase Auth (Google login).

## 6. Cara membuat website seperti ini (arsitektur kloning yang benar)
1. **Fondasi (1–2 hari)**: GitHub Pages / Cloudflare Pages, 1 halaman Leaflet, basemap OSM+Esri+BIG, UI sidebar/bottom-sheet gelap.
2. **Data publik gratis (tanpa backend)**: BMKG open data (gempa & cuaca JSON), NASA GIBS WMTS (MODIS/VIIRS/Sentinel), BIG RBI/SatuPeta (WMS/WFS/ArcGIS REST), USGS gempa, Open-Meteo (cuaca titik), Nominatim (geocode/reverse).
3. **Alat klien**: Leaflet Draw + Turf.js (ukur, buffer/clip), shpjs + JSZip (impor SHP), toGeoJSON (GPX/KML), jsPDF (cetak).
4. **Modul bertahap**: GeoDisaster dulu (gempa+hotspot+cuaca paling berdampak), lalu GeoPortal, GeoFarm, GeoPangan, CCTV.
5. **Yang TIDAK bisa disalin mentah**: kode JS/CSS dan teks situs aslinya adalah karya pemiliknya — yang kita bangun adalah implementasi baru dengan fungsi setara dari sumber data publik yang sama. Itu yang dilakukan pada prototype di folder ini.

## 7. Prototype yang sudah dibuat untukmu
File `index.html` di folder ini — satu file, bisa langsung di-host di GitHub Pages:
menu GEONUSA/GEOPORTAL/GEODISASTER/GEOWATCH/GEOTOOLS, 10+ basemap, layer MODIS/VIIRS NASA, gempa BMKG live, cuaca Open-Meteo per klik, draw & ukur, impor GeoJSON/GPX/KML, geoprocessing buffer, konverter koordinat, kalkulator benih/pupuk, harga pangan + grafik, CCTV (daftar), Tanya Ruang (panel AI lokal), cetak PDF, export GeoJSON.
**Lebih dari aslinya di titik ini:** 1 file saja (asli 158 file JS), mode terang/gelap, slider opasitas layer, dan tanpa iklan/login untuk memakai alat dasar.

## 8. Update 16 Okt 2026 — Data wilayah lengkap + GeoOSS/KKPR
- **Data wilayah diganti dari contoh ke data lengkap asli**: API statis wilayah Indonesia v2 (Emsifa, sumber kode Kemendagri Kepmendagri 300.2.2-2138/2025; CORS terbuka, tanpa kunci). Terverifikasi live: `/stats.json` = 38 provinsi, 514 kab/kota, 7.285 kecamatan, 83.762 desa/kel, 10.632 kode pos, data per 11 Okt 2026. Rantai diuji ujung-ke-ujung: Jawa Timur → Kota Surabaya (38 kab/kota) → 31 kecamatan → Kec. Tegalsari → 5 kelurahan lengkap dengan kode pos. Catatan: total Kemendagri ini berbeda dari klaim BIG RBI situs acuan (541 kab/kota, 84.503 desa) karena sumbernya berbeda — keduanya ditampilkan apa adanya dengan label sumber.
- **Fitur wilayah baru**: cascade 4 level (prov → kab → kec → desa) lazy-load per level, kartu indikator (ibu kota, penduduk, luas, elevasi, zona waktu, kode pos, titik pusat), tombol **Gambar Batas** memakai endpoint polygon `/paths/{kode}.json` (terverifikasi HTTP 200 untuk prov & kab), **Download GeoJSON Batas**, terbang ke wilayah, reset.
- **Modul GEOOSS/KKPR baru** (tab sendiri): GeoOSS screening RDTR — pilih wilayah + kegiatan (autocomplete) + gambar area, lalu query intersect live ke layanan RDTR GISTARU ATR/BPN dengan batas tunggu 20 detik dan jalur proxy cadangan meniru pola situs acuan (`tres/proxy.ashx`); KKPR dua mode (per NIB / per nama pemohon) ke layer `KKPR_BERUSAHA` lalu fallback `KKPR_OSS_ALL` pada MapServer GISTARU; Cek NIB Tanah lewat WFS persil `atlas.atrbpn.go.id` (field NIB, PENGGUNAAN, TIPEHAK, LUAS, LUASPETA).
- **Keterbatasan terverifikasi jujur**: server GISTARU sangat lambat dari jaringan pengujian (root services tidak menjawab >60 detik; query KKPR kosong setelah ±10 detik). Karena itu modul menampilkan status tunggu/gagal secara transparan dan checklist manual — **tidak pernah mengarang hasil zona/NIB**. Untuk produksi stabil, pasang proxy CORS sendiri (Cloudflare Worker) seperti yang dilakukan situs acuan.

## 9. Update 16 Okt 2026 — Rombak UI (shell v2)
Diukur ulang dari CSS asli (palet terang bawaan `#ffffff`/slate, aksen `#0891b2`, kaca `rgba(255,255,255,.95)`, header sidebar gradasi radial+linear `#082f57→#0a6da9→#09849c`, sidebar 360px, search melayang 420×46px, quick bar di top 68px, sheet detail kanan 30vw, loading radial `#197db4→#06365f`), lalu shell prototype dirombak mengikuti struktur itu dengan implementasi CSS baru:
peta fullscreen; tema terang jadi bawaan (mode gelap = opsi, seperti aslinya); sidebar overlay kaca 360px yang **mulai tersembunyi** dan dibuka tombol ☰ (meniru class awal situs acuan); search & quick-layer bar melayang di tengah atas peta (quick bar kini memuat label item yang sama: Hotspot, Transjakarta, PM2.5, SST, Angin, Hujan, Boundaries, Radar, VIIRS, ECMWF Fire, Konsesi, Gambut, Sawit, Gunung Api, Pelabuhan, Perairan); panel detail jadi sheet kanan 30vw yang membuka saat peta diklik; skala di kiri bawah; kontrol zoom kanan bawah; layar loading + modal sambutan fitur.
Penilaian kemiripan UI setelah rombak: **±90%** (struktur, palet, posisi komponen). Sisa beda: ikon masih emoji (asli SVG), mark logo masih teks, di mobile alat belum bottom-sheet per fitur, dan detail mikro tipografi/pita warna kepala kartu belum per-komponen.
