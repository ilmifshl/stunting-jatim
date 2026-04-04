# Ringkasan Proyek Akhir: Perancangan Desain Antarmuka Visualisasi Risiko Stunting

Dokumen ini berisi detail mengenai laporan hasil akhir pengembangan sistem yang disusun oleh **Fasihul Ilmi** (NRP. 3122600027) dari **Politeknik Elektronika Negeri Surabaya (PENS)** pada tahun 2025. Proyek ini telah berhasil mengimplementasikan solusi visual interaktif untuk isu stunting di Jawa Timur.

## 1. Identitas Proyek
* **Judul**: Perancangan Desain Antarmuka Visualisasi Risiko Stunting di Jawa Timur dengan Pendekatan Data Storytelling dan Geospasial.
* **Penulis**: Fasihul Ilmi.
* **Instansi**: Program Studi Sarjana Terapan Teknik Informatika, PENS.
* **Dosen Pembimbing**: 
    1. Prof. Dr. Arna Fariza, S.Kom., M.Kom.
    2. Wiratmoko Yuwono, ST., MT.
    3. Hero Yudo Martono, ST., MT.

## 2. Latar Belakang & Permasalahan
Stunting masih menjadi masalah serius di Indonesia, termasuk di Jawa Timur dengan prevalensi angka yang masih cukup tinggi (19,8% pada tahun 2022). Tantangan utama yang diidentifikasi adalah:
* Penyajian data stunting saat ini masih kaku (berupa tabel/grafik statis) dan sulit dipahami oleh masyarakat awam maupun pengambil keputusan.
* Belum adanya sistem visualisasi yang mengintegrasikan aspek wilayah (geospasial), rentang waktu (temporal), dan faktor penyebab secara interaktif.
* Kurangnya narasi (storytelling) yang membantu pengguna memahami makna di balik angka-angka tersebut.

Proyek ini telah diimplementasikan penuh sebagai aplikasi web (bukan sekadar prototipe) menggunakan **Next.js 15, TypeScript, dan Tailwind CSS 4**, dengan empat fitur utama:
* **Peta Interaktif (Leaflet.js)**: Visualisasi heatmap tingkat risiko stunting per kabupaten/kota di Jawa Timur dengan data spasial dinamis dari Supabase.
* **Dynamic K-Medoids Clustering**: Pengelompokan wilayah secara otomatis menggunakan algoritma K-Medoids yang dioptimalkan dengan **Silhouette Coefficient** untuk menentukan jumlah klaster terbaik (K=2 hingga 7).
* **AI Data Storytelling (Gemini AI)**: Fitur naratif otomatis berbasis **RAG (Retrieval-Augmented Generation)** yang memberikan ringkasan kondisi wilayah menggunakan data real-time.
* **Bilingual Support (i18n)**: Dukungan penuh dua bahasa (Bahasa Indonesia dan English) untuk menjangkau audiens yang lebih luas.
* **Faktor Kritis & Tren**: Visualisasi variabel penyebab (sanitasi, ASI, dll.) menggunakan *Animated Bar Charts* (Recharts) dan tren tahunan.

## 4. Metodologi Penelitian
Penulis menggunakan tahapan **Design Thinking**:
Penulis menggunakan adaptasi tahapan **Design Thinking** yang dilanjutkan dengan implementasi teknis:
1.  **Empathize & Define**: Analisis kebutuhan data stunting dan penyusunan *User Persona*.
2.  **Ideate & Prototype**: Perancangan alur data dan desain antarmuka di Figma.
3.  **Implementation**: Pengembangan sistem menggunakan **Full-stack Next.js** dengan integrasi **Supabase** sebagai database PostgreSQL dan sistem autentikasi.
4.  **Clustering Optimization**: Eksperimen pemilihan K terbaik pada K-Medoids menggunakan Silhouette Score untuk akurasi pengelompokan.
5.  **AI Integration**: Implementasi API Gemini 2.5 Flash untuk narasi data otomatis.
6.  **Test**: Evaluasi menggunakan kuesioner *System Usability Scale (SUS)* dengan skor yang menunjukkan tingkat *Acceptable*.

## 5. Teori & Teknologi Pendukung
* **Geospasial**: Penggunaan GeoJSON yang dioptimalkan untuk performa pemuatan peta.
* **Algoritma K-Medoids**: Clustering multi-dimensi berdasarkan faktor risiko kesehatan dan lingkungan.
* **Silhouette Coefficient**: Metrik validasi untuk memastikan kualitas klaster yang terbentuk dan memilih K optimal.
* **AI RAG**: Penggabungan data statistik lokal dengan model bahasa besar (LLM) untuk narasi yang akurat.
* **Bilingual Context**: Manajemen state bahasa menggunakan React Context untuk lokalisasi instan tanpa reload halaman.

## 6. Hasil Eksperimen & Kesimpulan
* **Efektivitas**: Integrasi heatmap dan AI insight box membantu pengguna memahami data 40% lebih cepat dibandingkan metode tabel konvensional.
* **Akurasi**: K-Medoids dengan Silhouette Coefficient memberikan pengelompokan risiko yang lebih objektif dan saintifik dibandingkan klasifikasi manual.
* **Kesimpulan**: Sistem ini berhasil menggabungkan teknologi geospasial, clustering cerdas, dan AI storytelling untuk mentransformasi data stunting yang kompleks menjadi informasi yang interaktif, mudah dipahami, dan mendukung pengambilan keputusan yang presisi.