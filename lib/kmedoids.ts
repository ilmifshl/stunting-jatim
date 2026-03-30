

export type ClusterLabel = 'tinggi' | 'menengah' | 'rendah';

/** Generic input: region name + numeric score(s) */
export interface RegionScoreData {
  regionName: string;
  score: number | number[];
}

/** @deprecated Use RegionScoreData instead. */
export interface RegionClusterData {
  regionName: string;
  prevalence: number;
}

export interface ClusterResult {
  /** Maps each region name to its cluster label */
  clusters: Record<string, ClusterLabel>;
  /** Maps each region name to its original numeric score/vector */
  scores: Record<string, number | number[]>;
  /** The medoid value for each cluster */
  medoids: (number | number[])[];
  /** 
   * Global Silhouette Coefficient (-1 to 1). 
   * > 0.5 indicates strong structure, < 0.2 indicates weak structure.
   */
  silhouetteScore: number;
  /** Average Silhouette Coefficient per cluster label */
  clusterStats: Record<ClusterLabel, {
    count: number;
    avgScore: number;
    silhouette: number;
  }>;
  /**
   * Dynamic thresholds (only provided for 1D data).
   */
  thresholds?: {
    rendahMax: number;
    menengahMax: number;
  };
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
  
  // Normalize everything to number[][] internally
  const points = validData.map((d) => Array.isArray(d.score) ? d.score : [d.score]);
  const k = 3;

  const { medoidIndices, assignments } = kMedoidsPAM(points, k);
  const silhouetteScores = calculateSilhouettes(points, assignments, k);
  
  // Medoid values in their original format (scalar or array)
  const medoidValuesRaw = medoidIndices.map((i, idx) => validData[i].score);
  
  // To assign labels (rendah/menengah/tinggi), sort medoids by their mean value
  const medoidStats = medoidIndices.map((mIdx, clusterIdx) => {
    const p = points[mIdx];
    return {
      clusterIdx,
      mean: p.reduce((a, b) => a + b, 0) / p.length,
      value: validData[mIdx].score
    };
  });
  
  const sortedByMean = [...medoidStats].sort((a, b) => a.mean - b.mean);
  const [rendahMeta, menengahMeta, tinggiMeta] = sortedByMean;

  const clusterIndexToLabel: Record<number, ClusterLabel> = {
    [rendahMeta.clusterIdx]: 'rendah',
    [menengahMeta.clusterIdx]: 'menengah',
    [tinggiMeta.clusterIdx]: 'tinggi'
  };

  const clusters: Record<string, ClusterLabel> = {};
  const scores: Record<string, number | number[]> = {};
  
  validData.forEach((d, i) => {
    const label = clusterIndexToLabel[assignments[i]];
    clusters[d.regionName] = label;
    scores[d.regionName] = d.score;
  });

  // Calculate cluster statistics
  const clusterStats: ClusterResult['clusterStats'] = {
    rendah: { count: 0, avgScore: 0, silhouette: 0 },
    menengah: { count: 0, avgScore: 0, silhouette: 0 },
    tinggi: { count: 0, avgScore: 0, silhouette: 0 }
  };

  validData.forEach((d, i) => {
    const label = clusters[d.regionName];
    const s = silhouetteScores[i];
    const p = points[i];
    const mean = p.reduce((a, b) => a + b, 0) / p.length;

    clusterStats[label].count++;
    clusterStats[label].avgScore += mean;
    clusterStats[label].silhouette += s;
  });

  Object.values(clusterStats).forEach(stat => {
    if (stat.count > 0) {
      stat.avgScore /= stat.count;
      stat.silhouette /= stat.count;
    }
  });

  const globalSilhouette = silhouetteScores.reduce((a, b) => a + b, 0) / silhouetteScores.length;

  const result: ClusterResult = {
    clusters,
    scores,
    medoids: [rendahMeta.value, menengahMeta.value, tinggiMeta.value],
    silhouetteScore: parseFloat(globalSilhouette.toFixed(4)),
    clusterStats: {
      rendah: { ...clusterStats.rendah, avgScore: parseFloat(clusterStats.rendah.avgScore.toFixed(2)), silhouette: parseFloat(clusterStats.rendah.silhouette.toFixed(4)) },
      menengah: { ...clusterStats.menengah, avgScore: parseFloat(clusterStats.menengah.avgScore.toFixed(2)), silhouette: parseFloat(clusterStats.menengah.silhouette.toFixed(4)) },
      tinggi: { ...clusterStats.tinggi, avgScore: parseFloat(clusterStats.tinggi.avgScore.toFixed(2)), silhouette: parseFloat(clusterStats.tinggi.silhouette.toFixed(4)) }
    }
  };

  // Provide thresholds ONLY if data is 1D
  if (points[0].length === 1) {
    const rMedoid = rendahMeta.mean;
    const mMedoid = menengahMeta.mean;
    const tMedoid = tinggiMeta.mean;
    result.thresholds = {
      rendahMax: parseFloat(((rMedoid + mMedoid) / 2).toFixed(2)),
      menengahMax: parseFloat(((mMedoid + tMedoid) / 2).toFixed(2))
    };
  }

  return result;
}

export function classifyPrevalenceClusters(data: RegionClusterData[]): ClusterResult {
  return classifyScoreClusters(data.map((d) => ({ regionName: d.regionName, score: d.prevalence })));
}

