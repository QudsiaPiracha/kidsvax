/**
 * Transforms WHO percentile data into chart-ready curve arrays.
 * Standard 7-percentile system: P3, P10, P25, P50, P75, P90, P97.
 */

import { getTable, calculatePercentile } from "./percentile";
import { calculateAgeMonths } from "./age-utils";

export interface CurvePoint {
  ageMonths: number;
  p3: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  p97: number;
}

export interface ChartDataPoint {
  ageMonths: number;
  p3?: number;
  p10?: number;
  p25?: number;
  p50?: number;
  p75?: number;
  p90?: number;
  p97?: number;
  value?: number;
  date?: string;
  percentile?: number;
}

export type MetricType = "weight" | "height" | "head";

const METRIC_KEYS: Record<MetricType, string> = {
  weight: "weight_kg",
  height: "height_cm",
  head: "head_circumference_cm",
};

/** Get WHO percentile curves for a given gender and metric. */
export function getPercentileCurves(
  gender: string,
  metric: MetricType
): CurvePoint[] {
  const table = getTable(gender, metric);
  return Object.entries(table)
    .map(([age, data]) => ({
      ageMonths: Number(age),
      ...data,
    }))
    .sort((a, b) => a.ageMonths - b.ageMonths);
}

/** Max age with WHO reference data for a given metric. */
export function getMaxAgeForMeasurement(metric: MetricType): number {
  return metric === "head" ? 36 : 60;
}

/** Merge child measurements with percentile curves into a unified chart data array. */
export function buildChartData(
  measurements: Array<{ measured_date: string; [key: string]: unknown }>,
  dateOfBirth: string,
  gender: string,
  metric: MetricType
): ChartDataPoint[] {
  const metricKey = METRIC_KEYS[metric];
  const curves = getPercentileCurves(gender, metric);
  const maxAge = getMaxAgeForMeasurement(metric);

  // Build curve points
  const curvePoints: ChartDataPoint[] = curves.map((c) => ({
    ageMonths: c.ageMonths,
    p3: c.p3,
    p10: c.p10,
    p25: c.p25,
    p50: c.p50,
    p75: c.p75,
    p90: c.p90,
    p97: c.p97,
  }));

  // Build child data points
  const childPoints: ChartDataPoint[] = measurements
    .filter((m) => m[metricKey] != null)
    .map((m) => {
      const ageMonths = calculateAgeMonths(dateOfBirth, m.measured_date);
      const value = m[metricKey] as number;
      const percentile =
        ageMonths <= maxAge
          ? calculatePercentile(value, ageMonths, gender, metric)
          : undefined;
      return {
        ageMonths,
        value,
        date: m.measured_date,
        percentile,
      };
    });

  // Check if child data falls within the curve range
  const childMaxAge = Math.max(...childPoints.map((p) => p.ageMonths), 0);
  const showCurves = childMaxAge <= maxAge + 6;

  // Merge and sort
  const merged = showCurves
    ? [...curvePoints, ...childPoints]
    : [...childPoints];

  return merged.sort((a, b) => a.ageMonths - b.ageMonths);
}
