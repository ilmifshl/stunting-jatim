

export type ClusterLabel = 'tinggi' | 'menengah' | 'rendah';

/** Generic input: region name + any numeric score (prevalence, risk score, etc.) */
export interface RegionScoreData {
  regionName: string;
  score: number;
}

/** @deprecated Use RegionScoreData instead. Kept for backward compatibility. */
export interface RegionClusterData {
  regionName: string;
  prevalence: number;
}

export interface ClusterResult {
  /** Maps each region name to its cluster label */
  clusters: Record<string, ClusterLabel>;
  /** Maps each region name to its original numeric score/prevalence */
  scores: Record<string, number>;
  /** The medoid value for each cluster */
  medoids: number[];
  /**
   * Dynamic thresholds derived from cluster medoids.
   * These replace the hardcoded 14% and 20% thresholds.
   */
  thresholds: {
    rendahMax: number;   // Prevalence <= this → rendah
    menengahMax: number; // Prevalence <= this → menengah  (else → tinggi)
  };
}

// ─────────────────────────────────────────────
// Core K-Medoids Algorithm
// ─────────────────────────────────────────────

/**
 * Compute Manhattan (absolute) distance between two 1D points.
 * For single-feature data like prevalence, this equals |a - b|.
 */
function distance(a: number, b: number): number {
  return Math.abs(a - b);
}

/**
 * K-Medoids clusterer using the PAM (Partitioning Around Medoids) approach.
 *
 * @param points - Array of numeric values (prevalence %)
 * @param k      - Number of clusters (3 for tinggi/menengah/rendah)
 * @param maxIter - Maximum swap iterations
 * @returns medoidIndices and assignments for each point
 */
function kMedoidsPAM(
  points: number[],
  k: number,
  maxIter = 100
): { medoidIndices: number[]; assignments: number[] } {
  const n = points.length;
  if (n === 0) return { medoidIndices: [], assignments: [] };
  if (n <= k) {
    // Edge case: fewer points than clusters — each point is its own medoid
    return {
      medoidIndices: points.map((_, i) => i),
      assignments: points.map((_, i) => i),
    };
  }

  // Step 1: Initialize medoids by spreading across sorted data
  const sorted = [...points].map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
  let medoidIndices: number[] = [];
  const step = Math.floor(n / k);
  for (let c = 0; c < k; c++) {
    const idx = Math.min(step * c + Math.floor(step / 2), n - 1);
    medoidIndices.push(sorted[idx].i);
  }

  // Step 2: Iterative swap phase
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

    // Try swapping each medoid with each non-medoid
    let improved = false;
    const medoidSet = new Set(medoidIndices);

    for (let cIdx = 0; cIdx < k; cIdx++) {
      for (let candidate = 0; candidate < n; candidate++) {
        if (medoidSet.has(candidate)) continue;

        // Compute total cost with this candidate as medoid for cluster cIdx
        const newMedoids = [...medoidIndices];
        newMedoids[cIdx] = candidate;

        const newCost = points.reduce((sum, p, pIdx) => {
          const minD = Math.min(...newMedoids.map((mIdx) => distance(p, points[mIdx])));
          return sum + minD;
        }, 0);

        const oldCost = points.reduce((sum, p) => {
          const minD = Math.min(...medoidIndices.map((mIdx) => distance(p, points[mIdx])));
          return sum + minD;
        }, 0);

        if (newCost < oldCost) {
          medoidIndices = newMedoids;
          improved = true;
          break;
        }
      }
      if (improved) break;
    }

    if (!improved) break; // Converged
  }

  return { medoidIndices, assignments };
}

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────

/**
 * Classify a list of regions into 3 clusters using K-Medoids (PAM).
 * Works on ANY numeric score — prevalence %, risk score (0–100), etc.
 *
 * - Regions with score === 0 are treated as "no data" and excluded from clustering.
 * - The cluster with the highest medoid → 'tinggi', middle → 'menengah', lowest → 'rendah'.
 *
 * @param data  Array of { regionName, score }
 * @returns     ClusterResult with cluster labels, medoid values, and dynamic thresholds
 */
export function classifyScoreClusters(data: RegionScoreData[]): ClusterResult {
  const validData = data.filter((d) => d.score !== null && d.score !== undefined);
  const points = validData.map((d) => d.score);
  const k = 3;

  const { medoidIndices, assignments } = kMedoidsPAM(points, k);
  const medoidValues = medoidIndices.map((i) => points[i]);
  const sortedMedoids = [...medoidValues].sort((a, b) => a - b);

  const [rendahMedoid, menengahMedoid, tinggiMedoid] = sortedMedoids;

  const clusterIndexToLabel: Record<number, ClusterLabel> = {};
  medoidValues.forEach((mv, cIdx) => {
    if (mv === rendahMedoid) clusterIndexToLabel[cIdx] = 'rendah';
    else if (mv === menengahMedoid) clusterIndexToLabel[cIdx] = 'menengah';
    else clusterIndexToLabel[cIdx] = 'tinggi';
  });

  const clusters: Record<string, ClusterLabel> = {};
  const scores: Record<string, number> = {};
  validData.forEach((d, i) => {
    clusters[d.regionName] = clusterIndexToLabel[assignments[i]] ?? 'rendah';
    scores[d.regionName] = d.score;
  });

  const rendahMax = parseFloat(((rendahMedoid + menengahMedoid) / 2).toFixed(2));
  const menengahMax = parseFloat(((menengahMedoid + tinggiMedoid) / 2).toFixed(2));

  return {
    clusters,
    scores,
    medoids: [rendahMedoid, menengahMedoid, tinggiMedoid],
    thresholds: { rendahMax, menengahMax },
  };
}

/**
 * @deprecated Use classifyScoreClusters() with { regionName, score: prevalence } instead.
 * Kept for backward compatibility with the existing prevalence clustering flow.
 */
export function classifyPrevalenceClusters(data: RegionClusterData[]): ClusterResult {
  return classifyScoreClusters(data.map((d) => ({ regionName: d.regionName, score: d.prevalence })));
}

