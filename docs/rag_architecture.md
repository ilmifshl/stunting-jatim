# Arsitektur Retrieval-Augmented Generation (RAG) pada Fitur AI Storytelling

Dokumen ini menjelaskan implementasi teknis dari fitur AI Data Storytelling pada Sistem Visualisasi Risiko Stunting Provinsi Jawa Timur. Fitur ini menggunakan arsitektur **RAG (Retrieval-Augmented Generation)** bersama dengan model Large Language Model (LLM) dari Google (Gemini 2.5 Flash).

## 1. Definisi RAG dalam Konteks Sistem
Sering ada miskonsepsi bahwa RAG atau LLM adalah sebuah bahasa pemrograman, *library* khusus, atau *software* yang berjalan mandiri. Faktanya:
- **LLM (Large Language Model):** Adalah model *machine learning* berukuran raksasa yang dilatih untuk memprediksi probabilitas kata. Dalam sistem ini, kita menggunakan model **Gemini 2.5 Flash** yang diakses melalui API, sehingga kita tidak perlu menjalankan/meng-host model sebesar ber-gigabyte tersebut di dalam *server* aplikasi kita sendiri.
- **RAG:** Bukanlah sebuah *tools* bawaan, melainkan **sebuah arsitektur sistem (pola pengembangan perangkat lunak)**. RAG adalah teknik yang digunakan untuk memberikan konteks data pribadi/lokal kepada LLM, yang pada dasarnya tidak mengetahui fakta terbaru atau data spesifik dari *database* kita.

Tanpa RAG, jika kita meminta LLM menganalisis stunting di Sidoarjo tahun 2024, LLM akan berhalusinasi (menciptakan data palsu) karena data riwayat stunting sesungguhnya tersimpan secara privat di dalam *database* sistem (*Supabase*).

## 2. Alur Eksekusi RAG Secara Teknis
Implementasi RAG dalam sistem ini terjadi sepenuhnya secara *backend/server-side* pada *endpoint* API: `app/api/ai/storytelling/route.ts`. 

Alur eksekusinya terbagi menjadi tiga fase utama yang mendefinisikan singkatan RAG itu sendiri:

### Fase 1: Retrieval (Pencarian Data)
Sistem menerima parameter `regionName` dan `year` dari *client* (halaman peta interaktif). Sistem kemudian bertindak sebagai mekanisme *Retriever* dengan mengeksekusi *query* ke basis data (Supabase PostgreSQL) untuk mencari *ground truth* (fakta).

1. Sistem mencari baris data terkait `regionName`.
2. Sistem mengekstraksi metrik kuantitatif: `prevalence`, `stunting_cases`, prevalensi tahun sebelumnya.
3. Sistem mengekstraksi faktor deterministik: indikator kesehatan *(BBLR, ASI Eksklusif, Jamban Sehat, dll)*.

**Kode Implementasi:**
```typescript
const { data: region, error } = await supabase
  .from('regions')
  .select(`..., stunting_data (...), stunting_factors (*)`)
  .eq('name', regionName).single();
```

### Fase 2: Augmentation (Penggandaan Konteks)
Fakta numerik yang telah ditarik dari *database* (Fase 1) tidak bisa begitu saja dikirim ke LLM. Pada fase ini, sistem melakukan interpolasi data *(data-to-text interpolation)* dengan cara merakit string panjang yang disebut **Prompt**. 

*Prompt* ini di-augmentasi (diperkaya) secara *runtime* dengan menggabungkan instruksi (*system prompt/persona*) dan data spesifik (*context payload*). Proses inilah yang memaksa LLM untuk bekerja berdasarkan logika deterministik sistem, bukan berdasarkan *knowledge base* publik.

**Kode Implementasi:**
```typescript
const prompt = `
  Anda adalah seorang ahli kesehatan masyarakat...
  DATA STATISTIK:
  - Prevalensi Tahun ${year}: ${currentYearData.prevalence}%
  - BBLR: ${currentFactors?.bblr_rate}%...
  INSTRUKSI:
  - Berikan 1-2 kalimat narasi...
`;
```

### Fase 3: Generation (Generasi Teks)
Pada tahap akhir, *prompt* gabungan yang sudah di-augmentasi tersebut dikirim via HTTP *request* ke *server inference* Google menggunakan SDK `@google/generative-ai`. LLM memproses urutan *token* dari perintah yang dikunci (*constrained*) oleh konteks data stunting tersebut untuk menghasilkan interpretasi bahasa alami.

Algoritma RAG sistem ini memastikan adanya *Fallback Mechanism*, di mana jika model primer gagal memproses *(e.g. Model API deprecated)*, sistem akan berpindah ke model sekunder yang lebih stabil tanpa merusak *User Experience*.

**Kode Implementasi:**
```typescript
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
const result = await model.generateContent(prompt);
const responseText = result.response.text();
```

## 3. Tech Stack Fitur
- **Penyedia AI API Endpoint:** Google Generative AI API REST
- **SDK Integrasi:** `@google/generative-ai` (Node.js/Next.js Edge)
- **Model Primer:** `gemini-2.5-flash`
- **Context Source (Vector / DB):** Relational PostgreSQL DB (Supabase) via SQL Select. *(Catatan: karena konteks data cukup kecil/terstruktur, RAG dalam sistem ini tidak menggunakan Vector Database / Embedding, melainkan Direct Exact Match / Metadata Filtering).*
