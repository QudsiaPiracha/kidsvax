"use client";

import React, { useState } from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { buildChartData, getMaxAgeForMeasurement } from "@/lib/percentile-curves";
import type { MetricType, ChartDataPoint } from "@/lib/percentile-curves";
import { calculateAgeMonths } from "@/lib/age-utils";

export interface GrowthChartProps {
  measurements: Array<{
    id: string;
    measured_date: string;
    weight_kg: number | null;
    height_cm: number | null;
    head_circumference_cm: number | null;
    bmi: number | null;
  }>;
  gender: string;
  dateOfBirth: string;
}

const METRIC_UNITS: Record<MetricType, string> = {
  weight: "kg",
  height: "cm",
  head: "cm",
};

// Tailwind color values (extracted for Recharts which needs raw hex)
const COLORS = {
  sage50: "#F0F5F0",
  sage100: "#E1EBE1",
  sage200: "#C3D7C3",
  sage500: "#5B8C5A",
  sage600: "#4A7249",
  gray200: "#e5e7eb",
  gray400: "#9ca3af",
  gray500: "#6b7280",
};

function CustomTooltip({
  active,
  payload,
  metric,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartDataPoint }>;
  metric: MetricType;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  if (point.value == null) return null;

  const unit = METRIC_UNITS[metric];

  return (
    <div className="rounded-lg border border-sage-100 bg-white px-3 py-2 shadow-sm text-sm">
      {point.date && (
        <p className="text-gray-500 text-xs">
          {new Date(point.date).toLocaleDateString("de-DE")}
        </p>
      )}
      <p className="font-medium text-gray-900">
        {point.value} {unit}
      </p>
      {point.percentile != null && (
        <p className="text-xs text-sage-600">
          {point.percentile}th percentile
        </p>
      )}
    </div>
  );
}

export function GrowthChart({
  measurements,
  gender,
  dateOfBirth,
}: GrowthChartProps): React.JSX.Element {
  const currentAgeMonths = calculateAgeMonths(
    dateOfBirth,
    new Date().toISOString().split("T")[0]
  );

  const availableTabs: MetricType[] = ["weight", "height"];
  if (currentAgeMonths <= 36) {
    availableTabs.push("head");
  }

  const [activeTab, setActiveTab] = useState<MetricType>("weight");

  // Length vs Height label: "Length" when child < 24 months, "Height" otherwise
  function getMetricLabel(tab: MetricType): string {
    if (tab === "weight") return "Weight";
    if (tab === "head") return "Head";
    return currentAgeMonths < 24 ? "Length" : "Height";
  }

  const chartData = buildChartData(measurements, dateOfBirth, gender, activeTab);
  const hasCurves = chartData.some((d) => d.p50 != null);
  const hasValues = chartData.some((d) => d.value != null);
  const maxAge = getMaxAgeForMeasurement(activeTab);

  const yAxisLabel =
    activeTab === "height"
      ? currentAgeMonths < 24
        ? "cm (length)"
        : "cm (height)"
      : METRIC_UNITS[activeTab];

  if (!hasValues) {
    return (
      <div data-testid="growth-chart" className="rounded-xl border border-sage-100 bg-white p-4">
        <div className="flex gap-2 mb-4">
          {availableTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`min-h-[44px] flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-sage-500 text-white"
                  : "border border-sage-100 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {getMetricLabel(tab)}
            </button>
          ))}
        </div>
        <p className="text-center text-sm text-gray-400 py-8">
          No {getMetricLabel(activeTab).toLowerCase()} data recorded yet.
        </p>
      </div>
    );
  }

  return (
    <div data-testid="growth-chart" className="rounded-xl border border-sage-100 bg-white p-4">
      {/* Tab bar */}
      <div className="flex gap-2 mb-4">
        {availableTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            data-testid={`tab-${tab}`}
            className={`min-h-[44px] flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-sage-500 text-white"
                : "border border-sage-100 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {getMetricLabel(tab)}
          </button>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray200} vertical={false} />
          <XAxis
            dataKey="ageMonths"
            type="number"
            domain={["dataMin", "dataMax"]}
            tick={{ fontSize: 11, fill: COLORS.gray400 }}
            label={{ value: "Age (months)", position: "insideBottom", offset: -2, fontSize: 11, fill: COLORS.gray400 }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: COLORS.gray400 }}
            label={{
              value: yAxisLabel,
              angle: -90,
              position: "insideLeft",
              offset: 15,
              fontSize: 11,
              fill: COLORS.gray400,
            }}
          />
          <Tooltip content={<CustomTooltip metric={activeTab} />} />

          {hasCurves && (
            <>
              {/* Percentile zone bands — each Area fills from one curve to the next */}
              {/* P3→P10 zone (outer low) */}
              <Area
                dataKey="p10"
                baseValue="dataMin"
                stroke="none"
                fill={COLORS.sage50}
                fillOpacity={0.3}
                isAnimationActive={false}
                connectNulls
              />
              {/* P10→P25 zone */}
              <Area
                dataKey="p25"
                baseValue="dataMin"
                stroke="none"
                fill={COLORS.sage50}
                fillOpacity={0.4}
                isAnimationActive={false}
                connectNulls
              />
              {/* P25→P75 zone (healthy middle) */}
              <Area
                dataKey="p75"
                baseValue="dataMin"
                stroke="none"
                fill={COLORS.sage100}
                fillOpacity={0.5}
                isAnimationActive={false}
                connectNulls
              />
              {/* P75→P90 zone */}
              <Area
                dataKey="p90"
                baseValue="dataMin"
                stroke="none"
                fill={COLORS.sage50}
                fillOpacity={0.4}
                isAnimationActive={false}
                connectNulls
              />
              {/* P90→P97 zone (outer high) */}
              <Area
                dataKey="p97"
                baseValue="dataMin"
                stroke="none"
                fill={COLORS.sage50}
                fillOpacity={0.3}
                isAnimationActive={false}
                connectNulls
              />

              {/* 7 percentile reference lines */}
              <Line
                dataKey="p3"
                stroke={COLORS.gray400}
                strokeWidth={0.5}
                strokeDasharray="2 4"
                dot={false}
                isAnimationActive={false}
                connectNulls
              />
              <Line
                dataKey="p10"
                stroke={COLORS.gray400}
                strokeWidth={0.5}
                strokeDasharray="2 4"
                dot={false}
                isAnimationActive={false}
                connectNulls
              />
              <Line
                dataKey="p25"
                stroke={COLORS.sage200}
                strokeWidth={0.75}
                strokeDasharray="3 3"
                dot={false}
                isAnimationActive={false}
                connectNulls
              />
              <Line
                dataKey="p50"
                stroke={COLORS.sage500}
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                isAnimationActive={false}
                connectNulls
              />
              <Line
                dataKey="p75"
                stroke={COLORS.sage200}
                strokeWidth={0.75}
                strokeDasharray="3 3"
                dot={false}
                isAnimationActive={false}
                connectNulls
              />
              <Line
                dataKey="p90"
                stroke={COLORS.gray400}
                strokeWidth={0.5}
                strokeDasharray="2 4"
                dot={false}
                isAnimationActive={false}
                connectNulls
              />
              <Line
                dataKey="p97"
                stroke={COLORS.gray400}
                strokeWidth={0.5}
                strokeDasharray="2 4"
                dot={false}
                isAnimationActive={false}
                connectNulls
              />
            </>
          )}

          {/* Child's actual measurements */}
          <Line
            dataKey="value"
            stroke={COLORS.sage600}
            strokeWidth={2}
            dot={{ r: 5, fill: COLORS.sage500, strokeWidth: 2, stroke: "#fff" }}
            activeDot={{ r: 7, fill: COLORS.sage500 }}
            isAnimationActive={false}
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Legend / info */}
      {hasCurves ? (
        <p data-testid="percentile-legend" className="mt-3 text-xs text-gray-400 text-center">
          WHO percentile curves (P3–P97)
        </p>
      ) : (
        <p data-testid="no-percentile-note" className="mt-2 text-xs text-gray-400 text-center">
          Percentile reference available for children up to {Math.floor(maxAge / 12)} years.
        </p>
      )}
    </div>
  );
}
