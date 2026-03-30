# Panduan Kalkulasi Mode Heatmap: Faktor Risiko Langsung

Dokumen ini menjelaskan alur kerja, normalisasi data, dan rumus di balik mode visualisasi "Risiko Langsung" pada Peta Interaktif Sistem Manajemen Data Stunting Provinsi Jawa Timur.

## 1. Konsep Dasar
Peta Interaktif memiliki mode **Risiko Langsung**, di mana fokus visualisasi bukan lagi pada persentase jumlah balita stunting, tetapi pada 3 (tiga) determinan penentu yang berpengaruh paling awal terhadap kejadian stunting:
1. **BBLR (Berat Badan Lahir Rendah)** - *(Karakteristik: Negatif / Semakin besar angka, semakin buruk)*
2. **IMD (Inisiasi Menyusu Dini)** - *(Karakteristik: Positif / Semakin besar angka, semakin baik)*
3. **ASI Eksklusif** - *(Karakteristik: Positif / Semakin besar angka, semakin baik)*

## 2. Normalisasi Arah Indikator
Karena kita ingin menghasilkan **"Skor Risiko Komposit"** di mana **angka yang lebih tinggi berarti risiko stunting yang lebih besar**, maka semua nilai variabel yang sifat aslinya positif harus diinvers (dibalik) agar sejalan dengan tujuan "Skor Risiko".

Rumus inversi berlaku untuk variabel yang memakai format persen (%):
- **Nilai Risiko BBLR**: Tetap menggunakan nilai asli persentase BBLR (karena BBLR tinggi = risiko tinggi).
- **Nilai Risiko IMD**: `(100 - IMD_rate)` (Mencari persentase bayi yang *tidak* mendapatkan IMD).
- **Nilai Risiko ASI**: `(100 - ASI_rate)` (Mencari persentase bayi yang *tidak* mendapatkan ASI Eksklusif).

## 3. Kalkulasi Skor Risiko Komposit
Setelah ketiga komponen memiliki arah nilai yang sama (semakin tinggi persentase, semakin rentan/buruk), ketiganya dirata-ratakan untuk mendapatkan skor tunggal indikator risiko langsung (Skor Risiko Langsung) untuk tiap wilayah (Kota/Kabupaten).

**Rumus:**
```text
Skor Risiko Langsung = ( BBLR_rate + (100 - IMD_rate) + (100 - ASI_rate) ) / 3
```

**Penerapan di Kode (`app/(public)/map/page.tsx`):**
```ts
const bblr = item.bblr_rate || 0;
const imd = item.imd_rate || 0;
const asi = item.asi_rate || 0;

// Kalkulasi rata-rata skor risiko
const score = (bblr + (100 - imd) + (100 - asi)) / 3;
```

### Contoh Kasus (Data Dummy):
Di Kabupaten X:
- **BBLR**: 4.5%
- **Cakupan IMD**: 60.0%
- **Cakupan ASI Eksklusif**: 75.0%

Maka:
1. Risiko BBLR = `4.5`
2. Risiko tidak IMD = `100 - 60.0 = 40.0`
3. Risiko tidak ASI = `100 - 75.0 = 25.0`

`Skor Risiko Langsung = (4.5 + 40.0 + 25.0) / 3 = 69.5 / 3 = 23.16`

## 4. Kategorisasi dan Pewarnaan Peta (Thresholds)
Skor yang didapatkan (0 hingga 100) selanjutnya dibagi ke dalam 3 kelas diskrit untuk memudahkan identifikasi secara visual di dalam peta. 

Aturan batas (*thresholds*) yang digunakan dalam mode Risiko Langsung adalah sebagai berikut:

| Kategori | Syarat Skor Risiko | Warna Peta / HEX | Keterangan |
| :--- | :--- | :--- | :--- |
| **Sangat Rawan** | `> 40` | Merah (`#ef4444`) | Risiko langsung dari balita baru lahir sangat memprihatinkan. |
| **Cukup Rawan** | `>= 20 && <= 40` | Kuning (`#facc15`) | Masih memerlukan perhatian khusus pada intervensi persalinan/bayi. |
| **Aman** | `< 20` | Hijau (`#22c55e`) | Determinant kelahiran berada di level aman/terpantau baik. |

Pada contoh di atas, skor Kabupaten X adalah `23.16`, maka Kabupaten X akan diklasifikasikan ke dalam kategori **Cukup Rawan** dan diwarnai Kuning di peta interaktif.

## 5. Sinkronisasi UI (User Interface)
Saat *user* mengeklik tombol **Risiko Langsung**:
1. Map me-render ulang prop `key` untuk langsung merefleksikan mode fitur ke peta (`viewMode="direct_risk"`).
2. Data `factorDataMap` hasil renderan rumus rata-rata komposit di-passing sebagai props ke _Leaflet render_.
3. Legenda diubah menjadi `Skor Risiko Langsung` (> 40, 20-40, < 20).
4. Kotak menu ceklis (Sangat Rawan, Cukup Rawan, Aman) melakukan filtrasi peta sesuai *threshold* di atas, mengabaikan hasil klasifikasi K-Medoids yang dikhususkan pada Mode Prevalensi.
