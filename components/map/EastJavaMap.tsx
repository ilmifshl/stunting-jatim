import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { getCachedGeometry, setCachedGeometry } from '@/utils/db-cache';
import type { GeoJsonObject } from 'geojson';
import type { ClusterMeta } from '@/lib/kmedoids';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export type HeatmapMode = 'prevalence' | 'direct_risk' | 'prevention_risk' | 'maternal_risk' | 'environment_risk' | 'comprehensive_risk';

export interface EastJavaMapProps {
  selectedRegion?: string;
  setSelectedRegion?: (name: string) => void;
  year?: number;
  searchQuery?: string;
  /** Map of cluster ID -> boolean */
  clusterFilters?: Record<string, boolean>;
  isMini?: boolean;
  /**
   * K-Medoids cluster assignment: maps region name → cluster ID (string).
   */
  clusterData?: Record<string, string> | null;
  /**
   * Metadata for each cluster (labels, colors, etc.)
   */
  clusterMeta?: ClusterMeta[] | null;
  /**
   * The actual numeric scores (prevalence or risk score vector) used for clustering.
   * Displayed in tooltips.
   */
  scores?: Record<string, number | number[]> | null;
  /** Active heatmap mode — determines tooltip label text only. Coloring is always from clusterData. */
  viewMode?: HeatmapMode;
}

export default function EastJavaMap({
  selectedRegion,
  setSelectedRegion,
  year = 2024,
  searchQuery = '',
  clusterFilters = {},
  isMini = false,
  clusterData = null,
  clusterMeta = null,
  scores = null,
  viewMode = 'prevalence',
}: EastJavaMapProps) {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [isYearLoading, setIsYearLoading] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);

  const geometryCacheRef = useRef<Map<string, any>>(new Map());
  const stuntingCacheRef = useRef<Map<number, Map<string, { prevalence: number; stunting_cases: number }>>>(new Map());
  const selectedRegionRef = useRef(selectedRegion);
  const geoJsonRef = useRef<any>(null);

  useEffect(() => {
    selectedRegionRef.current = selectedRegion;
  }, [selectedRegion]);

  const center: [number, number] = [-7.5360639, 112.2384017];

  // Fetch GeoJSON once on mount
  useEffect(() => {
    const fetchGeometry = async () => {
      const startTime = performance.now();
      setIsLoading(true);

      try {
        const cached = await getCachedGeometry('east-java-geometries');
        if (cached && Object.keys(cached).length > 0) {
          console.log('[EastJavaMap] 📦 Using Cached Geometries');
          Object.entries(cached).forEach(([name, geometry]) => {
            geometryCacheRef.current.set(name, geometry);
          });
          setDataVersion(v => v + 1);
          setIsLoading(false);
          return;
        }

        const supabase = createClient();
        const { data, error } = await supabase.from('regions').select('name, geojson');
        if (error || !data) throw error || new Error('No geometry data');

        const cacheObj: Record<string, any> = {};
        data.forEach((item: any) => {
          let geometry = item.geojson;
          if (typeof geometry === 'string') { try { geometry = JSON.parse(geometry); } catch { } }
          const geo = geometry?.geometry || geometry;
          geometryCacheRef.current.set(item.name, geo);
          cacheObj[item.name] = geo;
        });

        await setCachedGeometry('east-java-geometries', cacheObj);
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

  // Map cluster ID to color using ref for performance in loops
  const clusterColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    clusterMeta?.forEach(cm => {
      map[cm.id] = cm.color;
    });
    return map;
  }, [clusterMeta]);

  const clusterLabelMap = useMemo(() => {
    const map: Record<string, string> = {};
    clusterMeta?.forEach(cm => {
      map[cm.id] = cm.label;
    });
    return map;
  }, [clusterMeta]);

  // Derive GeoJSON features — coloring purely from K-Medoids clusterData
  const geoData = useMemo(() => {
    if (geometryCacheRef.current.size === 0) return null;
    const stuntingForYear = stuntingCacheRef.current.get(year);
    if (!stuntingForYear) return null;

    const features: any[] = [];
    geometryCacheRef.current.forEach((geometry, name) => {
      const stunting = stuntingForYear.get(name) || { prevalence: 0, stunting_cases: 0 };
      const clusterId = clusterData?.[name] ?? null;
      const score = scores?.[name] ?? null;

      const matchSearch = !searchQuery || name.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by cluster checkboxes
      let matchFilter = clusterId === null; // regions with no cluster (grey) are always shown
      if (clusterId !== null && (clusterFilters[clusterId] ?? true)) matchFilter = true;

      if (matchSearch && matchFilter) {
        features.push({
          type: 'Feature',
          properties: { name, prevalence: stunting.prevalence, cases: stunting.stunting_cases, clusterId, score },
          geometry,
        });
      }
    });

    return { type: 'FeatureCollection', features } as GeoJsonObject;
  }, [year, searchQuery, clusterFilters, dataVersion, isLoading, clusterData, scores]);

  const getStyle = (feature: any) => {
    const isSelected = selectedRegionRef.current === feature.properties.name;
    const clusterId: string | null = feature.properties.clusterId;
    const fillColor = clusterId !== null ? clusterColorMap[clusterId] : '#94a3b8';
    return {
      fillColor,
      weight: isSelected ? 3 : 1,
      opacity: 1,
      color: isSelected ? '#2563eb' : 'white',
      fillOpacity: isSelected ? 0.85 : (clusterId !== null ? 0.65 : 0.35),
    };
  };

  // Sync styles manually when selectedRegion changes to prevent full GeoJSON remounts
  useEffect(() => {
    if (geoJsonRef.current) {
      geoJsonRef.current.eachLayer((layer: any) => {
        if (layer.feature) {
          layer.setStyle(getStyle(layer.feature));
        }
      });
    }
  }, [selectedRegion, clusterColorMap]);

  const onEachFeature = (feature: any, layer: any) => {
    layer.on({
      mouseover: (e: any) => {
        if (selectedRegionRef.current !== feature.properties.name) {
          e.target.setStyle({ weight: 2, color: '#60a5fa', fillOpacity: 0.75 });
        }
      },
      mouseout: (e: any) => {
        if (selectedRegionRef.current !== feature.properties.name) {
          e.target.setStyle(getStyle(feature));
        }
      },
      click: () => {
        if (setSelectedRegion) setSelectedRegion(feature.properties.name);
      },
    });

    const { prevalence, score: scoreFromProps, clusterId } = feature.properties;
    const clusterLabel = clusterId !== null ? clusterLabelMap[clusterId] : null;

    const actualScore = scoreFromProps !== null
      ? scoreFromProps
      : (viewMode === 'prevalence' ? prevalence : null);

    const clusterBadge = clusterLabel ? ` &bull; <b class="capitalize">${clusterLabel}</b>` : '';

    let modeLabel = t.mapLegend.prevalence;
    let colorClass = 'text-blue-600';
    let unitTag = '%';

    if (viewMode === 'direct_risk') {
      modeLabel = t.mapLegend.directRisk;
      colorClass = 'text-red-600';
      unitTag = '';
    } else if (viewMode === 'prevention_risk') {
      modeLabel = t.mapLegend.preventionRisk;
      colorClass = 'text-orange-600';
      unitTag = '';
    } else if (viewMode === 'maternal_risk') {
      modeLabel = t.mapLegend.maternalRisk;
      colorClass = 'text-purple-600';
      unitTag = '';
    } else if (viewMode === 'environment_risk') {
      modeLabel = t.mapLegend.environmentRisk;
      colorClass = 'text-cyan-600';
      unitTag = '';
    } else if (viewMode === 'comprehensive_risk') {
      modeLabel = t.mapLegend.comprehensiveRisk;
      colorClass = 'text-indigo-600';
      unitTag = '';
    }

    const formattedScore = actualScore !== null
      ? (Array.isArray(actualScore)
        ? (actualScore.reduce((a, b) => a + b, 0) / actualScore.length).toFixed(2)
        : actualScore.toFixed(2))
      : t.mapLegend.noData;

    const isVector = Array.isArray(actualScore);
    const mainText = `${modeLabel}: <b class="${colorClass}">${isVector ? t.map.medoidAvg + ' ' : ''}${formattedScore}${actualScore !== null ? unitTag : ''}</b>${clusterBadge}`;

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
            <p className="mt-2 text-sm font-medium text-gray-600">{t.map.loadingMap}</p>
          </div>
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
            ref={geoJsonRef}
            key={`${year}-${viewMode}-${searchQuery}-${JSON.stringify(clusterFilters)}-${dataVersion}-${clusterData ? Object.keys(clusterData).length : 'nodata'}`}
            data={geoData}
            style={getStyle}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>
    </div>
  );
}
