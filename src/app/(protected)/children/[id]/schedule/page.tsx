"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Timeline } from "@/components/Timeline";
import type { TimelineItemData } from "@/components/Timeline/TimelineItem";
import {
  transformUExamToTimelineItem,
  transformVaccinationToTimelineItem,
  mergeAndSortTimelineItems,
} from "@/lib/schedule-page-utils";

interface Child {
  id: string;
  name: string;
  date_of_birth: string;
}

export default function SchedulePage(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [child, setChild] = useState<Child | null>(null);
  const [items, setItems] = useState<TimelineItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [childRes, uRes, vRes] = await Promise.all([
        fetch(`/api/children/${id}`),
        fetch(`/api/children/${id}/u-exams`),
        fetch(`/api/children/${id}/vaccinations`),
      ]);

      if (!childRes.ok) {
        setError("Failed to load schedule");
        setLoading(false);
        return;
      }

      const childData = await childRes.json();
      const childInfo = childData.child;
      setChild(childInfo);

      const uExamItems: TimelineItemData[] = [];
      const vaccItems: TimelineItemData[] = [];

      if (uRes.ok) {
        const uData = await uRes.json();
        for (const rec of uData.records ?? []) {
          uExamItems.push(transformUExamToTimelineItem(rec, childInfo.date_of_birth));
        }
      }

      if (vRes.ok) {
        const vData = await vRes.json();
        for (const rec of vData.records ?? []) {
          vaccItems.push(transformVaccinationToTimelineItem(rec, childInfo.date_of_birth));
        }
      }

      setItems(mergeAndSortTimelineItems(uExamItems, vaccItems));
    } catch {
      setError("Failed to load schedule");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleMarkComplete(itemId: string) {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const endpoint =
      item.type === "u_exam"
        ? `/api/u-exam-records/${itemId}`
        : `/api/vaccination-records/${itemId}`;

    const today = new Date().toISOString().split("T")[0];
    const body =
      item.type === "u_exam"
        ? { status: "completed", completed_date: today, physician_name: "—" }
        : { status: "administered", administered_date: today, physician_name: "—" };

    try {
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        fetchData();
      }
    } catch {
      // silently fail, data stays unchanged
    }
  }

  if (loading) {
    return (
      <div data-testid="schedule-skeleton" className="max-w-md mx-auto p-4 space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-5 w-16 animate-pulse rounded bg-sage-100" />
          <div className="ml-auto h-5 w-20 animate-pulse rounded bg-sage-100" />
        </div>
        <div className="space-y-3">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
          <div className="border-l-2 border-sage-100 ml-1.5 space-y-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <div className="h-3 w-3 animate-pulse rounded-full bg-gray-200" />
                <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                <div className="ml-auto h-3 w-16 animate-pulse rounded bg-gray-50" />
              </div>
            ))}
          </div>
          <div className="h-4 w-28 animate-pulse rounded bg-gray-100 mt-4" />
          <div className="border-l-2 border-sage-100 ml-1.5 space-y-1">
            {[4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <div className="h-3 w-3 animate-pulse rounded-full bg-gray-200" />
                <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
                <div className="ml-auto h-3 w-16 animate-pulse rounded bg-gray-50" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !child) {
    return (
      <div className="max-w-md mx-auto p-4 pt-8 text-center">
        <p className="text-terracotta-500">{error || "Failed to load schedule"}</p>
        <button
          onClick={() => router.push(`/children/${id}`)}
          className="mt-4 text-sm text-sage-600 hover:text-sage-700"
        >
          Back to child
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto p-4">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push(`/children/${id}`)}
            className="min-h-[44px] min-w-[44px] text-sage-600 font-medium text-sm"
          >
            ← Back
          </button>
        </div>
        <div className="rounded-2xl border border-sage-100 bg-white p-8 text-center">
          <p className="text-gray-500">No schedule items found for {child.name}.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-md mx-auto p-4 pb-0">
        <button
          onClick={() => router.push(`/children/${id}`)}
          className="min-h-[44px] min-w-[44px] text-sage-600 font-medium text-sm"
        >
          ← Back
        </button>
      </div>
      <Timeline
        items={items}
        childName={child.name}
        onChildSelect={() => {}}
        onMarkComplete={handleMarkComplete}
      />
    </div>
  );
}
