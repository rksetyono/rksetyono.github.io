# SIGAP JUWATA — Sistem Informasi Geospasial & Cuaca

Portal peta prototype **Stasiun Meteorologi Juwata Tarakan (BMKG)** — live di https://rksetyono.github.io/

- `index.html` — aplikasi 1 file (Leaflet): peta fokus Tarakan/Bandara Juwata, panel Gempa & Cuaca BMKG, peringatan dini, data wilayah Kemendagri se-Indonesia, citra satelit NASA GIBS, GeoPortal basemap BIG, GeoDisaster, GeoTools.
- `BEDAH_RUANGKITA.md` — arsip hasil bedah situs acuan ruangkita.net (menu, fitur, stack, sumber data) yang menjadi referensi awal pembangunan.

## Deploy (GitHub Pages, tanpa server)
Repo `rksetyono/rksetyono.github.io`, branch `main`, root — setiap push ke `index.html` otomatis live ±1 menit.

## Riwayat arah
- Berawal sebagai prototype fungsi-setara situs acuan, lalu di-rebrand total menjadi SIGAP JUWATA (16 Okt 2026) untuk kantor Stasiun Meteorologi Juwata Tarakan.
- Menu yang tidak berkaitan dengan tugas BMKG Juwata telah DIHAPUS: GEOOSS/KKPR, GEOWATCH (CCTV contoh), GEOFARM, GEOPANGAN, kartu GeoTrans/Transjakarta, chip Sawit. Cadangan versi sebelumnya: `index.html.bak-pre-sigap` (lokal).
- Cuaca bawaan mengikuti Kel. Karang Anyar Pantai, Kota Tarakan (adm4 65.71.01.1003 — wilayah Bandara Juwata); pusat peta awal di Bandara Juwata (3.3270, 117.5683).

## Catatan data
- Gempa: data.bmkg.go.id (live). Cuaca: API publik BMKG per adm4, fallback Open-Meteo berlabel bila API tak terjangkau.
- Wilayah: API statis Emsifa v2 (kode Kemendagri, Kepmendagri 300.2.2-2138/2025).
