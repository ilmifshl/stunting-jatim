## Sistem Visualisasi Risiko Stunting Provinsi Jawa Timur

## 1. Overview

Sistem Visualisasi Risiko Stunting Provinsi Jawa Timur merupakan aplikasi web berbasis geospasial yang bertujuan untuk menyajikan informasi mengenai distribusi dan tren stunting di wilayah kabupaten/kota di Provinsi Jawa Timur secara interaktif. Sistem ini mengintegrasikan visualisasi spasial, analisis temporal, serta penyajian insight berbasis data untuk membantu pengguna memahami kondisi stunting dan faktor-faktor yang mempengaruhinya.

Sistem ini juga mengadopsi pendekatan data storytelling dalam menyajikan informasi risiko stunting. Pendekatan ini bertujuan untuk tidak hanya menampilkan data secara visual, tetapi juga membantu pengguna memahami makna di balik data secara cepat, intuitif, dan kontekstual.

Aplikasi ini memungkinkan pengguna untuk mengeksplorasi data stunting melalui peta interaktif, melihat tren perubahan dari tahun ke tahun, serta memahami faktor-faktor kritis yang berkaitan dengan tingkat stunting pada setiap wilayah.

Sistem dibangun menggunakan arsitektur **full-stack JavaScript** dengan **Next.js** sebagai framework utama dan **Supabase** sebagai backend service untuk database, autentikasi, dan manajemen data.

---

# 2. System Architecture

Sistem menggunakan arsitektur **full-stack web application** berbasis **Next.js** yang mengintegrasikan frontend, backend API, serta database dalam satu ekosistem.

### 2.1 Frontend

Frontend bertanggung jawab untuk menampilkan antarmuka pengguna dan visualisasi data.

Fungsi utama frontend:

- Menampilkan **peta interaktif Jawa Timur**
- Menampilkan **heatmap tingkat risiko stunting**
- Menyediakan **timeline eksplorasi data**
- Menampilkan **visualisasi faktor risiko**
- Menyediakan **navigasi halaman website**

Teknologi yang digunakan:

- Next.js (React Framework)
- React
- Leaflet / Mapbox / MapLibre (untuk peta interaktif)
- Chart.js / Recharts / ECharts (visualisasi data)
- Tailwind CSS (styling)
- TypeScript (optional tetapi direkomendasikan)

---

### 2.2 Backend

Backend menangani pengolahan data, komunikasi dengan database, serta pengelolaan autentikasi admin.

Fungsi utama backend:

- Mengelola API untuk pengambilan data stunting
- Mengelola autentikasi admin
- Menyimpan dan memperbarui data stunting
- Menyimpan data faktor risiko
- Menyimpan artikel informasi

Teknologi yang digunakan:

- Next.js API Routes
- Supabase Client
- Supabase Auth

---

### 2.3 Database

Database digunakan untuk menyimpan seluruh data terkait stunting, faktor risiko, serta artikel informasi.

Database yang digunakan:

- **Supabase PostgreSQL**

Jenis data yang disimpan:

- Data stunting per wilayah
- Data faktor risiko stunting
- Data artikel
- Data admin

---

# 3. User Roles

Sistem memiliki dua jenis pengguna utama.

## 3.1 User (Public User)

User adalah pengguna umum yang tidak memerlukan proses login untuk mengakses sistem.

Hak akses user:

- Mengakses halaman beranda
- Melihat peta interaktif
- Melihat data stunting pada setiap wilayah
- Menggunakan timeline data
- Melihat insight data
- Melihat faktor risiko
- Membaca artikel terkait stunting

---

## 3.2 Admin

Admin merupakan pengguna yang memiliki hak akses untuk mengelola data dalam sistem.

Admin harus melakukan **login terlebih dahulu** untuk mengakses halaman admin.

Hak akses admin:

- Mengakses semua fitur user
- Mengakses dashboard admin
- Menambahkan data stunting
- Mengubah data stunting
- Menghapus data stunting
- Menambahkan data faktor risiko
- Mengubah data faktor risiko
- Mengelola artikel

---

# 4. Core Features

## 4.1 Interactive Map (Peta Interaktif)

Peta interaktif berfungsi sebagai visualisasi spasial untuk menunjukkan distribusi tingkat risiko stunting di wilayah kabupaten/kota di Provinsi Jawa Timur.

Fitur utama:

- Menampilkan peta wilayah Jawa Timur
- Setiap wilayah memiliki **warna berdasarkan tingkat risiko**
- Hover pada wilayah menampilkan **ringkasan data**
- Klik pada wilayah menampilkan **detail data**

Data yang ditampilkan:

- Nama wilayah
- Jumlah anak stunting
- Prevalensi stunting
- Tren perubahan

---

## 4.2 Timeline Data

Timeline Data memungkinkan pengguna untuk mengeksplorasi perubahan tingkat stunting dari waktu ke waktu.

Fitur utama:

- Slider pemilihan tahun
- Grafik tren perubahan stunting
- Update peta berdasarkan tahun yang dipilih

Data yang digunakan:

- Data tahunan dari **Profil Kesehatan Jawa Timur**

---

## 4.3 Insight Box

Insight Box merupakan komponen utama data storytelling yang menyajikan interpretasi data dalam bentuk teks ringkas.

Fungsi utama:

- Menyoroti informasi penting dari data
- Memberikan konteks terhadap perubahan data
- Mendukung pendekatan **data storytelling**

Requirement:

- Sistem harus mampu menampilkan insight otomatis berdasarkan data
Insight ditulis dalam bentuk kalimat sederhana dan informatif
Insight harus menyoroti:
Tren kenaikan atau penurunan
Wilayah dengan nilai ekstrem (tertinggi/terendah)
Perubahan signifikan antar tahun

Contoh format:

“Kabupaten X mengalami penurunan sebesar Y% dalam 2 tahun terakhir”
“Kota Y memiliki tingkat stunting tertinggi pada tahun Z”

---

## 4.4 Critical Factors

Fitur ini menampilkan faktor-faktor utama yang berkontribusi terhadap tingkat stunting pada suatu wilayah.

Visualisasi yang digunakan:

- Radar Chart
- Bar Chart

Variabel yang dapat ditampilkan:

- Akses air bersih
- Sanitasi
- Pendidikan ibu
- Status gizi anak
- Akses layanan kesehatan

Fungsi utama:

- Membantu memahami **penyebab risiko stunting**
- Mendukung analisis prioritas intervensi

---

## 4.5 Home Page

Halaman beranda berfungsi sebagai pengantar sistem dan memberikan informasi awal kepada pengguna.

Konten utama:

- Ringkasan sistem
- Statistik singkat stunting Jawa Timur
- Highlight wilayah prioritas
- Artikel terkait stunting

---

## 4.6 Article Page

Halaman artikel menyediakan informasi edukatif terkait stunting.

Fitur utama:

- Daftar artikel
- Detail artikel
- Kategori artikel

---

# 5. Admin Features

## 5.1 Admin Dashboard

Halaman utama untuk pengelolaan data oleh admin.

Fungsi:

- Melihat ringkasan data
- Navigasi ke halaman manajemen data

---

## 5.2 Stunting Data Management

Admin dapat melakukan:

- Menambah data stunting
- Mengubah data stunting
- Menghapus data stunting

Data yang dikelola:

- Wilayah
- Tahun
- Jumlah anak stunting
- Prevalensi

---

## 5.3 Risk Factor Management

Admin dapat:

- Menambah data faktor risiko
- Mengubah data
- Menghapus data

Variabel yang dapat dikelola:

- Sanitasi
- Akses air bersih
- Pendidikan ibu
- Status gizi

---

## 5.4 Article Management

Admin dapat:

- Menambah artikel
- Mengedit artikel
- Menghapus artikel

Data artikel:

- Judul
- Isi artikel
- Gambar
- Tanggal publikasi

---

# 6. Database Requirements

Berikut adalah tabel utama yang diperlukan dalam sistem.

## 6.1 Regions

|Field|Type|Description|
|---|---|---|
|id|uuid|Primary key|
|name|text|Nama kabupaten/kota|
|geojson|jsonb|Data geospasial wilayah|

---

## 6.2 Stunting Data

|Field|Type|Description|
|---|---|---|
|id|uuid|Primary key|
|region_id|uuid|Relasi ke regions|
|year|integer|Tahun data|
|stunting_cases|integer|Jumlah anak stunting|
|prevalence|float|Persentase prevalensi|

---

## 6.3 Risk Factors

|Field|Type|Description|
|---|---|---|
|id|uuid|Primary key|
|region_id|uuid|Relasi wilayah|
|year|integer|Tahun|
|sanitation|float|Indeks sanitasi|
|clean_water|float|Akses air bersih|
|mother_education|float|Pendidikan ibu|
|nutrition_status|float|Status gizi|

---

## 6.4 Articles

|Field|Type|Description|
|---|---|---|
|id|uuid|Primary key|
|title|text|Judul artikel|
|content|text|Isi artikel|
|image_url|text|Gambar artikel|
|created_at|timestamp|Tanggal publikasi|

---

## 6.5 Admin Users

|Field|Type|Description|
|---|---|---|
|id|uuid|Primary key|
|email|text|Email admin|
|password|text|Password|
|role|text|Role pengguna|

---

# 7. Non-Functional Requirements

## 7.1 Performance

- Sistem harus mampu memuat peta dalam waktu kurang dari **3 detik**.
- Query database harus dioptimalkan untuk menghindari loading yang lambat.

---

## 7.2 Usability

- Antarmuka harus mudah dipahami oleh pengguna non-teknis.
- Navigasi antar halaman harus sederhana dan konsisten.

---

## 7.3 Security

- Admin harus menggunakan sistem autentikasi.
- Endpoint API untuk pengelolaan data harus dilindungi.

---

## 7.4 Scalability

- Sistem harus mampu menangani penambahan data tahunan di masa depan.
- Struktur database harus mendukung ekspansi data wilayah atau indikator.

---

# 8. Tech Stack

Frontend:

- Next.js
- React
- Tailwind CSS
- Chart.js / Recharts

Backend:

- Next.js API Routes
- Supabase

Database:

- Supabase PostgreSQL

Deployment:

- Vercel (frontend + backend)
- Supabase Cloud

# 9. Data Storytelling
UX Writing Requirements

Agar storytelling efektif, teks dalam sistem harus memenuhi kriteria berikut:

- Menggunakan bahasa yang sederhana
- Tidak terlalu teknis
- Fokus pada insight, bukan angka mentah
- Menggunakan kalimat aktif dan jelas

