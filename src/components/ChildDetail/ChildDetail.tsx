"use client";

import React from "react";
import { calculateAge, formatDateDE } from "@/lib/age-utils";
import {
  OverdueSection,
  StatsSection,
  MasernRow,
  RecentActivitySection,
} from "./ChildDetailSections";

export interface ChildDetailProps {
  child: {
    id: string;
    name: string;
    date_of_birth: string;
    photo_url: string | null;
  };
  pediatricianName: string | null;
  nextUpItem: { name: string; date: string; type: string } | null;
  overdueItems: Array<{ name: string; date: string }>;
  vaccinationStats: { completed: number; total: number };
  examStats: { completed: number; total: number };
  masernCompliance: "compliant" | "non_compliant" | "not_yet_required";
  recentActivity: Array<{ name: string; date: string; type: string }>;
  onBack: () => void;
}

export function ChildDetail({
  child,
  pediatricianName,
  nextUpItem,
  overdueItems,
  vaccinationStats,
  examStats,
  masernCompliance,
  recentActivity,
  onBack,
}: ChildDetailProps): React.JSX.Element {
  const age = calculateAge(child.date_of_birth);

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <BackButton onClick={onBack} />
      <Header name={child.name} age={age} />
      <PediatricianRow name={pediatricianName} />
      {nextUpItem && <NextUpCard item={nextUpItem} />}
      {overdueItems.length > 0 && (
        <OverdueSection items={overdueItems} />
      )}
      <StatsSection
        vaccinationStats={vaccinationStats}
        examStats={examStats}
      />
      <MasernRow compliance={masernCompliance} />
      <RecentActivitySection items={recentActivity} />
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Back"
      className="min-h-[44px] min-w-[44px] text-sage-600
                 font-medium text-sm"
    >
      &larr; Back
    </button>
  );
}

function Header({ name, age }: { name: string; age: string }) {
  return (
    <div className="mb-2">
      <h1 className="text-xl font-semibold text-gray-900">{name}</h1>
      <p className="text-sm text-gray-500">{age}</p>
    </div>
  );
}

function PediatricianRow({ name }: { name: string | null }) {
  return (
    <div className="text-sm text-gray-600">
      {name ? (
        <span>Kinderarzt: {name}</span>
      ) : (
        <span>No pediatrician assigned</span>
      )}
    </div>
  );
}

function NextUpCard({
  item,
}: {
  item: { name: string; date: string; type: string };
}) {
  return (
    <div
      className="rounded-lg border border-warm-amber-200 bg-warm-amber-50
                 p-3"
    >
      <p className="text-xs text-warm-amber-600 font-medium mb-1">
        Coming up
      </p>
      <p className="text-base font-semibold text-gray-900">{item.name}</p>
      <p className="text-sm text-gray-500">{formatDateDE(item.date)}</p>
    </div>
  );
}
