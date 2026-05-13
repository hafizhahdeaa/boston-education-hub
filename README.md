# 🎓 Boston Education Hub

> **WebGIS Interaktif** untuk eksplorasi ekosistem pendidikan tinggi dan aksesibilitas transportasi publik di Kota Boston.

![Status](https://img.shields.io/badge/status-production-brightgreen)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9.4-199900)
![Turf.js](https://img.shields.io/badge/Turf.js-6.5.0-4B8BBE)
![Chart.js](https://img.shields.io/badge/Chart.js-4.4.0-FF6384)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 🌐 Live Demo

🔗 **[boston-education-hub.vercel.app](https://boston-education-hub.vercel.app)**

📦 **Repository:** [github.com/hafizhahdeaa/boston-education-hub](https://github.com/hafizhahdeaa/boston-education-hub)

---

## 📖 Tentang Proyek

Boston dikenal sebagai salah satu kota pendidikan terdepan di dunia, dengan julukan **"Athens of America"** karena konsentrasi institusi pendidikan tingginya yang luar biasa. Proyek ini mengeksplorasi pola spasial **39 universitas dan college** di Kota Boston, serta menganalisis seberapa baik mereka terhubung dengan sistem transportasi publik MBTA — sebuah pertanyaan kunci dalam perencanaan kota yang berkelanjutan dan equity pendidikan.

Aplikasi ini merupakan **Tugas 2 (Web GIS)** dari mata kuliah Kapita Selekta Sistem Informasi, dan merupakan kelanjutan dari Tugas 1 (Peta Tematik Statis) dengan wilayah studi dan tema yang konsisten.

---

## 📸 Screenshot
<img width="1920" height="1200" alt="Screenshot 2026-05-13 103726" src="https://github.com/user-attachments/assets/9e9e86db-6856-4eaf-9949-64a10854b859" />

<img width="1920" height="1200" alt="Screenshot 2026-05-13 103758" src="https://github.com/user-attachments/assets/37974f66-5a32-4f30-aa99-4784b2132a61" />

<img width="1920" height="1200" alt="Screenshot 2026-05-13 103840" src="https://github.com/user-attachments/assets/24a06f96-fbf4-45b7-9ab5-2885df3155c7" />

---

## ✨ Fitur Utama

### 🗺️ Visualisasi Peta
- ✅ Peta interaktif Leaflet berpusat di Kota Boston
- ✅ Circle markers untuk 39 institusi pendidikan tinggi, diberi warna berdasarkan kategori
- ✅ Stasiun MBTA dan 5 jalur rapid transit (Red, Blue, Green, Orange, Silver)
- ✅ Overlay batas administratif Kota Boston
- ✅ Popup terkustomisasi dengan detail universitas, kontak, website, dan link Wikipedia
- ✅ 3 pilihan basemap (OpenStreetMap, CartoDB Positron, CartoDB Dark Matter)

### 🔍 Pencarian & Filter
- ✅ Real-time search autocomplete dengan debounce (300ms)
- ✅ Filter kategori dengan checkbox (6 kategori universitas)
- ✅ Tombol Select All / Clear All untuk aksi cepat
- ✅ Markers fade smoothly saat filter diaplikasikan

### 📊 Dashboard Analitik
- ✅ Quick stats cards: total universitas, stasiun MBTA, % dalam buffer 500m
- ✅ Horizontal bar chart — universitas per kategori (Chart.js)
- ✅ Insights panel dinamis (auto-generated dari data)
- ✅ Semua statistik update secara real-time saat filter berubah

### 🎯 Analisis Spasial
- ✅ **Buffer Analysis 500m** — Turf.js generates accessibility zones di sekitar stasiun MBTA
- ✅ Universitas dalam buffer di-highlight dengan glow keemasan
- ✅ **Heatmap** — visualisasi kepadatan konsentrasi universitas (Leaflet.heat)

### 📱 Responsive Design
- ✅ Desktop: full 3-column layout
- ✅ Tablet (≤1024px): collapsible right panel
- ✅ Mobile (≤768px): hamburger menu, peta full-screen

### 💅 Polish
- ✅ Loading screen dengan branding crimson/gold
- ✅ Smooth CSS transitions (250ms cubic-bezier)
- ✅ About modal dengan detail proyek
- ✅ Animated counter pada stats cards

---

## 📊 Temuan Utama (Key Findings)

Berdasarkan analisis spasial yang dilakukan WebGIS ini:

1. **🎯 Aksesibilitas Tinggi:** 82% dari 39 universitas berada dalam radius 500 meter dari stasiun MBTA, menunjukkan Boston memiliki model "transit-oriented education" yang sangat baik.

2. **🚇 Green Line = "University Line":** Green Line melayani 23 universitas — terbanyak di antara semua jalur subway, termasuk Boston University, Northeastern, dan Boston College.

3. **🏛️ University Corridor:** Konsentrasi tertinggi institusi pendidikan ada di koridor utara Boston (Brighton → Fenway → Downtown), terlihat jelas dari visualisasi heatmap.

4. **⚖️ Ketimpangan Spasial:** Wilayah Boston Selatan (Dorchester, Mattapan, Hyde Park) memiliki jauh lebih sedikit institusi pendidikan tinggi, menimbulkan pertanyaan tentang equity dalam akses pendidikan.

---

## 🗺️ Wilayah Studi

**Boston, Massachusetts, USA**

Kota Boston memiliki luas sekitar 232 km² dengan populasi 675.000 jiwa. Sebagai ibu kota Massachusetts, Boston merupakan pusat ekonomi, pendidikan, dan kebudayaan di kawasan New England.

**Konsisten dengan Tugas 1** — wilayah dan tema yang sama digunakan untuk peta tematik statis dan WebGIS ini.

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| **Leaflet.js** | 1.9.4 | Peta interaktif |
| **Leaflet.heat** | 0.2.0 | Layer heatmap |
| **Turf.js** | 6.5.0 | Buffer analysis & spatial queries |
| **Chart.js** | 4.4.0 | Statistics charts |
| **Font Awesome** | 6.5.0 | Icons |
| **Google Fonts** | — | Playfair Display, Inter, JetBrains Mono |

> Semua library di-load via CDN — **zero build tools, zero npm dependencies**.

---

## 📂 Struktur Proyek

```
boston-education-hub/
├── index.html              # Halaman utama aplikasi
├── README.md               # Dokumentasi (file ini)
├── .gitignore
├── css/
│   └── style.css           # Stylesheet lengkap
├── js/
│   ├── config.js           # Konstanta & konfigurasi
│   ├── data-loader.js      # GeoJSON loading + EPSG:26986 reprojection
│   ├── map-init.js         # Setup Leaflet map
│   ├── layers.js           # Pembuatan layer, styling, popup
│   ├── controls.js         # UI controls (search, filter, toggles)
│   ├── analytics.js        # Statistics dashboard
│   ├── buffer.js           # Turf.js 500m buffer analysis
│   └── heatmap.js          # Setup Leaflet.heat
├── data/
│   ├── boston_boundary.geojson      # Batas Kota Boston
│   ├── colleges.geojson              # 39 institusi pendidikan tinggi
│   ├── mbta_stations.geojson         # Stasiun MBTA
│   └── mbta_lines.geojson            # Jalur MBTA Subway
└── assets/
    └── favicon.svg
```

---

## 📚 Sumber Data

| Dataset | Sumber | Tahun | Format |
|---------|--------|-------|--------|
| **Batas Kota Boston** | [City of Boston Open Data](https://data.boston.gov) | 2024 | GeoJSON (WGS84) |
| **Institusi Pendidikan Tinggi** | [MassGIS Colleges & Universities](https://www.mass.gov/info-details/massgis-data-colleges-and-universities) | November 2023 | GeoJSON (WGS84) |
| **MBTA Stations** | [MassGIS / MBTA](https://www.mass.gov/info-details/massgis-data-mbta-rapid-transit) | November 2025 | GeoJSON (EPSG:26986 → WGS84) |
| **MBTA Lines** | [MassGIS / MBTA](https://www.mass.gov/info-details/massgis-data-mbta-rapid-transit) | November 2025 | GeoJSON (EPSG:26986 → WGS84) |
| **Basemap** | © [OpenStreetMap Contributors](https://www.openstreetmap.org/copyright) | - | Tile XYZ |

> Data MBTA otomatis di-reproject dari Massachusetts State Plane (EPSG:26986) ke WGS84 saat load time.

**Pengolahan Data:**
- Data spasial di-clip ke batas administratif Kota Boston menggunakan QGIS
- Geometry validation dengan QGIS Fix Geometries
- Atribut universitas di-enrichment dengan Wikipedia URLs dan kategorisasi simplified
- Coordinate Reference System final: EPSG:4326 (WGS84)

---

## 🎨 Color Palette

Inspirasi dari identitas akademik Boston (Harvard & MIT):

| Kategori | Warna | Hex |
|----------|-------|-----|
| Research University | Harvard Crimson | `#A41E22` |
| Medical School | Purple | `#582C83` |
| State University | Navy Blue | `#00457C` |
| Liberal Arts College | Harvard Gold | `#C5A572` |
| Performing Arts | Pink | `#D63384` |
| Other Higher Education | Gray | `#6C757D` |

**MBTA Lines** menggunakan warna resmi MBTA untuk konsistensi dengan branding asli.

---

## 🚀 Cara Menjalankan Lokal

### Prasyarat
- Web browser modern (Chrome, Firefox, Edge, Safari)
- Local HTTP server (untuk menghindari CORS error saat load GeoJSON)

### Langkah-langkah

1. **Clone repository:**
   ```bash
   git clone https://github.com/hafizhahdeaa/boston-education-hub.git
   cd boston-education-hub
   ```

2. **Jalankan local server** (pilih salah satu cara):

   ```bash
   # Python
   python -m http.server 8000

   # Node.js
   npx serve .

   # VS Code Live Server extension — right-click index.html → Open with Live Server
   ```

3. **Buka di browser:**
   ```
   http://localhost:8000
   ```

---

## 🌐 Deploy ke Vercel

### Setup Otomatis

1. **Push project ke GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Boston Education Hub WebGIS"
   git branch -M main
   git remote add origin https://github.com/hafizhahdeaa/boston-education-hub.git
   git push -u origin main
   ```

2. **Connect ke Vercel:**
   - Login ke [vercel.com](https://vercel.com) dengan akun GitHub
   - Klik **Add New → Project**
   - Pilih repository `boston-education-hub`
   - Settings:
     - Framework Preset: **Other**
     - Build Command: *kosongkan*
     - Output Directory: *kosongkan*
   - Klik **Deploy**

3. **Akses URL:**
   - Vercel akan generate URL otomatis (misal: `boston-education-hub.vercel.app`)
   - Setiap push ke main branch akan trigger auto-deploy

---

## 📖 Kebijakan & Implikasi

WebGIS ini dapat digunakan oleh berbagai stakeholder:

- **🏛️ Pemerintah Kota:** Untuk perencanaan ekspansi transit dan pengembangan area pendidikan yang underserved
- **🎓 Calon Mahasiswa:** Eksplorasi pilihan universitas berdasarkan lokasi dan aksesibilitas transit
- **🏘️ Perencana Kota:** Analisis transit-oriented development (TOD) di sekitar institusi pendidikan
- **📊 Peneliti:** Studi pola spasial pendidikan tinggi dan urban planning

---

## 🔗 Tautan Terkait

- 📄 [Tugas 1 — Peta Tematik Statis (PDF)](#) *(link akan ditambahkan setelah diunggah)*
- 🎥 [Tugas 3 — Video Presentasi (YouTube)](#) *(link akan ditambahkan setelah diunggah)*
- 🌐 [Boston Education Hub — Live Demo](https://boston-education-hub.vercel.app)

---

## 👤 Penulis

**Hafizhah Dea Az Zahrah**

- 🎓 NIM: **1232002059**
- 📚 Program Studi: **Sistem Informasi**
- 🏛️ Institusi: **Universitas Bakrie**
- 📖 Mata Kuliah: **Kapita Selekta Sistem Informasi (SIF61)**
- 📅 Periode: **Mei 2026**

---

## 🙏 Acknowledgments

- **Universitas Bakrie** atas fasilitas dan pembelajaran
- **Dosen Pengampu** Kapita Selekta Sistem Informasi
- **City of Boston** dan **MassGIS** untuk open data yang berkualitas tinggi
- **OpenStreetMap community** atas basemap yang luar biasa
- **Komunitas Open Source** Leaflet, Turf.js, dan Chart.js

---

## 📄 Lisensi

Proyek ini menggunakan lisensi **MIT License** — bebas digunakan untuk tujuan edukasi dan non-komersial.

```
MIT License
Copyright (c) 2026 Hafizhah Dea Az Zahrah

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

<div align="center">

**🎓 Boston Education Hub** — Built with 💛 for Kapita Selekta Sistem Informasi

*Visualizing Education Equity Through Spatial Analysis*

</div>
