import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { classifyScoreClusters } from '@/lib/kmedoids';
import type { RegionScoreData } from '@/lib/kmedoids';
// Triggering rebuild to pick up lib/kmedoids.ts changes
export type ClusteringMode = 'prevalence' | 'direct_risk';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const yearParam = searchParams.get('year');
  const mode = (searchParams.get('mode') ?? 'prevalence') as ClusteringMode;

  if (!yearParam) {
    return NextResponse.json({ error: 'Parameter "year" diperlukan' }, { status: 400 });
  }
  const year = parseInt(yearParam, 10);
  if (isNaN(year)) {
    return NextResponse.json({ error: 'Parameter "year" harus berupa angka' }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    let clusterInput: RegionScoreData[] = [];

    if (mode === 'prevalence') {
      // ── Mode: Prevalensi Stunting ───────────────────────────────────────
      const { data, error } = await supabase
        .from('stunting_data')
        .select('prevalence, regions ( name )')
        .eq('year', year);

      if (error || !data?.length) {
        return NextResponse.json(
          { error: `Tidak ada data stunting untuk tahun ${year}` },
          { status: error ? 500 : 404 }
        );
      }

      clusterInput = data
        .map((item: any) => ({ regionName: item.regions?.name ?? '', score: item.prevalence ?? 0 }))
        .filter((d) => d.regionName !== '');

    } else if (mode === 'direct_risk') {
      // ── Mode: Faktor Risiko Langsung ────────────────────────────────────
      // Skor = (BBLR_rate + (100 - IMD_rate) + (100 - ASI_rate)) / 3
      const { data, error } = await supabase
        .from('stunting_factors')
        .select('bblr_rate, imd_rate, asi_rate, regions ( name )')
        .eq('year', year);

      if (error || !data?.length) {
        return NextResponse.json(
          { error: `Tidak ada data faktor risiko untuk tahun ${year}` },
          { status: error ? 500 : 404 }
        );
      }

      clusterInput = data
        .map((item: any) => {
          const regionName = item.regions?.name ?? '';
          // Clamp rates to 0-100 to handle anomalous data points (e.g. 137%)
          const bblr = Math.min(100, Math.max(0, item.bblr_rate ?? 0));
          const imd = Math.min(100, Math.max(0, item.imd_rate ?? 0));
          const asi = Math.min(100, Math.max(0, item.asi_rate ?? 0));
          
          // Risk Score = (BBLR + (100 - IMD) + (100 - ASI)) / 3
          const rawScore = (bblr + (100 - imd) + (100 - asi)) / 3;
          const score = parseFloat(Math.max(0, rawScore).toFixed(4));
          return { regionName, score };
        })
        .filter((d) => d.regionName !== '');

    } else if (mode === 'prevention_risk') {
      // ── Mode: Faktor Risiko Pencegahan ──────────────────────────────────
      // Skor = ((100 - IDL) + (100 - Vitamin A)) / 2
      const { data, error } = await supabase
        .from('stunting_factors')
        .select('idl_rate, vita_rate, regions ( name )')
        .eq('year', year);

      if (error || !data?.length) {
        return NextResponse.json(
          { error: `Tidak ada data faktor pencegahan untuk tahun ${year}` },
          { status: error ? 500 : 404 }
        );
      }

      clusterInput = data
        .map((item: any) => {
          const regionName = item.regions?.name ?? '';
          const idl = Math.min(100, Math.max(0, item.idl_rate ?? 0));
          const vita = Math.min(100, Math.max(0, item.vita_rate ?? 0));
          
          // Risk Score = ((100 - idl) + (100 - vita)) / 2
          const rawScore = ((100 - idl) + (100 - vita)) / 2;
          const score = parseFloat(Math.max(0, rawScore).toFixed(4));
          return { regionName, score };
        })
        .filter((d) => d.regionName !== '');

    } else {
      return NextResponse.json({ error: `Mode "${mode}" tidak dikenali` }, { status: 400 });
    }

    if (clusterInput.length === 0) {
      return NextResponse.json({ error: 'Tidak ada data valid untuk diklustering' }, { status: 404 });
    }

    const result = classifyScoreClusters(clusterInput);

    return NextResponse.json({ year, mode, totalRegions: clusterInput.length, ...result });

  } catch (err) {
    console.error('[K-Medoids API] Unexpected error:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
