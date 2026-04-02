export type ClusterLabel = string;

/** Generic input: region name + numeric score(s) */
export interface RegionScoreData {
  regionName: string;
  score: number | number[];
}

export interface ClusterMeta {
  id: string;
  label: string;
  color: string;
  count: number;
  avgScore: number;
  silhouette: number;
  medoid: number | number[];
}

export interface ClusterResult {
  /** Maps each region name to its cluster ID (0, 1, 2...) */
  clusters: Record<string, string>;
  /** Maps each region name to its original numeric score/vector */
  scores: Record<string, number | number[]>;
  /** The medoid value for each cluster (ordered by mean) */
  medoids: (number | number[])[];
  /** Global Silhouette Coefficient of the best K */
  silhouetteScore: number;
  /** Enriched metadata for each cluster, ordered from lowest to highest mean score */
  clusterMeta: ClusterMeta[];
  /** Results for all tested K values for the calculation page */
  allKResults: {
    k: number;
    silhouetteScore: number;
  }[];
  /** The selected K */
  bestK: number;
  /** Dynamic thresholds (only provided for 1D data) */
  thresholds?: number[];
}

/**
 * Generate semantic labels based on the number of clusters (K)
 */
function getClusterLabels(k: number): string[] {
  if (k === 2) return ['Rendah', 'Tinggi'];
  if (k === 3) return ['Rendah', 'Menengah', 'Tinggi'];
  if (k === 4) return ['Sangat Rendah', 'Rendah', 'Tinggi', 'Sangat Tinggi'];
  if (k === 5) return ['Sangat Rendah', 'Rendah', 'Menengah', 'Tinggi', 'Sangat Tinggi'];
  if (k === 6) return ['Sangat Rendah', 'Rendah', 'Waspada Rendah', 'Waspada Tinggi', 'Tinggi', 'Sangat Tinggi'];
  if (k === 7) return ['Sangat Rendah', 'Rendah', 'Cukup Rendah', 'Menengah', 'Cukup Tinggi', 'Tinggi', 'Sangat Tinggi'];
  return Array.from({ length: k }, (_, i) => `Level ${i + 1}`);
}

/**
 * Generate color palette from green to red based on K
 */
function getClusterColors(k: number): string[] {
  const colors = {
    green: '#22c55e',
    lightGreen: '#86efac',
    yellow: '#facc15',
    orange: '#fb923c',
    red: '#ef4444',
    darkRed: '#b91c1c',
  };

  if (k === 2) return [colors.green, colors.red];
  if (k === 3) return [colors.green, colors.yellow, colors.red];
  if (k === 4) return [colors.green, colors.lightGreen, colors.orange, colors.red];
  if (k === 5) return [colors.green, colors.lightGreen, colors.yellow, colors.orange, colors.red];
  if (k === 6) return [colors.green, '#a3e635', colors.yellow, colors.orange, colors.red, colors.darkRed];
  return [colors.green, '#a3e635', '#fde047', colors.yellow, colors.orange, colors.red, colors.darkRed];
}

// ─────────────────────────────────────────────
// Core Multi-dimensional K-Medoids Algorithm
// ─────────────────────────────────────────────

/**
 * Compute Manhattan distance between two points (1D or Multi-D).
 */
export function distance(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += Math.abs(a[i] - (b[i] || 0));
  }
  return sum;
}

/**
 * K-Medoids clusterer using the PAM (Partitioning Around Medoids) approach.
 */
function kMedoidsPAM(
  points: number[][],
  k: number,
  maxIter = 100
): { medoidIndices: number[]; assignments: number[] } {
  const n = points.length;
  if (n === 0) return { medoidIndices: [], assignments: [] };
  if (n <= k) {
    return {
      medoidIndices: points.map((_, i) => i),
      assignments: points.map((_, i) => i),
    };
  }

  // Step 1: Initialize medoids (Spread across sorted mean values for better starting point)
  const sorted = points
    .map((v, i) => ({ 
      mean: v.reduce((a, b) => a + b, 0) / v.length, 
      i 
    }))
    .sort((a, b) => a.mean - b.mean);

  let medoidIndices: number[] = [];
  const step = Math.floor(n / k);
  for (let c = 0; c < k; c++) {
    const idx = Math.min(step * c + Math.floor(step / 2), n - 1);
    medoidIndices.push(sorted[idx].i);
  }

  let assignments = new Array(n).fill(0);

  for (let iter = 0; iter < maxIter; iter++) {
    // Assign each point to nearest medoid
    assignments = points.map((p) => {
      let minDist = Infinity;
      let bestCluster = 0;
      medoidIndices.forEach((mIdx, cIdx) => {
        const d = distance(p, points[mIdx]);
        if (d < minDist) {
          minDist = d;
          bestCluster = cIdx;
        }
      });
      return bestCluster;
    });

    let improved = false;
    const currentMedoids = [...medoidIndices];

    // Try swapping each medoid with each non-medoid in its cluster (Simplified PAM)
    for (let cIdx = 0; cIdx < k; cIdx++) {
      const clusterPoints = assignments.map((a, i) => a === cIdx ? i : -1).filter(i => i !== -1);
      
      if (clusterPoints.length === 0) continue;

      let bestMedoid = currentMedoids[cIdx];
      let minTotalDist = clusterPoints.reduce((sum, pIdx) => sum + distance(points[pIdx], points[bestMedoid]), 0);

      for (const candidateIdx of clusterPoints) {
        if (candidateIdx === currentMedoids[cIdx]) continue;
        
        const currentTotalDist = clusterPoints.reduce((sum, pIdx) => sum + distance(points[pIdx], points[candidateIdx]), 0);
        
        if (currentTotalDist < minTotalDist) {
          minTotalDist = currentTotalDist;
          bestMedoid = candidateIdx;
          improved = true;
        }
      }
      medoidIndices[cIdx] = bestMedoid;
    }

    if (!improved) break;
  }

  return { medoidIndices, assignments };
}

/**
 * Calculate Silhouette Coefficient to validate clustering quality.
 */
function calculateSilhouettes(points: number[][], assignments: number[], k: number): number[] {
  const n = points.length;
  if (n <= 1) return [0];

  const silhouettes = new Array(n).fill(0);

  for (let i = 0; i < n; i++) {
    const clusterI = assignments[i];
    
    // Calculate a(i): average distance to points in same cluster
    const sameClusterIndices = assignments.map((a, idx) => a === clusterI && idx !== i ? idx : -1).filter(idx => idx !== -1);
    const ai = sameClusterIndices.length > 0 
      ? sameClusterIndices.reduce((sum, idx) => sum + distance(points[i], points[idx]), 0) / sameClusterIndices.length
      : 0;

    // Calculate b(i): minimum average distance to points in other clusters
    let bi = Infinity;
    for (let c = 0; c < k; c++) {
      if (c === clusterI) continue;
      const otherClusterIndices = assignments.map((a, idx) => a === c ? idx : -1).filter(idx => idx !== -1);
      if (otherClusterIndices.length === 0) continue;
      
      const avgDistToC = otherClusterIndices.reduce((sum, idx) => sum + distance(points[i], points[idx]), 0) / otherClusterIndices.length;
      bi = Math.min(bi, avgDistToC);
    }

    if (bi === Infinity) bi = ai; // Edge case for empty clusters
    
    // s(i) = (b(i) - a(i)) / max(a(i), b(i))
    const denom = Math.max(ai, bi);
    silhouettes[i] = denom === 0 ? 0 : (bi - ai) / denom;
  }

  return silhouettes;
}

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────

export function classifyScoreClusters(data: RegionScoreData[]): ClusterResult {
  const validData = data.filter((d) => d.score !== null && d.score !== undefined);
  if (validData.length === 0) throw new Error('No valid data for clustering');

  // Normalize everything to number[][] internally
  const points = validData.map((d) => Array.isArray(d.score) ? d.score : [d.score]);
  
  // Evaluation: Try K from 2 to 7
  const kRange = [2, 3, 4, 5, 6, 7].filter(k => k <= validData.length);
  const allKResultsDetailed = kRange.map(k => {
    const { medoidIndices, assignments } = kMedoidsPAM(points, k);
    const sil = calculateSilhouettes(points, assignments, k);
    const score = sil.reduce((a, b) => a + b, 0) / sil.length;
    return { k, score, medoidIndices, assignments, silhouetteScores: sil };
  });

  // Pick best K based on silhouette score
  const bestKResult = allKResultsDetailed.reduce((prev, curr) => (curr.score > prev.score ? curr : prev), allKResultsDetailed[0]);
  const { k, medoidIndices, assignments, silhouetteScores } = bestKResult;

  // Enriched metadata generation
  const medoidStats = medoidIndices.map((mIdx, clusterIdx) => {
    const p = points[mIdx];
    return {
      originalIdx: clusterIdx,
      mean: p.reduce((a, b) => a + b, 0) / p.length,
      value: validData[mIdx].score
    };
  });
  
  // Sort medoids by mean value (lowest to highest) to assign semantic labels consistently
  const sortedMedoids = [...medoidStats].sort((a, b) => a.mean - b.mean);
  const labels = getClusterLabels(k);
  const colors = getClusterColors(k);

  // Map old cluster index to new sorted ID
  const clusterIndexMap: Record<number, number> = {};
  sortedMedoids.forEach((m, i) => {
    clusterIndexMap[m.originalIdx] = i;
  });

  const clusters: Record<string, string> = {};
  const scoresMap: Record<string, number | number[]> = {};
  
  validData.forEach((d, i) => {
    const sortedId = clusterIndexMap[assignments[i]];
    clusters[d.regionName] = sortedId.toString();
    scoresMap[d.regionName] = d.score;
  });

  // Calculate cluster-level stats
  const clusterMeta: ClusterMeta[] = sortedMedoids.map((m, i) => ({
    id: i.toString(),
    label: labels[i],
    color: colors[i],
    count: 0,
    avgScore: 0,
    silhouette: 0,
    medoid: m.value
  }));

  validData.forEach((d, i) => {
    const sortedId = clusterIndexMap[assignments[i]];
    const s = silhouetteScores[i];
    const p = points[i];
    const mean = p.reduce((a, b) => a + b, 0) / p.length;

    clusterMeta[sortedId].count++;
    clusterMeta[sortedId].avgScore += mean;
    clusterMeta[sortedId].silhouette += s;
  });

  clusterMeta.forEach(cm => {
    if (cm.count > 0) {
      cm.avgScore = parseFloat((cm.avgScore / cm.count).toFixed(2));
      cm.silhouette = parseFloat((cm.silhouette / cm.count).toFixed(4));
    }
  });

  const result: ClusterResult = {
    clusters,
    scores: scoresMap,
    medoids: sortedMedoids.map(m => m.value),
    silhouetteScore: parseFloat(bestKResult.score.toFixed(4)),
    clusterMeta,
    allKResults: allKResultsDetailed.map(r => ({ k: r.k, silhouetteScore: parseFloat(r.score.toFixed(4)) })),
    bestK: k
  };

  // Provide thresholds ONLY if data is 1D
  if (points[0].length === 1 && k > 1) {
    const thresholds: number[] = [];
    for (let i = 0; i < sortedMedoids.length - 1; i++) {
      const m1 = sortedMedoids[i].mean;
      const m2 = sortedMedoids[i+1].mean;
      thresholds.push(parseFloat(((m1 + m2) / 2).toFixed(2)));
    }
    result.thresholds = thresholds;
  }

  return result;
}

export function classifyPrevalenceClusters(data: any[]): ClusterResult {
  return classifyScoreClusters(data.map((d) => ({ regionName: d.regionName, score: d.prevalence || d.score })));
}
