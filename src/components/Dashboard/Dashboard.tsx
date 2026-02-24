"use client";

import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChildCard, type ChildCardProps } from "@/components/ChildCard";

export interface ChildSummary {
  child: ChildCardProps["child"];
  nextUpItem: ChildCardProps["nextUpItem"];
  overdueCount: number;
  vaccinationProgress: { completed: number; total: number };
  examProgress: { completed: number; total: number };
  masernCompliance: ChildCardProps["masernCompliance"];
}

export interface DashboardProps {
  children: ChildSummary[];
}

export function Dashboard({ children }: DashboardProps): React.JSX.Element {
  const router = useRouter();

  useEffect(() => {
    if (children.length === 1) {
      router.push(`/children/${children[0].child.id}`);
    }
  }, [children, router]);

  const sorted = useMemo(
    () => sortByUrgency(children),
    [children]
  );

  if (children.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">
        My Children
      </h1>
      {sorted.map((c) => (
        <ChildCard
          key={c.child.id}
          {...c}
          onClick={() => router.push(`/children/${c.child.id}`)}
        />
      ))}
      <AddChildButton />
    </div>
  );
}

function sortByUrgency(list: ChildSummary[]): ChildSummary[] {
  return [...list].sort((a, b) => b.overdueCount - a.overdueCount);
}

function EmptyState() {
  return (
    <div className="max-w-md mx-auto p-4 text-center space-y-4">
      <p className="text-gray-500">No children added yet.</p>
      <AddChildButton />
    </div>
  );
}

function AddChildButton() {
  return (
    <button
      className="w-full min-h-[44px] rounded-lg border-2 border-dashed
                 border-sage-200 text-sage-600 font-medium text-base
                 hover:border-sage-400 transition-colors"
    >
      Add child
    </button>
  );
}
