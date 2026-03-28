# Dokumentasi Algoritma K-Medoids dalam Visualisasi Stunting Jawa Timur

Dokumen ini menjelaskan secara teknis bagaimana metode **K-Medoids (PAM)** diimplementasikan untuk mengklasifikasikan tingkat prevalensi stunting secara dinamis dalam proyek ini.

---

## 1. Pendahuluan
Sebelumnya, sistem ini menggunakan ambang batas (threshold) statis untuk menentukan tingkat risiko stunting (misal: >20% Tinggi, 14-20% Menengah). Masalahnya, distribusi data prevalensi berubah setiap tahun. 

**K-Medoids** dipilih karena:
- **Adaptif**: Klasifikasi menyesuaikan dengan rentang data nyata pada tahun tersebut.
- **Robust**: Lebih tahan terhadap *outlier* (data ekstrem) dibandingkan K-Means.
- **Interpretabel**: Pusat *cluster* (medoid) adalah data nyata yang ada dalam database.

---

## 2. Mekanisme Algoritma (PAM - Partitioning Around Medoids)

Implementasi di proyek ini menggunakan algoritma **PAM**, yang bekerja dalam beberapa tahap:

### A. Inisialisasi
Sistem menentukan 3 titik awal sebagai medoid (pusat kelompok). Titik-titik ini diambil dari data prevalensi yang diurutkan untuk memastikan sebaran yang cukup luas antara kategori Rendah, Menengah, dan Tinggi.

### B. Iterasi Swap (Pertukaran)
1. **Assignment**: Setiap wilayah dimasukkan ke kelompok medoid terdekat (berdasarkan jarak absolut/Manhattan distance).
2. **Update**: Algoritma mencoba mengganti medoid saat ini dengan data lain ("candidate") dalam kelompok yang sama.
3. **Cost Calculation**: Jika penggantian tersebut menurunkan total jarak (membuat kelompok lebih rapat/akurat), maka medoid diperbarui.
4. Proses ini diulangi sampai tidak ada lagi perubahan signifikan (konvergen).

---

## 3. Penentuan Kategori & Threshold Dinamis

Setelah iterasi selesai, kita mendapatkan 3 kelompok dengan nilai pusat (medoid) masing-masing.

1. **Pelabelan**:
   - Cluster dengan medoid terkecil → **Rendah**
   - Cluster dengan medoid menengah → **Menengah**
   - Cluster dengan medoid terbesar → **Tinggi**

2. **Threshold (Batas) Dinamis**:
   Sistem menghitung batas (threshold) untuk legenda menggunakan titik tengah (*midpoint*) antar medoid.
   - **Batas Rendah-Menengah** = (Medoid Rendah + Medoid Menengah) / 2
   - **Batas Menengah-Tinggi** = (Medoid Menengah + Medoid Tinggi) / 2

---

## 4. Contoh Perhitungan Manual (Simulasi)

Misalkan kita memiliki data prevalensi (%) dari 6 wilayah: `[2, 4, 10, 12, 25, 30]`

### Langkah 1: Inisialisasi Medoid (k=3)
Misalkan terpilih: `M1=4` (Rendah), `M2=12` (Menengah), `M3=25` (Tinggi).

### Langkah 2: Assignment
- `2` lebih dekat ke `M1=4` (jarak 2) → **Cluster Rendah**
- `4` adalah `M1` → **Cluster Rendah**
- `10` lebih dekat ke `M2=12` (jarak 2) → **Cluster Menengah**
- `12` adalah `M2` → **Cluster Menengah**
- `25` adalah `M3` → **Cluster Tinggi**
- `30` lebih dekat ke `M3=25` (jarak 5) → **Cluster Tinggi**

### Langkah 3: Hasil Akhir
- **Cluster Rendah**: `{2, 4}`, Medoid = 4%
- **Cluster Menengah**: `{10, 12}`, Medoid = 12%
- **Cluster Tinggi**: `{25, 30}`, Medoid = 25%

### Langkah 4: Threshold untuk Legenda
- **Rendah Max**: (4 + 12) / 2 = **8%**
- **Menengah Max**: (12 + 25) / 2 = **18.5%**

**Hasil Legenda di UI:**
- Rendah: `< 8%`
- Menengah: `8% - 18.5%`
- Tinggi: `> 18.5%`

---

## 5. Implementasi Kode dalam Proyek

### 📂 `lib/kmedoids.ts`
Berisi logika murni algoritma PAM. Fungsi utama: `classifyPrevalenceClusters(data)`.
- Input: `[{ regionName: "Surabaya", prevalence: 15.2 }, ...]`
- Output: Mapping cluster dan threshold.

### 📂 `app/api/clustering/route.ts`
Endpoint API yang menjembatani database dan algoritma.
- Mengambil data dari tabel `stunting_data`.
- Menjalankan `kmedoids.ts` di sisi server.
- Mengirimkan hasil ke frontend.

### 📂 `app/(public)/map/page.tsx`
- Memanggil API setiap kali slider tahun digeser.
- Menampilkan nilai medoid dan threshold di panel filter dan legenda secara dinamis.

---

## Kesimpulan
Dengan K-Medoids, visualisasi tidak lagi dipaksa masuk ke angka yang kaku. Jika pada suatu tahun seluruh wilayah di Jawa Timur membaik (prevalensi rendah semua), algoritma akan tetap bisa membedakan mana wilayah yang "relatif lebih tinggi" dibanding wilayah lainnya secara objektif berdasarkan distribusi data tahun tersebut.
