import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

// ── Provider Clients ─────────────────────────────────────────────────────────
const groqApiKey = process.env.GROQ_API_KEY || '';
const geminiApiKey = process.env.GEMINI_API_KEY || '';

const groqClient = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

// ── Model Sequence (priority order) ──────────────────────────────────────────
// Option 1: Groq — Llama 3.3 70B / Llama 3.1 8B (fast & free-tier friendly)
// Option 2: Gemini — multiple model fallbacks
const MODEL_SEQUENCE = [
  { provider: 'groq',   model: 'llama-3.3-70b-versatile'    },
  { provider: 'groq',   model: 'llama-3.1-8b-instant'       },
  { provider: 'gemini', model: 'gemini-2.5-flash'            },
  { provider: 'gemini', model: 'gemini-2.5-flash-lite'       },
  { provider: 'gemini', model: 'gemini-1.5-flash'            },
];

async function generateWithGroq(model: string, systemInstruction: string, prompt: string) {
  if (!groqClient) throw new Error('Groq client not initialized — API key missing.');
  const response = await groqClient.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemInstruction },
      { role: 'user',   content: prompt },
    ],
    temperature: 0.7,
    top_p: 0.8,
    max_tokens: 512,
  });
  const text = response.choices[0]?.message?.content || '';
  const usage = {
    promptTokens:     response.usage?.prompt_tokens     ?? 0,
    completionTokens: response.usage?.completion_tokens ?? 0,
    totalTokens:      response.usage?.total_tokens      ?? 0,
  };
  return { text, usage };
}

async function generateWithGemini(model: string, systemInstruction: string, prompt: string) {
  if (!genAI) throw new Error('Gemini client not initialized — API key missing.');
  const geminiModel = genAI.getGenerativeModel({
    model,
    systemInstruction,
    generationConfig: { topP: 0.8 },
  });
  const result = await geminiModel.generateContent(prompt);
  const text = result.response.text();
  const meta = result.response.usageMetadata;
  const usage = {
    promptTokens:     meta?.promptTokenCount     ?? 0,
    completionTokens: meta?.candidatesTokenCount ?? 0,
    totalTokens:      meta?.totalTokenCount      ?? 0,
  };
  return { text, usage };
}

// ── Post-process: strip unclosed or malformed ** markers ─────────────────────
// Ensures raw asterisks never leak into the UI (safety net for smaller models).
function sanitizeHighlights(text: string): string {
  const parts = text.split('**');
  // parts.length is even → odd number of ** → one is unclosed → drop the last stray **
  if (parts.length % 2 === 0) {
    parts.pop();
    return parts.join('**');
  }
  return text;
}

export async function POST(req: NextRequest) {
  try {
    const { regionName, year, category, categoryData, selectedModel } = await req.json();

    if (!groqApiKey && !geminiApiKey) {
      return NextResponse.json({ error: 'Tidak ada API Key AI yang dikonfigurasi di server.' }, { status: 500 });
    }

    if (!regionName || !year) {
      return NextResponse.json({ error: 'Region and Year are required' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Fetch data for RAG
    const { data: region, error } = await supabase
      .from('regions')
      .select(`
        id,
        name,
        stunting_data (
          prevalence,
          stunting_cases,
          year
        ),
        stunting_factors (
          *
        )
      `)
      .eq('name', regionName)
      .single();

    if (error || !region) {
      return NextResponse.json({ error: 'Data not found' }, { status: 404 });
    }

    const currentYearData = region.stunting_data.find((d: any) => d.year === year);
    const prevYearData    = region.stunting_data.find((d: any) => d.year === year - 1);
    const currentFactors  = region.stunting_factors.find((f: any) => f.year === year);

    if (category !== 'yoy_trend' && !currentYearData) {
      return NextResponse.json({ error: `Data for year ${year} not found` }, { status: 404 });
    }

    // 2. Build prompt
    let prompt = '';
    let systemInstructionGemini = '';
    let systemInstructionGroq = '';

    if (category === 'yoy_trend' && categoryData) {
      const trendList = categoryData
        .map((item: any) => `- Tahun ${item.year}: Prevalensi ${item.prevalence}%, Kasus ${item.cases} anak. BBLR: ${item.bblr_rate}%, IMD: ${item.imd_rate}%, ASI Ekskl.: ${item.asi_rate}%, Imunisasi: ${item.idl_rate}%, Vit A: ${item.vita_rate}%, TTD: ${item.ttd_rate}%, Catin: ${item.catin_rate}%, Jamban Sehat: ${item.jamban_rate}%, Stop BABS: ${item.stbm_rate}%`)
        .join('\n');

      systemInstructionGemini = `Anda adalah seorang pakar analisis data kesehatan masyarakat.
      Tugas Anda adalah memberikan analisis storytelling tentang tren perkembangan stunting dan faktor-faktor determinan di wilayah tersebut secara historis (dari tahun ke tahun).

      INSTRUKSI KHUSUS:
      - Analisis bagaimana hubungan antara perubahan prevalensi stunting dengan perbaikan/penurunan indikator-indikator risiko (seperti BBLR, sanitasi/jamban, ASI eksklusif, dll.) sepanjang tahun yang tersedia.
      - Jelaskan temuan tren penting secara singkat (langsung ke inti insight).
      - Gunakan format **teks** (double asterisk) untuk menyoroti: tahun spesifik, angka persentase, tren (misal: **mengalami penurunan konsisten**, **meningkat secara perlahan**), dan faktor risiko dominan.
      - Berikan minimal 3-4 highlight agar poin penting terlihat di UI.
      - JANGAN gunakan kalimat pembuka ("Sebagai pakar...", "Berikut adalah...").
      - STRUKTUR: Langsung ke temuan utama tren historis dan implikasinya. MAKSIMAL 3-4 kalimat pendek.`;

      systemInstructionGroq = `Anda adalah seorang pakar analisis data kesehatan masyarakat yang menulis "Data Storytelling" tren multi-tahun untuk dashboard publik.

      GAYA PENULISAN YANG DIINGINKAN:
      Analisis bersifat interpretatif dan naratif. Jelaskan pola perbaikan atau penurunan indikator dari tahun ke tahun dan bagaimana hal itu mempengaruhi tingkat prevalensi stunting secara umum di wilayah tersebut. Akhiri dengan sintesis tentang efektivitas intervensi atau tantangan terbesar yang tersisa.

      ATURAN WAJIB:
      1. Tulis tepat 3-4 kalimat. Setiap kalimat pendek dan berdiri sendiri.
      2. DILARANG: bullet-points, sub-header, label seperti "Saran:", kalimat pembuka, definisi medis dasar.
      3. Kalimat terakhir HARUS berupa sintesis tren/evaluasi progres wilayah tersebut.
      4. Gunakan **teks** (double asterisk BUKA DAN TUTUP) untuk menyoroti: tahun, angka/persentase, tren kunci, atau indikator kritis (maksimal 5 kata per highlight).
      5. Minimal 3 highlight per output.`;

      prompt = `
        Buatkan analisis storytelling mengenai tren perkembangan stunting multi-tahun di wilayah ${regionName}.

        DATA HISTORIS MULTI-TAHUN:
        ${trendList}

        INGAT: Hubungkan bagaimana peningkatan/penurunan faktor risiko determinan mempengaruhi angka prevalensi stunting dari tahun ke tahun. Tulis 3-4 kalimat naratif yang padat. Kalimat terakhir adalah sintesis evaluasi progres wilayah tersebut.
      `;
    } else if (category && categoryData) {
      const factorList = categoryData
        .map((item: any) => `- ${item.label}: ${item.rate}% (${item.count} ${item.unit})`)
        .join('\n');

      systemInstructionGemini = `Anda adalah seorang pakar teknis kesehatan masyarakat.
      Tugas Anda adalah memberikan "Data Storytelling" singkat.

      INSTRUKSI KHUSUS:
      - Jelaskan arti angka tersebut secara singkat (langsung inti insight).
      - JANGAN definisikan istilah medis (seperti apa itu anemia atau stunting).
      - JANGAN PERNAH menyebut angka target nasional (misal: "target nasional 80%", "target 100%") kecuali angka tersebut secara EKSPLISIT ada di dalam data yang diberikan. Hanya gunakan data yang tersedia.
      - Gunakan format **teks** (double asterisk) untuk menyoroti: angka persentase, tren (misal: **menurun tajam**, **naik signifikan**), kata peringatan kritikal.
      - Berikan minimal 3-4 highlight agar poin penting terlihat di UI.
      - JANGAN gunakan kalimat pembuka ("Sebagai pakar...", "Berikut adalah...").
      - STRUKTUR: Langsung ke temuan utama dan penyebabnya. MAKSIMAL 2-3 kalimat pendek.`;

      systemInstructionGroq = `Anda adalah seorang pakar teknis kesehatan masyarakat yang menulis "Data Storytelling" untuk dashboard publik.

      GAYA PENULISAN YANG DIINGINKAN:
      Analisis bersifat interpretatif dan naratif — bukan sekedar membaca ulang angka. Hubungkan 2-3 indikator yang paling relevan, tunjukkan pola atau keterkaitan di antara mereka, dan akhiri dengan sintesis atau implikasinya terhadap risiko stunting.

      ATURAN WAJIB:
      1. Tulis 2-3 kalimat. Setiap kalimat pendek dan berdiri sendiri.
      2. DILARANG: bullet-points, sub-header, label seperti "Saran:", kalimat pembuka ("Sebagai pakar..."), definisi medis dasar.
      3. Kalimat terakhir HARUS berupa sintesis atau implikasi terhadap stunting (bukan hanya "diperlukan X secara intensif").
      4. DILARANG KERAS menyebut angka target nasional atau benchmark (misal: "target nasional 80%", "target 100%") kecuali angka tersebut SECARA EKSPLISIT ada di dalam data yang diberikan. Jangan mengarang angka target.
      5. JANGAN hanya memilih 1 angka lalu merekomendasikan "peningkatan intensif". Tunjukkan hubungan antar-indikator.

      ATURAN FORMAT HIGHLIGHT (SANGAT PENTING):
      - Gunakan **teks** (double asterisk BUKA DAN TUTUP) untuk: angka/persentase, atau frasa kunci 2-4 kata yang penting.
      - SATU highlight = MAKSIMAL 5 kata. DILARANG highlight seluruh klausa atau kalimat panjang.
      - Setiap ** WAJIB berpasangan. JANGAN tinggalkan ** yang tidak ditutup.
      - Minimal 3 highlight per output.

      CONTOH OUTPUT BAGUS (IKUTI GAYA INI):
      "Kasus BBLR/Prematur masih **4.7%** menunjukkan adanya **risiko biologis awal** kehidupan, sementara cakupan IMD baru **46.7%** menandakan praktik pemberian ASI dini belum optimal. Cakupan ASI Eksklusif **70.9%** sudah lebih baik, namun kombinasi IMD rendah dan risiko BBLR tetap menjadi **peringatan penting** dalam upaya percepatan penurunan stunting."

      CONTOH HIGHLIGHT SALAH — JANGAN LAKUKAN INI:
      "**Cakupan ASI Eksklusif yang masih 70.9% dan risiko BBLR sebesar 4.7%** menjadi..." (highlight terlalu panjang)
      "Prioritaskan **intervensi gizi untuk menekan..." (** tidak ditutup)
      "...masih di bawah target nasional **80%**..." (angka target tidak ada di data — DILARANG)`;

      prompt = `
        Buatkan narasi data untuk kategori "${category}" di wilayah ${regionName} pada tahun ${year}.

        DATA KATEGORI ${category}:
        ${factorList}

        PETUNJUK LOGIKA DATA (PENTING! JANGAN TERBALIK):
        - "KK SBS (Stop BABS)" atau "Open Defecation Free HH" adalah persentase KK yang SUDAH BEBAS berhenti buang air besar sembarangan (makin tinggi makin baik). Jika nilainya 22.19%, artinya BARU 22.19% yang Stop BABS, sisanya 77.81% MASIH BABS.
        - "Akses Jamban Sehat", "Cakupan IMD", "ASI Eksklusif", "Imunisasi Dasar Lengkap", "Vitamin A", "TTD 90 Tablet", dan "Layanan Kes. Catin" adalah indikator positif (semakin tinggi semakin baik).
        - "BBLR / Prematur" adalah indikator risiko negatif (semakin tinggi semakin buruk/berisiko stunting).

        INGAT: Hubungkan 2-3 indikator yang paling relevan. Tulis 2-3 kalimat naratif. Kalimat terakhir adalah sintesis atau implikasi terhadap risiko stunting — bukan hanya rekomendasi generik.
      `;
    } else {
      systemInstructionGemini = `Anda adalah seorang ahli kesehatan masyarakat dan data storyteller yang membantu menjelaskan risiko stunting di Jawa Timur.

      INSTRUKSI PENULISAN:
      - Tulis narasi data yang sangat ringkas dan padat.
      - Gunakan format **teks** (double asterisk) untuk menyoroti: persentase, tren (misal: **meningkat**, **tetap rendah**), faktor paling kritis, atau saran tindakan mendesak. Berikan minimal 4-5 highlight strategis.
      - JANGAN gunakan kalimat pembuka/perkenalan (seperti "Sebagai ahli...").
      - JANGAN jelaskan definisi medis yang umum diketahui.
      - STRUKTUR: Temuan tren utama + Faktor dominan + 1 kalimat saran motivasi singkat.
      - MAKSIMAL 3-4 kalimat pendek. Pastikan pesan langsung tersampaikan (straight to the point).`;

      systemInstructionGroq = `Anda adalah seorang ahli kesehatan masyarakat dan data storyteller yang membantu menjelaskan risiko stunting di Jawa Timur.

      ATURAN KETAT — WAJIB DIPATUHI:
      1. Tulis TEPAT 3 kalimat. Tidak kurang, tidak lebih.
      2. Setiap kalimat HARUS pendek dan berdiri sendiri. DILARANG run-on sentence.
      3. STRUKTUR WAJIB:
         - Kalimat 1: Tren prevalensi (naik/turun) dengan angka spesifik tahun ini vs tahun lalu.
         - Kalimat 2: Sorot HANYA 1-2 faktor paling kritis (bukan list semua faktor).
         - Kalimat 3: Rekomendasi aksi yang spesifik dan profesional.
      4. DILARANG: bullet-points, sub-header, label seperti "Saran Tindakan:", kalimat pembuka, definisi medis.

      ATURAN FORMAT HIGHLIGHT (SANGAT PENTING):
      - Gunakan **teks** (double asterisk buka DAN tutup) HANYA untuk angka, persentase, atau frasa 2-4 kata kunci.
      - SATU highlight = MAKSIMAL 5 kata. DILARANG meng-highlight seluruh klausa atau anak kalimat panjang.
      - Setiap ** WAJIB berpasangan: satu buka, satu tutup. JANGAN tinggalkan ** yang tidak ditutup.
      - Minimal 4 highlight.

      CONTOH HIGHLIGHT BENAR:
      "Prevalensi **meningkat menjadi 8.1%** pada 2024 dari **7.5%** tahun lalu, dengan **7017 anak** terdampak."
      (Setiap highlight: angka saja, atau 2-3 kata kunci. Pendek dan presisi.)

      CONTOH HIGHLIGHT SALAH — JANGAN LAKUKAN INI:
      "**Prevalensi stunting Kabupaten Kediri meningkat menjadi 8.1% pada 2024 dari 7.5% tahun sebelumnya, dengan total** 7017 anak" (highlight jauh terlalu panjang)
      "Prioritaskan **intervensi gizi spesifik untuk menekan laju..." (** tidak ditutup)

      OUTPUT FINAL YANG DIINGINKAN:
      "Prevalensi stunting Kabupaten Kediri **meningkat menjadi 8.1%** pada 2024 dari **7.5%** tahun lalu, dengan **7017 anak** terdampak. Cakupan ASI Eksklusif **70.9%** dan BBLR/Prematur **4.7%** menjadi faktor kunci yang perlu diintervensi. Prioritaskan **intervensi gizi** spesifik dan sensitif untuk menekan laju peningkatan stunting.`;

      prompt = `
        Tulis narasi pendek berbasis data untuk wilayah ${regionName} pada tahun ${year}.

        DATA STATISTIK:
        - Prevalensi Stunting Tahun ${year}: ${currentYearData?.prevalence ?? 0}%
        ${prevYearData ? `- Prevalensi Tahun ${year - 1}: ${prevYearData.prevalence}%` : ''}
        - Total Kasus Stunting: ${currentYearData?.stunting_cases ?? 0} anak

        FAKTOR RISIKO (DETERMINAN):
        - BBLR/Prematur: ${currentFactors?.bblr_rate || 'N/A'}%
        - ASI Eksklusif: ${currentFactors?.asi_rate || 'N/A'}%
        - Akses Jamban Sehat: ${currentFactors?.jamban_rate || 'N/A'}%
        - Imunisasi Dasar Lengkap: ${currentFactors?.idl_rate || 'N/A'}%
        - Layanan Kes. Catin: ${currentFactors?.catin_rate || 'N/A'}%

        PETUNJUK LOGIKA DATA:
        - "Akses Jamban Sehat", "ASI Eksklusif", "Imunisasi Dasar Lengkap", dan "Layanan Kes. Catin" adalah indikator positif (semakin tinggi semakin baik).
        - "BBLR/Prematur" adalah indikator risiko negatif (semakin tinggi semakin buruk).

        INGAT: Pilih 1-2 faktor paling kritis saja. Tulis 3 kalimat pendek sesuai struktur. Kalimat ke-3 adalah rekomendasi profesional.
      `;
    }

    // 3. Determine which models to attempt
    // If selectedModel is provided (format: "provider/model-name"), use only that model.
    // Otherwise, fall through the full MODEL_SEQUENCE.
    let modelsToTry = MODEL_SEQUENCE;
    if (selectedModel) {
      const slashIdx = selectedModel.indexOf('/');
      if (slashIdx !== -1) {
        const provider = selectedModel.slice(0, slashIdx);
        const model    = selectedModel.slice(slashIdx + 1);
        modelsToTry = [{ provider, model }];
      }
    }

    let responseText = '';
    let usedModel    = '';
    let tokenUsage   = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
    let lastError: any = null;

    for (const entry of modelsToTry) {
      try {
        console.log(`[AI Storytelling] Mencoba ${entry.provider} / ${entry.model}...`);

        let result: { text: string; usage: typeof tokenUsage };
        const activeSystemInstruction = entry.provider === 'groq' ? systemInstructionGroq : systemInstructionGemini;

        if (entry.provider === 'groq') {
          result = await generateWithGroq(entry.model, activeSystemInstruction, prompt);
        } else {
          result = await generateWithGemini(entry.model, activeSystemInstruction, prompt);
        }

        responseText = result.text;
        tokenUsage   = result.usage;
        usedModel    = `${entry.provider}/${entry.model}`;

        console.log(
          `[AI Storytelling] ✅ ${usedModel} | ` +
          `Prompt: ${tokenUsage.promptTokens} token | ` +
          `Completion: ${tokenUsage.completionTokens} token | ` +
          `Total: ${tokenUsage.totalTokens} token`
        );
        break; // success
      } catch (err: any) {
        lastError = err;
        console.warn(`[AI Storytelling] ❌ Gagal (${entry.provider}/${entry.model}): ${err.message}. Mencoba fallback...`);
      }
    }

    if (!responseText) {
      throw lastError || new Error('Semua model AI gagal menghasilkan respon.');
    }

    return NextResponse.json({
      story: sanitizeHighlights(responseText.trim()),
      usedModel,
      tokenUsage,
    });

  } catch (error: any) {
    console.error('AI Storytelling Error:', error);
    return NextResponse.json({
      error: 'Gagal menghasilkan narasi AI',
      details: error.message || error.toString(),
    }, { status: 500 });
  }
}

