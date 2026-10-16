# RUANG KITA+ — Prototype

- `BEDAH_RUANGKITA.md` — hasil bedah menyeluruh ruangkita.net (menu, fitur, layer, stack, sumber data).
- `index.html` — prototype 1 file, fungsi setara inti situs acuan, implementasi baru.

## Cara pakai / deploy (sama seperti aslinya: GitHub Pages)
1. Buat repo GitHub baru, upload `index.html` ini.
2. Settings → Pages → Deploy from branch `main` / root.
3. Selesai — situs live tanpa server, tanpa biaya hosting.

## Sudah dilengkapi (update 16 Okt 2026)
- ✅ Data wilayah LENGKAP: cascade provinsi → kab/kota → kecamatan → desa (38/514/7.285/83.762, kode Kemendagri 2025 via API statis Emsifa v2), indikator wilayah, gambar batas polygon, download GeoJSON batas.
- ✅ Modul GEOOSS/KKPR: screening RDTR, cari KKPR per NIB/nama, cek NIB tanah — semua query live ke GISTARU ATR/BPN dengan status transparan (server GISTARU lambat; untuk produksi pasang proxy CORS Cloudflare Worker).

## Pengembangan berikutnya (sesuai bedah §6)
- Hubungkan GeoPangan ke PIHPS BI & SP2KP Kemendag, CCTV ke stream HLS Dishub/pemda setempat.
- Tambah time-slider citra BMKG Himawari-9/GK-2A.
