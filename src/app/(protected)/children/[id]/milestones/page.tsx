"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Child {
  id: string;
  name: string;
}

interface MilestoneRecord {
  id: string;
  achieved: boolean;
  observed_date: string | null;
  milestone: {
    id: string;
    u_exam: string;
    category: string;
    title_en: string;
    title_de: string;
  };
}

type GroupedMilestones = Record<string, MilestoneRecord[]>;

export default function MilestonesPage(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [child, setChild] = useState<Child | null>(null);
  const [groups, setGroups] = useState<GroupedMilestones>({});
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [childRes, msRes] = await Promise.all([
        fetch(`/api/children/${id}`),
        fetch(`/api/children/${id}/milestones`),
      ]);

      if (childRes.ok) {
        const cData = await childRes.json();
        setChild(cData.child);
      }
      if (msRes.ok) {
        const mData = await msRes.json();
        setGroups(mData.milestones ?? {});
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleToggle(recordId: string, currentAchieved: boolean) {
    const today = new Date().toISOString().split("T")[0];
    try {
      await fetch(`/api/milestone-records/${recordId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          achieved: !currentAchieved,
          observed_date: !currentAchieved ? today : null,
        }),
      });

      // Optimistic update
      setGroups((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(next)) {
          next[key] = next[key].map((rec) =>
            rec.id === recordId
              ? { ...rec, achieved: !currentAchieved, observed_date: !currentAchieved ? today : null }
              : rec
          );
        }
        return next;
      });
    } catch {
      // silently fail
    }
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-4 space-y-4">
        <div className="h-5 w-16 animate-pulse rounded bg-sage-100" />
        <div className="h-6 w-40 animate-pulse rounded bg-gray-100" />
        {[1, 2].map((i) => (
          <div key={i} className="rounded-xl border border-sage-100 bg-white p-4 space-y-2">
            <div className="h-4 w-12 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-full animate-pulse rounded bg-gray-50" />
            <div className="h-3 w-3/4 animate-pulse rounded bg-gray-50" />
          </div>
        ))}
      </div>
    );
  }

  const groupKeys = Object.keys(groups);

  return (
    <div className="max-w-md mx-auto p-4 space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push(`/children/${id}`)}
          className="min-h-[44px] min-w-[44px] text-sage-600 font-medium text-sm"
        >
          ← Back
        </button>
      </div>

      <div>
        <h1 className="text-xl font-bold text-gray-900">Milestones</h1>
        {child && <p className="text-sm text-gray-500">for {child.name}</p>}
      </div>

      {groupKeys.length === 0 ? (
        <div className="rounded-2xl border border-sage-100 bg-white p-8 text-center">
          <p className="text-gray-500">No milestones found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupKeys.map((examName) => {
            const records = groups[examName];
            const achieved = records.filter((r) => r.achieved).length;
            return (
              <div key={examName} className="rounded-xl border border-sage-100 bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-sage-700">{examName}</h2>
                  <span className="text-xs text-gray-500">{achieved} / {records.length}</span>
                </div>
                <div className="space-y-2">
                  {records.map((rec) => (
                    <label
                      key={rec.id}
                      className="flex items-start gap-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={rec.achieved}
                        onChange={() => handleToggle(rec.id, rec.achieved)}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-sage-500
                                   focus:ring-sage-500/20 cursor-pointer"
                      />
                      <div className="flex-1">
                        <p className={`text-sm ${rec.achieved ? "text-gray-500 line-through" : "text-gray-900"}`}>
                          {rec.milestone.title_en}
                        </p>
                        <span className="text-xs text-gray-400 capitalize">{rec.milestone.category.replace("_", " ")}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
