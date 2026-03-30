'use client';

import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { GeoJsonObject } from 'geojson';
import type { ClusterLabel } from '@/lib/kmedoids';

export type HeatmapMode = 'prevalence' | 'direct_risk' | 'prevention_risk';

export interface EastJavaMapProps {
  selectedRegion?: string;
  setSelectedRegion?: (name: string) => void;
  year?: number;
  searchQuery?: string;
  prevalenceFilters?: { tinggi: boolean; menengah: boolean; rendah: boolean };
  isMini?: boolean;
  /**
   * K-Medoids cluster assignment: maps region name → 'tinggi' | 'menengah' | 'rendah'.
   * Drives ALL coloring logic across all heatmap modes.
   * Pass `null` to show all regions as grey (no-data state).
   */
  clusterData?: Record<string, ClusterLabel> | null;
  /**
   * The actual numeric scores (prevalence or risk score) used for clustering.
   * Displayed in tooltips.
   */
  scores?: Record<string, number> | null;
  /** Active heatmap mode — determines tooltip label text only. Coloring is always from clusterData. */
  viewMode?: HeatmapMode;
}

export default function EastJavaMap({
  selectedRegion,
  setSelectedRegion,
  year = 2024,
  searchQuery = '',
  prevalenceFilters = { tinggi: true, menengah: true, rendah: true },
  isMini = false,
  clusterData = null,
  scores = null,
  viewMode = 'prevalence',
}: EastJavaMapProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isYearLoading, setIsYearLoading] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);

  const geometryCacheRef = useRef<Map<string, any>>(new Map());
  const stuntingCacheRef = useRef<Map<number, Map<string, { prevalence: number; stunting_cases: number }>>>(new Map());

  const center: [number, number] = [-7.5360639, 112.2384017];

  // Fetch GeoJSON once on mount
  useEffect(() => {
    const fetchGeometry = async () => {
      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from('regions').select('name, geojson');
        if (error || !data) throw error || new Error('No geometry data');
        data.forEach((item: any) => {
          let geometry = item.geojson;
          if (typeof geometry === 'string') { try { geometry = JSON.parse(geometry); } catch {} }
          geometryCacheRef.current.set(item.name, geometry?.geometry || geometry);
        });
        setDataVersion(v => v + 1);
      } catch (err) {
        console.error('Error fetching geometries:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGeometry();
  }, []);

  // Fetch stunting data per year (for tooltip prevalence values)
  useEffect(() => {
    if (isLoading || geometryCacheRef.current.size === 0) return;
    if (stuntingCacheRef.current.has(year)) return;

    const fetchStuntingData = async () => {
      setIsYearLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('stunting_data')
          .select('prevalence, stunting_cases, regions ( name )')
          .eq('year', year);
        if (error) throw error;

        const yearMap = new Map<string, { prevalence: number; stunting_cases: number }>();
        data?.forEach((item: any) => {
          const regionName = item.regions?.name;
          if (regionName) yearMap.set(regionName, { prevalence: item.prevalence, stunting_cases: item.stunting_cases });
        });
        stuntingCacheRef.current.set(year, yearMap);
        setDataVersion(v => v + 1);
      } catch (err) {
        console.error('Error fetching stunting data:', err);
      } finally {
        setIsYearLoading(false);
      }
    };
    fetchStuntingData();
  }, [year, isLoading]);

  // Derive GeoJSON features — coloring purely from K-Medoids clusterData
  const geoData = useMemo(() => {
    if (geometryCacheRef.current.size === 0) return null;
    const stuntingForYear = stuntingCacheRef.current.get(year);
    if (!stuntingForYear) return null;

    const features: any[] = [];
    geometryCacheRef.current.forEach((geometry, name) => {
      const stunting = stuntingForYear.get(name) || { prevalence: 0, stunting_cases: 0 };
      const clusterLabel = clusterData?.[name] ?? null;
      const score = scores?.[name] ?? null;

      const matchSearch = !searchQuery || name.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by tier checkboxes
      let matchFilter = !clusterLabel; // no-data regions always shown (grey)
      if (clusterLabel === 'tinggi' && prevalenceFilters.tinggi) matchFilter = true;
      else if (clusterLabel === 'menengah' && prevalenceFilters.menengah) matchFilter = true;
      else if (clusterLabel === 'rendah' && prevalenceFilters.rendah) matchFilter = true;

      if (matchSearch && matchFilter) {
        features.push({
          type: 'Feature',
          properties: { name, prevalence: stunting.prevalence, cases: stunting.stunting_cases, clusterLabel, score },
          geometry,
        });
      }
    });

    return { type: 'FeatureCollection', features } as GeoJsonObject;
  }, [year, searchQuery, prevalenceFilters, dataVersion, isLoading, clusterData, scores]);

  const CLUSTER_COLORS: Record<ClusterLabel, string> = {
    tinggi: '#ef4444',
    menengah: '#facc15',
    rendah: '#22c55e',
  };

  const getStyle = (feature: any) => {
    const isSelected = selectedRegion === feature.properties.name;
    const cluster: ClusterLabel | null = feature.properties.clusterLabel;
    const fillColor = cluster ? CLUSTER_COLORS[cluster] : '#94a3b8';
    return {
      fillColor,
      weight: isSelected ? 3 : 1,
      opacity: 1,
      color: isSelected ? '#2563eb' : 'white',
      fillOpacity: isSelected ? 0.85 : (cluster ? 0.65 : 0.35),
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    layer.on({
      mouseover: (e: any) => {
        if (selectedRegion !== feature.properties.name) {
          e.target.setStyle({ weight: 2, color: '#60a5fa', fillOpacity: 0.75 });
        }
      },
      mouseout: (e: any) => {
        if (selectedRegion !== feature.properties.name) {
          e.target.setStyle(getStyle(feature));
        }
      },
      click: () => {
        if (setSelectedRegion) setSelectedRegion(feature.properties.name);
      },
    });

    const { prevalence, score: scoreFromProps, clusterLabel } = feature.properties;
    // Fallback: if score is missing but we're in prevalence mode, use prevalence
    const actualScore = typeof scoreFromProps === 'number' 
      ? scoreFromProps 
      : (viewMode === 'prevalence' ? prevalence : null);

    const clusterBadge = clusterLabel ? ` &bull; <b class="capitalize">${clusterLabel}</b>` : '';

    let modeLabel = 'Prevalensi';
    let colorClass = 'text-blue-600';
    let unitTag = '%';

    if (viewMode === 'direct_risk') {
      modeLabel = 'Skor Risiko Langsung (K-Medoids)';
      colorClass = 'text-red-600';
      unitTag = '';
    } else if (viewMode === 'prevention_risk') {
      modeLabel = 'Skor Risiko Pencegahan (K-Medoids)';
      colorClass = 'text-orange-600';
      unitTag = '';
    }

    const mainText = `${modeLabel}: <b class="${colorClass}">${actualScore !== null ? actualScore.toFixed(2) + unitTag : 'Tidak ada data'}</b>${clusterBadge}`;

    layer.bindTooltip(`
      <div class="p-1.5 font-sans">
        <strong class="text-sm text-gray-900 block border-b pb-1 mb-1">${feature.properties.name} (${year})</strong>
        <span class="text-xs text-gray-600">${mainText}</span>
      </div>
    `, { sticky: true, className: 'rounded-lg border-none shadow-md bg-white/95 backdrop-blur-sm' });
  };

  return (
    <div className="w-full h-full relative z-10">
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-2 text-sm font-medium text-gray-600">Memuat Peta Jawa Timur...</p>
          </div>
        </div>
      )}
      {isYearLoading && !isLoading && (
        <div className="absolute top-4 right-4 z-50 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-blue-100 flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-blue-700">Memuat data {year}...</span>
        </div>
      )}
      <MapContainer
        center={center}
        zoom={isMini ? 8 : 9}
        scrollWheelZoom={!isMini}
        dragging={!isMini}
        touchZoom={!isMini}
        doubleClickZoom={!isMini}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {geoData && (
          <GeoJSON
            key={`${year}-${viewMode}-${searchQuery}-${prevalenceFilters.tinggi}-${prevalenceFilters.menengah}-${prevalenceFilters.rendah}-${selectedRegion || ''}-${dataVersion}-${clusterData ? 'kmedoids' : 'nodata'}`}
            data={geoData}
            style={getStyle}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>
    </div>
  );
}
