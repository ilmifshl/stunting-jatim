'use client';

import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { GeoJsonObject } from 'geojson';
import type { ClusterLabel } from '@/lib/kmedoids';

export interface EastJavaMapProps {
  selectedRegion?: string;
  setSelectedRegion?: (name: string) => void;
  year?: number;
  searchQuery?: string;
  prevalenceFilters?: { tinggi: boolean; menengah: boolean; rendah: boolean };
  isMini?: boolean;
  /**
   * K-Medoids cluster assignment: maps region name → 'tinggi' | 'menengah' | 'rendah'.
   * When provided, region coloring uses this data instead of hardcoded thresholds.
   * Pass `null` to fall back to hardcoded thresholds.
   */
  clusterData?: Record<string, ClusterLabel> | null;
}

export default function EastJavaMap({
  selectedRegion,
  setSelectedRegion,
  year = 2024,
  searchQuery = '',
  prevalenceFilters = { tinggi: true, menengah: true, rendah: true },
  isMini = false,
  clusterData = null,
}: EastJavaMapProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isYearLoading, setIsYearLoading] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);

  // Cache: region geometries (fetched once, never re-fetched)
  const geometryCacheRef = useRef<Map<string, any>>(new Map());
  // Cache: all stunting data indexed by year then region name
  const stuntingCacheRef = useRef<Map<number, Map<string, { prevalence: number; stunting_cases: number }>>>(new Map());

  const center: [number, number] = [-7.5360639, 112.2384017];

  // STEP 1: Fetch GeoJSON once on mount
  useEffect(() => {
    const fetchGeometry = async () => {
      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('regions')
          .select('name, geojson');

        if (error || !data) throw error || new Error('No geometry data');

        data.forEach((item: any) => {
          let geometry = item.geojson;
          if (typeof geometry === 'string') {
            try { geometry = JSON.parse(geometry); } catch {}
          }
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

  // STEP 2: Handle Data Fetching for Year
  useEffect(() => {
    if (isLoading || geometryCacheRef.current.size === 0) return;
    if (stuntingCacheRef.current.has(year)) return;

    const fetchStuntingData = async () => {
      setIsYearLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('stunting_data')
          .select(`prevalence, stunting_cases, regions ( name )`)
          .eq('year', year);

        if (error) throw error;

        const yearMap = new Map<string, { prevalence: number; stunting_cases: number }>();
        data?.forEach((item: any) => {
          const regionName = item.regions?.name;
          if (regionName) {
            yearMap.set(regionName, { prevalence: item.prevalence, stunting_cases: item.stunting_cases });
          }
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

  // STEP 3: Derived State — triggers re-render when clusterData or any filter changes
  const geoData = useMemo(() => {
    if (geometryCacheRef.current.size === 0) return null;

    const stuntingForYear = stuntingCacheRef.current.get(year);
    if (!stuntingForYear) return null;

    const features: any[] = [];
    geometryCacheRef.current.forEach((geometry, name) => {
      const stunting = stuntingForYear.get(name) || { prevalence: 0, stunting_cases: 0 };
      const prev = stunting.prevalence;

      const matchSearch = searchQuery ? name.toLowerCase().includes(searchQuery.toLowerCase()) : true;

      // Determine the cluster label for this region
      // Priority: K-Medoids clusterData → fallback to hardcoded thresholds
      let clusterLabel: ClusterLabel | null = null;
      if (clusterData && clusterData[name]) {
        clusterLabel = clusterData[name];
      } else if (prev > 0) {
        // Hardcoded fallback thresholds
        clusterLabel = prev > 20 ? 'tinggi' : prev >= 14 ? 'menengah' : 'rendah';
      }

      // Filter by prevalence tier checkbox
      let matchPrevalence = false;
      if (clusterLabel === 'tinggi' && prevalenceFilters.tinggi) matchPrevalence = true;
      else if (clusterLabel === 'menengah' && prevalenceFilters.menengah) matchPrevalence = true;
      else if (clusterLabel === 'rendah' && prevalenceFilters.rendah) matchPrevalence = true;
      else if (prev === 0) matchPrevalence = true; // No data: always visible (grey)

      if (matchSearch && matchPrevalence) {
        features.push({
          type: 'Feature',
          properties: { name, prevalence: stunting.prevalence, cases: stunting.stunting_cases, clusterLabel },
          geometry,
        });
      }
    });

    return { type: 'FeatureCollection', features } as GeoJsonObject;
  }, [year, searchQuery, prevalenceFilters, dataVersion, isLoading, clusterData]);

  const getStyle = (feature: any) => {
    const prevalence = feature.properties.prevalence;
    const cluster: ClusterLabel | null = feature.properties.clusterLabel;
    const isSelected = selectedRegion === feature.properties.name;

    if (prevalence === 0 || !cluster) {
      return {
        fillColor: '#94a3b8',
        weight: isSelected ? 3 : 1,
        opacity: 1,
        color: isSelected ? '#2563eb' : 'white',
        fillOpacity: isSelected ? 0.85 : 0.4,
      };
    }

    const fillColor =
      cluster === 'tinggi' ? '#ef4444' :
      cluster === 'menengah' ? '#facc15' :
      '#22c55e';

    return {
      fillColor,
      weight: isSelected ? 3 : 1,
      opacity: 1,
      color: isSelected ? '#2563eb' : 'white',
      fillOpacity: isSelected ? 0.85 : 0.65,
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    layer.on({
      mouseover: (e: any) => {
        const lyr = e.target;
        if (selectedRegion !== feature.properties.name) {
          lyr.setStyle({ weight: 2, color: '#60a5fa', fillOpacity: 0.75 });
        }
      },
      mouseout: (e: any) => {
        if (selectedRegion !== feature.properties.name) {
          e.target.setStyle(getStyle(feature));
        }
      },
      click: () => {
        if (setSelectedRegion) setSelectedRegion(feature.properties.name);
      }
    });

    const clusterBadge = feature.properties.clusterLabel
      ? ` &bull; <b class="capitalize">${feature.properties.clusterLabel}</b>`
      : '';

    layer.bindTooltip(`
      <div class="p-1.5 font-sans">
        <strong class="text-sm text-gray-900 block border-b pb-1 mb-1">${feature.properties.name} (${year})</strong>
        <span class="text-xs text-gray-600">Prevalensi: <b class="text-blue-600">${feature.properties.prevalence > 0 ? feature.properties.prevalence + '%' : 'Tidak ada data'}</b>${clusterBadge}</span>
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
            key={`${year}-${searchQuery}-${prevalenceFilters.tinggi}-${prevalenceFilters.menengah}-${prevalenceFilters.rendah}-${selectedRegion || ''}-${dataVersion}-${clusterData ? 'kmedoids' : 'fallback'}`}
            data={geoData}
            style={getStyle}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>
    </div>
  );
}
