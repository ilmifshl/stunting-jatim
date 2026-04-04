# Data Indikator Kesejahteraan dan Kesehatan Provinsi XYZ Tahun 2024
**Sumber:** BPS dan Dinas Kesehatan Provinsi XYZ (Data Simulasi)  
**Tahun Data:** 2024 | **Jumlah Kabupaten/Kota:** 12

---

## Deskripsi Variabel
Dokumen ini memuat matriks data multivariabel yang digunakan untuk pemetaan dan pengelompokan wilayah (Clustering) menggunakan algoritma K-Medoids. Terdapat 3 variabel risiko yang digunakan, di mana **semakin tinggi nilainya, semakin buruk kondisinya**:

1. **Variabel X (TPT):** Tingkat Pengangguran Terbuka (%). Mengukur risiko ekonomi mikro.
2. **Variabel Y (Stunting):** Prevalensi Balita Stunting (%). Mengukur risiko kesehatan kronis masa depan.
3. **Variabel Z (Kemiskinan):** Persentase Penduduk Miskin (%). Mengukur risiko kesejahteraan makro.

---

## Matriks Data Multivariabel (3 Dimensi)

| No | Kabupaten/Kota | X: Tingkat Pengangguran (%) | Y: Balita Stunting (%) | Z: Penduduk Miskin (%) |
|---|---|---|---|---|
| 1 | Kab. Alpha | 4.5 | 19.5 | 13.8 |
| 2 | Kab. Bravo | 5.1 | 16.2 | 9.5 |
| 3 | Kab. Charlie | 4.8 | 17.8 | 10.9 |
| 4 | Kab. Delta | 3.9 | 14.1 | 6.7 |
| 5 | Kab. Echo | 4.9 | 29.7 | 15.0 |
| 6 | Kab. Foxtrot | 6.1 | 38.2 | 18.5 |
| 7 | Kab. Golf | 5.8 | 40.1 | 21.6 |
| 8 | Kab. Hotel | 3.2 | 21.4 | 14.2 |
| 9 | Kota India | 7.2 | 4.5 | 4.3 |
| 10 | Kota Juliet | 6.8 | 8.9 | 4.2 |
| 11 | Kota Kilo | 4.2 | 11.2 | 7.1 |
| 12 | Kota Lima | 5.5 | 12.0 | 5.8 |

---

## Petunjuk Komputasi Jarak Manhattan (Multivariate)

Karena data ini memiliki 3 variabel (X, Y, Z), perhitungan jarak (Cost) antar daerah dengan Medoid menggunakan **Manhattan Distance 3 Dimensi**.

**Rumus:**
`Jarak = |X_Daerah - X_Medoid| + |Y_Daerah - Y_Medoid| + |Z_Daerah - Z_Medoid|`

**Contoh Perhitungan Manual:**
Jika **Kab. Alpha (4.5, 19.5, 13.8)** ingin diukur jaraknya ke Medoid **Kota India (7.2, 4.5, 4.3)**:
* Jarak X (Pengangguran) = |4.5 - 7.2| = 2.7
* Jarak Y (Stunting) = |19.5 - 4.5| = 15.0
* Jarak Z (Kemiskinan) = |13.8 - 4.3| = 9.5
* **Total Jarak Manhattan = 2.7 + 15.0 + 9.5 = 27.2**