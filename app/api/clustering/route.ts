import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { classifyScoreClusters } from '@/lib/kmedoids';
import type { RegionScoreData } from '@/lib/kmedoids';
// Triggering rebuild to pick up lib/kmedoids.ts changes
export type ClusteringMode = 'prevalence' | 'direct_risk' | 'prevention_risk' | 'maternal_risk' | 'environment_risk' | 'comprehensive_risk';

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
      // Feature Vector: [BBLR, 100-IMD, 100-ASI]
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
          const bblr = Math.min(100, Math.max(0, item.bblr_rate ?? 0));
          const imd = Math.min(100, Math.max(0, item.imd_rate ?? 0));
          const asi = Math.min(100, Math.max(0, item.asi_rate ?? 0));
          
          // Use multi-dimensional vector instead of simple average
          const score = [
            parseFloat(bblr.toFixed(2)), 
            parseFloat((100 - imd).toFixed(2)), 
            parseFloat((100 - asi).toFixed(2))
          ];
          return { regionName, score };
        })
        .filter((d) => d.regionName !== '');

    } else if (mode === 'prevention_risk') {
      // ── Mode: Faktor Risiko Pencegahan ──────────────────────────────────
      // Feature Vector: [100-IDL, 100-Vitamin A]
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
          
          // Use multi-dimensional vector
          const score = [
            parseFloat((100 - idl).toFixed(2)), 
            parseFloat((100 - vita).toFixed(2))
          ];
          return { regionName, score };
        })
        .filter((d) => d.regionName !== '');

    } else if (mode === 'maternal_risk') {
      // ── Mode: Faktor Risiko Ibu ───────────────────────────────────────
      // Feature Vector: [100-TTD, 100-Catin]
      const { data, error } = await supabase
        .from('stunting_factors')
        .select('ttd_rate, catin_rate, regions ( name )')
        .eq('year', year);

      if (error || !data?.length) {
        return NextResponse.json(
          { error: `Tidak ada data faktor risiko ibu untuk tahun ${year}` },
          { status: error ? 500 : 404 }
        );
      }

      clusterInput = data
        .map((item: any) => {
          const regionName = item.regions?.name ?? '';
          const ttd = Math.min(100, Math.max(0, item.ttd_rate ?? 0));
          const catin = Math.min(100, Math.max(0, item.catin_rate ?? 0));
          
          const score = [
            parseFloat((100 - ttd).toFixed(2)), 
            parseFloat((100 - catin).toFixed(2))
          ];
          return { regionName, score };
        })
        .filter((d) => d.regionName !== '');

    } else if (mode === 'environment_risk') {
      // ── Mode: Faktor Risiko Lingkungan ──────────────────────────────────
      // Feature Vector: [100-Jamban, 100-STBM]
      const { data, error } = await supabase
        .from('stunting_factors')
        .select('jamban_rate, stbm_rate, regions ( name )')
        .eq('year', year);

      if (error || !data?.length) {
        return NextResponse.json(
          { error: `Tidak ada data faktor risiko lingkungan untuk tahun ${year}` },
          { status: error ? 500 : 404 }
        );
      }

      clusterInput = data
        .map((item: any) => {
          const regionName = item.regions?.name ?? '';
          const jamban = Math.min(100, Math.max(0, item.jamban_rate ?? 0));
          const stbm = Math.min(100, Math.max(0, item.stbm_rate ?? 0));
          
          const score = [
            parseFloat((100 - jamban).toFixed(2)), 
            parseFloat((100 - stbm).toFixed(2))
          ];
          return { regionName, score };
        })
        .filter((d) => d.regionName !== '');

    } else if (mode === 'comprehensive_risk') {
      // ── Mode: Komprehensif (Semua Faktor + Prevalensi) ──────────────────────────
      const { data: stuntingData, error: stuntingError } = await supabase
        .from('stunting_data')
        .select('prevalence, region_id, regions ( name )')
        .eq('year', year);
        
      const { data: factorData, error: factorError } = await supabase
        .from('stunting_factors')
        .select('bblr_rate, imd_rate, asi_rate, idl_rate, vita_rate, ttd_rate, catin_rate, jamban_rate, stbm_rate, region_id')
        .eq('year', year);

      if (stuntingError || factorError || !stuntingData?.length || !factorData?.length) {
        return NextResponse.json(
          { error: `Tidak ada data komprehensif lengkap untuk tahun ${year}` },
          { status: 404 }
        );
      }

      const factorMap = new Map(factorData.map(f => [f.region_id, f]));

      clusterInput = stuntingData
        .map((item: any) => {
          const regionName = item.regions?.name ?? '';
          const factors = factorMap.get(item.region_id);
          
          if (!factors) return null;
          
          const prevalence = item.prevalence ?? 0;
          const bblr = Math.min(100, Math.max(0, factors.bblr_rate ?? 0));
          const imd = Math.min(100, Math.max(0, factors.imd_rate ?? 0));
          const asi = Math.min(100, Math.max(0, factors.asi_rate ?? 0));
          const idl = Math.min(100, Math.max(0, factors.idl_rate ?? 0));
          const vita = Math.min(100, Math.max(0, factors.vita_rate ?? 0));
          const ttd = Math.min(100, Math.max(0, factors.ttd_rate ?? 0));
          const catin = Math.min(100, Math.max(0, factors.catin_rate ?? 0));
          const jamban = Math.min(100, Math.max(0, factors.jamban_rate ?? 0));
          const stbm = Math.min(100, Math.max(0, factors.stbm_rate ?? 0));
          
          // 10-D Feature Vector
          const score = [
            parseFloat(prevalence.toFixed(2)),
            parseFloat(bblr.toFixed(2)), 
            parseFloat((100 - imd).toFixed(2)), 
            parseFloat((100 - asi).toFixed(2)),
            parseFloat((100 - idl).toFixed(2)), 
            parseFloat((100 - vita).toFixed(2)),
            parseFloat((100 - ttd).toFixed(2)), 
            parseFloat((100 - catin).toFixed(2)),
            parseFloat((100 - jamban).toFixed(2)), 
            parseFloat((100 - stbm).toFixed(2))
          ];
          return { regionName, score };
        })
        .filter((d: any) => d !== null && d.regionName !== '') as RegionScoreData[];

    } else {
      return NextResponse.json({ error: `Mode "${mode}" tidak dikenali` }, { status: 400 });
    }

    if (clusterInput.length === 0) {
      return NextResponse.json({ error: 'Tidak ada data valid untuk diklustering' }, { status: 404 });
    }

    const result = classifyScoreClusters(clusterInput);

    return NextResponse.json({ 
      success: true,
      year, 
      mode, 
      totalRegions: clusterInput.length, 
      ...result 
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      }
    });

  } catch (err) {
    console.error('[K-Medoids API] Unexpected error:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
