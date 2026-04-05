import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: NextRequest) {
  try {
    const { regionName, year, category, categoryData } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ error: 'API Key Gemini belum dikonfigurasi di server.' }, { status: 500 });
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
    const prevYearData = region.stunting_data.find((d: any) => d.year === year - 1);
    const currentFactors = region.stunting_factors.find((f: any) => f.year === year);

    if (!currentYearData) {
      return NextResponse.json({ error: `Data for year ${year} not found` }, { status: 404 });
    }

    // 2. Augment: Create the Prompt based on Mode (Global or Sectoral)
    let prompt = "";

    if (category && categoryData) {
      // Prompt khusus sektoral/kategori
      const factorList = categoryData.map((item: any) => `- ${item.label}: ${item.rate}% (${item.count} ${item.unit})`).join('\n');
      
      prompt = `
        Anda adalah seorang pakar teknis kesehatan masyarakat. 
        Tugas Anda adalah memberikan "Data Storytelling" singkat untuk kategori "${category}" di wilayah ${regionName} pada tahun ${year}.

        DATA KATEGORI ${category}:
        ${factorList}

        INSTRUKSI KHUSUS:
        - Jelaskan arti angka tersebut secara singkat (langsung inti insight).
        - JANGAN definisikan istilah medis (seperti apa itu anemia atau stunting).
        - Gunakan format **teks** (double asterisk) untuk menyoroti: angka persentase, tren (misal: **menurun tajam**, **naik signifikan**), kata peringatan kritikal, atau target yang belum tercapai.
        - Berikan minimal 3-4 highlight agar poin penting terlihat di UI.
        - JANGAN gunakan kalimat pembuka ("Sebagai pakar...", "Berikut adalah...").
        - STRUKTUR: Langsung ke temuan utama dan penyebabnya. MAKSIMAL 2-3 kalimat pendek.
      `;
    } else {
      // Prompt global (existing)
      prompt = `
        Anda adalah seorang ahli kesehatan masyarakat dan data storyteller yang membantu menjelaskan risiko stunting di Jawa Timur.
        Tugas Anda adalah menulis narasi pendek berbasis data untuk wilayah ${regionName} pada tahun ${year}.

        DATA STATISTIK:
        - Prevalensi Stunting Tahun ${year}: ${currentYearData.prevalence}%
        ${prevYearData ? `- Prevalensi Tahun ${year - 1}: ${prevYearData.prevalence}%` : ''}
        - Total Kasus Stunting: ${currentYearData.stunting_cases} anak

        FAKTOR RISIKO (DETERMINAN):
        - BBLR/Prematur: ${currentFactors?.bblr_rate || 'N/A'}%
        - ASI Eksklusif: ${currentFactors?.asi_rate || 'N/A'}%
        - Akses Jamban Sehat: ${currentFactors?.jamban_rate || 'N/A'}%
        - Imunisasi Dasar Lengkap: ${currentFactors?.idl_rate || 'N/A'}%
        - Layanan Kes. Catin: ${currentFactors?.catin_rate || 'N/A'}%

        INSTRUKSI PENULISAN:
        - Tulis narasi data yang sangat ringkas dan padat.
        - Gunakan format **teks** (double asterisk) untuk menyoroti: persentase, tren (misal: **meningkat**, **tetap rendah**), faktor paling kritis, atau saran tindakan mendesak. Berikan minimal 4-5 highlight strategis.
        - JANGAN gunakan kalimat pembuka/perkenalan (seperti "Sebagai ahli...").
        - JANGAN jelaskan definisi medis yang umum diketahui.
        - STRUKTUR: Temuan tren utama + Faktor dominan + 1 kalimat saran motivasi singkat.
        - MAKSIMAL 3-4 kalimat pendek. Pastikan pesan langsung tersampaikan (straight to the point).
      `;
    }

    // 3. Generate dengan Fallback Mechanism Berjenjang
    let result;
    const modelSequence = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-3.1-flash-lite'];
    let lastError: any = null;

    for (const modelName of modelSequence) {
      try {
        console.log(`[AI Storytelling] Mencoba menggunakan model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        result = await model.generateContent(prompt);
        if (result) break; // Berhasil
      } catch (err: any) {
        lastError = err;
        const errorMsg = err.message?.toLowerCase() || '';
        const isRateLimit = errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('limit');
        const isNotFound = errorMsg.includes('404') || errorMsg.includes('not found') || errorMsg.includes('unsupported');
        
        if (isRateLimit || isNotFound) {
          console.warn(`[AI Storytelling] Model ${modelName} ${isRateLimit ? 'terkena limit' : 'tidak tersedia'}, mencoba model fallback...`);
          continue; // Coba model berikutnya di sequence
        }
        // Jika error tipe lain (misal auth), lempar ke catch luar
        throw err;
      }
    }

    if (!result) {
      throw lastError || new Error('Semua model AI gagal menghasilkan respon.');
    }

    const responseText = result.response.text();
    return NextResponse.json({ story: responseText.trim() });

  } catch (error: any) {
    console.error('AI Storytelling Error:', error);
    return NextResponse.json({ 
      error: 'Gagal menghasilkan narasi AI',
      details: error.message || error.toString()
    }, { status: 500 });
  }
}
