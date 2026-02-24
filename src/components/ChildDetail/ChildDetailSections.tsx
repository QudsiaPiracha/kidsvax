"use client";

import React from "react";
import { formatDateDE } from "@/lib/age-utils";

export function OverdueSection({
  items,
}: {
  items: Array<{ name: string; date: string }>;
}) {
  return (
    <div data-testid="overdue-section">
      <h2 className="text-sm font-semibold text-terracotta-500 mb-2">
        Overdue
      </h2>
      <ul className="space-y-1">
        {items.map((item) => (
          <li
            key={item.name}
            className="text-sm text-gray-700 flex justify-between"
          >
            <span>{item.name}</span>
            <span className="text-gray-400">{formatDateDE(item.date)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function StatsSection({
  vaccinationStats,
  examStats,
}: {
  vaccinationStats: { completed: number; total: number };
  examStats: { completed: number; total: number };
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <StatBox
        label="Vaccinations"
        completed={vaccinationStats.completed}
        total={vaccinationStats.total}
      />
      <StatBox
        label="U-exams"
        completed={examStats.completed}
        total={examStats.total}
      />
    </div>
  );
}

function StatBox({
  label,
  completed,
  total,
}: {
  label: string;
  completed: number;
  total: number;
}) {
  return (
    <div className="rounded-lg border border-sage-100 bg-white p-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-base font-semibold text-gray-900">
        {completed} of {total}
      </p>
    </div>
  );
}

export function MasernRow({
  compliance,
}: {
  compliance: "compliant" | "non_compliant" | "not_yet_required";
}) {
  const labels: Record<string, string> = {
    compliant: "Compliant",
    non_compliant: "Non-compliant",
    not_yet_required: "Not yet required",
  };
  const colors: Record<string, string> = {
    compliant: "text-sage-500",
    non_compliant: "text-terracotta-500",
    not_yet_required: "text-gray-400",
  };

  return (
    <div data-testid="masern-status" className={`text-sm ${colors[compliance]}`}>
      Masernschutz: {labels[compliance]}
    </div>
  );
}

export function RecentActivitySection({
  items,
}: {
  items: Array<{ name: string; date: string; type: string }>;
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-700 mb-2">
        Recent Activity
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">No recent activity</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={`${item.name}-${item.date}`}
              className="text-sm flex justify-between"
            >
              <span className="text-gray-700">{item.name}</span>
              <span className="text-gray-400">
                {formatDateDE(item.date)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
