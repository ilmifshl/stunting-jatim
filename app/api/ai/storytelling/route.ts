import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { regionName, year, category, categoryData } = await req.json();

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
        - Jelaskan apa arti angka-angka di atas dalam konteks pencegahan stunting.
        - Jika angka rendah (misal ASI < 50%), soroti sebagai "Peringatan".
        - Jika angka tinggi, berikan apresiasi singkat namun tetap waspada.
        - Jelaskan hubungan antar faktor di dalam kategori ini (jika ada).
        - Gunakan gaya bahasa yang profesional namun mudah dipahami orang awam.
        - Maksimal 3 kalimat. Langsung ke inti sarinya.
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
        - Gunakan Bahasa Indonesia yang ramah, informatif, dan tidak terlalu teknis.
        - Berikan 1-2 kalimat narasi tentang tren (naik/turun).
        - Soroti faktor risiko mana yang paling perlu diperhatikan berdasarkan angka di atas.
        - Akhiri dengan 1 kalimat saran motivasi untuk pemerintah daerah atau warga.
        - Maksimal 3-4 kalimat pendek. Jangan terlalu panjang.
      `;
    }

    // 3. Generate dengan Fallback Mechanism
    let result;
    try {
      // Coba model Generasi Kedua: Gemini 2.5 Flash yang tersedia di API Key ini
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      result = await model.generateContent(prompt);
    } catch (apiError: any) {
      if (apiError.message?.includes('404') || apiError.message?.includes('not found')) {
        console.warn('Gemini 2.5 Flash tidak tersedia, mencoba versi Pro...');
        // Coba model 2.5 pro sebagai cadangan
        const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
        result = await fallbackModel.generateContent(prompt);
      } else {
        throw apiError;
      }
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
