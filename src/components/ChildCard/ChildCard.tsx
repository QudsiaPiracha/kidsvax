"use client";

import React from "react";
import { calculateAge, calculateCountdown, formatDateDE } from "@/lib/age-utils";

export interface ChildCardProps {
  child: {
    id: string;
    name: string;
    date_of_birth: string;
    gender: string;
    photo_url: string | null;
  };
  nextUpItem: {
    name: string;
    date: string;
    type: "u_exam" | "vaccination";
  } | null;
  overdueCount: number;
  vaccinationProgress: { completed: number; total: number };
  examProgress: { completed: number; total: number };
  masernCompliance: "compliant" | "non_compliant" | "not_yet_required";
  onClick: () => void;
}

export function ChildCard({
  child,
  nextUpItem,
  overdueCount,
  vaccinationProgress,
  examProgress,
  masernCompliance,
  onClick,
}: ChildCardProps): React.JSX.Element {
  const age = calculateAge(child.date_of_birth);

  return (
    <button
      data-testid="child-card"
      onClick={onClick}
      className="w-full text-left rounded-lg border border-sage-100 bg-white
                 p-4 shadow-sm min-h-[44px] hover:border-sage-300
                 transition-colors"
    >
      <CardHeader child={child} age={age} />
      {nextUpItem && <NextUpSection item={nextUpItem} />}
      {overdueCount > 0 && <OverdueBadge count={overdueCount} />}
      <ProgressSection
        vaccinationProgress={vaccinationProgress}
        examProgress={examProgress}
      />
      <MasernStatus compliance={masernCompliance} />
    </button>
  );
}

function CardHeader({
  child,
  age,
}: {
  child: ChildCardProps["child"];
  age: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-3">
      {child.photo_url ? (
        <img
          src={child.photo_url}
          alt={child.name}
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <DefaultAvatar />
      )}
      <div>
        <h3 className="text-base font-semibold text-gray-900">
          {child.name}
        </h3>
        <p className="text-sm text-gray-500">{age}</p>
      </div>
    </div>
  );
}

function DefaultAvatar() {
  return (
    <div
      data-testid="default-avatar"
      className="w-10 h-10 rounded-full bg-sage-100
                 flex items-center justify-center"
    >
      <span className="text-sage-600 text-sm font-medium" aria-hidden>
        ?
      </span>
    </div>
  );
}

function NextUpSection({
  item,
}: {
  item: NonNullable<ChildCardProps["nextUpItem"]>;
}) {
  const countdown = calculateCountdown(item.date);
  return (
    <div className="mb-2 text-sm">
      <span className="text-gray-600">Next: </span>
      <span className="font-medium text-gray-900">{item.name}</span>
      <span className="text-gray-500"> {formatDateDE(item.date)}</span>
      {countdown && (
        <span className="ml-1 text-warm-amber-600">({countdown})</span>
      )}
    </div>
  );
}

function OverdueBadge({ count }: { count: number }) {
  return (
    <span
      className="inline-block mb-2 text-sm font-medium px-2 py-0.5
                 rounded bg-terracotta-50 text-terracotta-500"
    >
      {count} overdue
    </span>
  );
}

function ProgressSection({
  vaccinationProgress,
  examProgress,
}: {
  vaccinationProgress: { completed: number; total: number };
  examProgress: { completed: number; total: number };
}) {
  return (
    <div className="flex gap-4 text-xs text-gray-500 mb-1">
      <span>
        Vaccinations: {vaccinationProgress.completed} of{" "}
        {vaccinationProgress.total}
      </span>
      <span>
        U-exams: {examProgress.completed} of {examProgress.total}
      </span>
    </div>
  );
}

function MasernStatus({
  compliance,
}: {
  compliance: ChildCardProps["masernCompliance"];
}) {
  const label =
    compliance === "compliant"
      ? "Compliant"
      : compliance === "non_compliant"
        ? "Non-compliant"
        : "Not yet required";
  const color =
    compliance === "compliant"
      ? "text-sage-500"
      : compliance === "non_compliant"
        ? "text-terracotta-500"
        : "text-gray-400";

  return (
    <div data-testid="masern-status" className={`text-xs ${color}`}>
      Masernschutz: {label}
    </div>
  );
}
