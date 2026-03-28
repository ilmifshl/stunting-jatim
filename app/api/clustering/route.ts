import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { classifyPrevalenceClusters } from '@/lib/kmedoids';


export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const yearParam = searchParams.get('year');

  if (!yearParam) {
    return NextResponse.json({ error: 'Parameter "year" diperlukan' }, { status: 400 });
  }

  const year = parseInt(yearParam, 10);
  if (isNaN(year)) {
    return NextResponse.json({ error: 'Parameter "year" harus berupa angka' }, { status: 400 });
  }

  try {
    const supabase = await createClient();

    // Fetch all region names and their stunting prevalence for this year
    const { data, error } = await supabase
      .from('stunting_data')
      .select('prevalence, regions ( name )')
      .eq('year', year);

    if (error) {
      console.error('[K-Medoids API] Supabase error:', error);
      return NextResponse.json({ error: 'Gagal mengambil data dari database' }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: `Tidak ada data stunting untuk tahun ${year}` },
        { status: 404 }
      );
    }

    // Prepare input for the K-Medoids algorithm
    const clusterInput = data
      .map((item: any) => ({
        regionName: item.regions?.name ?? '',
        prevalence: item.prevalence ?? 0,
      }))
      .filter((d) => d.regionName !== '');

    // Run the K-Medoids clustering
    const result = classifyPrevalenceClusters(clusterInput);

    return NextResponse.json({
      year,
      totalRegions: clusterInput.length,
      ...result,
    });
  } catch (err) {
    console.error('[K-Medoids API] Unexpected error:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
