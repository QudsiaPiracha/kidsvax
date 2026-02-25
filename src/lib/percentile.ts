/**
 * WHO percentile calculation utilities.
 * Uses simplified WHO reference data for key ages.
 */

export interface PercentileData {
  p3: number;
  p15: number;
  p50: number;
  p85: number;
  p97: number;
}

export type AgeTable = Record<number, PercentileData>;

// Simplified WHO weight-for-age boys (kg)
const WHO_WEIGHT_BOYS: AgeTable = {
  0: { p3: 2.5, p15: 2.9, p50: 3.3, p85: 3.7, p97: 4.2 },
  3: { p3: 5.0, p15: 5.6, p50: 6.4, p85: 7.2, p97: 7.9 },
  6: { p3: 6.4, p15: 7.1, p50: 7.9, p85: 8.8, p97: 9.5 },
  12: { p3: 7.8, p15: 8.6, p50: 9.6, p85: 10.8, p97: 11.8 },
  24: { p3: 9.7, p15: 10.8, p50: 12.2, p85: 13.7, p97: 15.0 },
  36: { p3: 11.3, p15: 12.7, p50: 14.3, p85: 16.2, p97: 17.8 },
  48: { p3: 12.7, p15: 14.4, p50: 16.3, p85: 18.6, p97: 20.5 },
  60: { p3: 14.1, p15: 15.9, p50: 18.3, p85: 21.0, p97: 23.5 },
};

// Simplified WHO weight-for-age girls (kg)
const WHO_WEIGHT_GIRLS: AgeTable = {
  0: { p3: 2.4, p15: 2.8, p50: 3.2, p85: 3.6, p97: 4.0 },
  3: { p3: 4.6, p15: 5.2, p50: 5.8, p85: 6.6, p97: 7.2 },
  6: { p3: 5.8, p15: 6.5, p50: 7.3, p85: 8.2, p97: 8.9 },
  12: { p3: 7.0, p15: 7.9, p50: 8.9, p85: 10.1, p97: 11.0 },
  24: { p3: 9.0, p15: 10.2, p50: 11.5, p85: 13.0, p97: 14.3 },
  36: { p3: 10.8, p15: 12.2, p50: 13.9, p85: 15.9, p97: 17.5 },
  48: { p3: 12.3, p15: 14.0, p50: 16.1, p85: 18.5, p97: 20.5 },
  60: { p3: 13.7, p15: 15.8, p50: 18.2, p85: 21.2, p97: 23.7 },
};

// Simplified WHO height-for-age boys (cm)
const WHO_HEIGHT_BOYS: AgeTable = {
  0: { p3: 46.3, p15: 47.9, p50: 49.9, p85: 51.8, p97: 53.4 },
  3: { p3: 57.6, p15: 59.3, p50: 61.4, p85: 63.5, p97: 65.3 },
  6: { p3: 63.6, p15: 65.5, p50: 67.6, p85: 69.8, p97: 71.6 },
  12: { p3: 71.0, p15: 73.0, p50: 75.7, p85: 78.0, p97: 80.2 },
  24: { p3: 81.0, p15: 83.5, p50: 87.1, p85: 90.2, p97: 92.9 },
  36: { p3: 88.7, p15: 91.6, p50: 96.1, p85: 99.8, p97: 102.7 },
  48: { p3: 94.9, p15: 98.3, p50: 103.3, p85: 107.5, p97: 110.7 },
  60: { p3: 100.7, p15: 104.4, p50: 110.0, p85: 114.6, p97: 118.0 },
};

// Simplified WHO height-for-age girls (cm)
const WHO_HEIGHT_GIRLS: AgeTable = {
  0: { p3: 45.6, p15: 47.1, p50: 49.1, p85: 51.1, p97: 52.7 },
  3: { p3: 56.2, p15: 57.9, p50: 59.8, p85: 61.8, p97: 63.4 },
  6: { p3: 61.5, p15: 63.3, p50: 65.7, p85: 68.0, p97: 69.8 },
  12: { p3: 69.2, p15: 71.4, p50: 74.0, p85: 76.6, p97: 78.9 },
  24: { p3: 80.0, p15: 82.5, p50: 86.4, p85: 89.6, p97: 92.2 },
  36: { p3: 87.4, p15: 90.4, p50: 95.1, p85: 98.9, p97: 101.8 },
  48: { p3: 94.1, p15: 97.5, p50: 102.7, p85: 107.0, p97: 110.2 },
  60: { p3: 99.9, p15: 103.7, p50: 109.4, p85: 114.2, p97: 117.7 },
};

// Simplified WHO head-circumference-for-age boys (cm)
const WHO_HEAD_BOYS: AgeTable = {
  0: { p3: 32.1, p15: 33.1, p50: 34.5, p85: 35.8, p97: 36.9 },
  3: { p3: 38.3, p15: 39.3, p50: 40.5, p85: 41.7, p97: 42.7 },
  6: { p3: 41.0, p15: 42.0, p50: 43.3, p85: 44.6, p97: 45.6 },
  12: { p3: 43.6, p15: 44.6, p50: 46.1, p85: 47.4, p97: 48.5 },
  24: { p3: 45.8, p15: 46.9, p50: 48.3, p85: 49.5, p97: 50.5 },
  36: { p3: 46.6, p15: 47.7, p50: 49.2, p85: 50.5, p97: 51.5 },
};

// Simplified WHO head-circumference-for-age girls (cm)
const WHO_HEAD_GIRLS: AgeTable = {
  0: { p3: 31.5, p15: 32.4, p50: 33.9, p85: 35.1, p97: 36.1 },
  3: { p3: 37.2, p15: 38.2, p50: 39.5, p85: 40.8, p97: 41.7 },
  6: { p3: 39.7, p15: 40.8, p50: 42.2, p85: 43.5, p97: 44.5 },
  12: { p3: 42.3, p15: 43.4, p50: 44.9, p85: 46.2, p97: 47.3 },
  24: { p3: 44.7, p15: 45.8, p50: 47.2, p85: 48.6, p97: 49.6 },
  36: { p3: 45.6, p15: 46.7, p50: 48.1, p85: 49.5, p97: 50.5 },
};

export function getTable(
  gender: string,
  measurement: string
): AgeTable {
  const key = `${gender}-${measurement}`;
  const tables: Record<string, AgeTable> = {
    "male-weight": WHO_WEIGHT_BOYS,
    "female-weight": WHO_WEIGHT_GIRLS,
    "male-height": WHO_HEIGHT_BOYS,
    "female-height": WHO_HEIGHT_GIRLS,
    "male-head": WHO_HEAD_BOYS,
    "female-head": WHO_HEAD_GIRLS,
  };
  return tables[key] ?? WHO_WEIGHT_BOYS;
}

function findClosestAge(table: AgeTable, ageMonths: number): PercentileData {
  const ages = Object.keys(table).map(Number).sort((a, b) => a - b);
  let closest = ages[0];
  for (const age of ages) {
    if (Math.abs(age - ageMonths) < Math.abs(closest - ageMonths)) {
      closest = age;
    }
  }
  return table[closest];
}

function interpolatePercentile(
  value: number,
  ref: PercentileData
): number {
  if (value <= ref.p3) {
    const ratio = value / ref.p3;
    return Math.max(1, Math.round(3 * ratio));
  }
  if (value <= ref.p15) {
    return 3 + Math.round(((value - ref.p3) / (ref.p15 - ref.p3)) * 12);
  }
  if (value <= ref.p50) {
    return 15 + Math.round(((value - ref.p15) / (ref.p50 - ref.p15)) * 35);
  }
  if (value <= ref.p85) {
    return 50 + Math.round(((value - ref.p50) / (ref.p85 - ref.p50)) * 35);
  }
  if (value <= ref.p97) {
    return 85 + Math.round(((value - ref.p85) / (ref.p97 - ref.p85)) * 12);
  }
  const excess = value / ref.p97;
  return Math.min(99, Math.round(97 + 2 * excess));
}

export function calculateBMI(heightCm: number, weightKg: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 100) / 100;
}

export function calculatePercentile(
  value: number,
  ageMonths: number,
  gender: string,
  measurement: string
): number {
  const table = getTable(gender, measurement);
  const ref = findClosestAge(table, ageMonths);
  return interpolatePercentile(value, ref);
}

interface PercentilePoint {
  date: string;
  percentile: number;
}

interface CrossingResult {
  crossed: boolean;
  direction: "up" | "down" | "none";
  from: number;
  to: number;
}

const CROSSING_THRESHOLD = 20;

export function detectPercentileCrossing(
  history: PercentilePoint[]
): CrossingResult {
  if (history.length < 2) {
    return { crossed: false, direction: "none", from: 0, to: 0 };
  }
  const first = history[0].percentile;
  const last = history[history.length - 1].percentile;
  const diff = last - first;
  const absDiff = Math.abs(diff);

  if (absDiff >= CROSSING_THRESHOLD) {
    return {
      crossed: true,
      direction: diff > 0 ? "up" : "down",
      from: first,
      to: last,
    };
  }
  return { crossed: false, direction: "none", from: first, to: last };
}
