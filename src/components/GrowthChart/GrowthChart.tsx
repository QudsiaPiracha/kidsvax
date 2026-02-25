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

const METRIC_LABELS: Record<MetricType, string> = {
  weight: "Weight",
  height: "Height",
  head: "Head",
};

const METRIC_UNITS: Record<MetricType, string> = {
  weight: "kg",
  height: "cm",
  head: "cm",
};

// Tailwind color values (extracted for Recharts which needs raw hex)
const COLORS = {
  sage100: "#E1EBE1",
  sage500: "#5B8C5A",
  sage600: "#4A7249",
  warmAmber100: "#F7EDD7",
  warmAmber300: "#E7C887",
  terracotta100: "#FBE5DD",
  terracotta300: "#F2B099",
  gray200: "#e5e7eb",
  gray400: "#9ca3af",
};

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartDataPoint }>;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  if (point.value == null) return null;

  return (
    <div className="rounded-lg border border-sage-100 bg-white px-3 py-2 shadow-sm text-sm">
      {point.date && (
        <p className="text-gray-500 text-xs">
          {new Date(point.date).toLocaleDateString("de-DE")}
        </p>
      )}
      <p className="font-medium text-gray-900">{point.value}</p>
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

  const chartData = buildChartData(measurements, dateOfBirth, gender, activeTab);
  const hasCurves = chartData.some((d) => d.p50 != null);
  const hasValues = chartData.some((d) => d.value != null);
  const maxAge = getMaxAgeForMeasurement(activeTab);

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
              {METRIC_LABELS[tab]}
            </button>
          ))}
        </div>
        <p className="text-center text-sm text-gray-400 py-8">
          No {METRIC_LABELS[activeTab].toLowerCase()} data recorded yet.
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
            {METRIC_LABELS[tab]}
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
              value: METRIC_UNITS[activeTab],
              angle: -90,
              position: "insideLeft",
              offset: 15,
              fontSize: 11,
              fill: COLORS.gray400,
            }}
          />
          <Tooltip content={<CustomTooltip />} />

          {hasCurves && (
            <>
              {/* Concern zone (below p3) */}
              <Area
                dataKey="p3"
                stroke="none"
                fill={COLORS.terracotta100}
                fillOpacity={0.6}
                isAnimationActive={false}
                connectNulls
              />
              {/* Monitor zone (p3-p15) */}
              <Area
                dataKey="p15"
                stroke="none"
                fill={COLORS.warmAmber100}
                fillOpacity={0.6}
                isAnimationActive={false}
                connectNulls
              />
              {/* Healthy zone (p15-p85) */}
              <Area
                dataKey="p85"
                stroke="none"
                fill={COLORS.sage100}
                fillOpacity={0.6}
                isAnimationActive={false}
                connectNulls
              />
              {/* Monitor zone (p85-p97) */}
              <Area
                dataKey="p97"
                stroke="none"
                fill={COLORS.warmAmber100}
                fillOpacity={0.4}
                isAnimationActive={false}
                connectNulls
              />

              {/* Percentile reference lines */}
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
                dataKey="p3"
                stroke={COLORS.terracotta300}
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
                isAnimationActive={false}
                connectNulls
              />
              <Line
                dataKey="p97"
                stroke={COLORS.terracotta300}
                strokeWidth={1}
                strokeDasharray="3 3"
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
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-4 rounded" style={{ background: COLORS.sage100 }} /> Healthy (p15-p85)
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-4 rounded" style={{ background: COLORS.warmAmber100 }} /> Monitor
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-4 rounded" style={{ background: COLORS.terracotta100 }} /> Concern
          </span>
        </div>
      ) : (
        <p data-testid="no-percentile-note" className="mt-2 text-xs text-gray-400 text-center">
          Percentile reference available for children up to {Math.floor(maxAge / 12)} years.
        </p>
      )}
    </div>
  );
}
