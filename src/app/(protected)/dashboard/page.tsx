"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChildForm, type ChildFormData } from "@/components/ChildForm";
import { formatDateDE, calculateCountdown } from "@/lib/age-utils";

interface Child {
  id: string;
  name: string;
  date_of_birth: string;
  gender: string;
  is_premature: boolean;
}

interface ScheduleItem {
  childId: string;
  childName: string;
  name: string;
  type: "u_exam" | "vaccination";
  status: string;
  scheduledDate: string;
}

interface ChildStats {
  uExamsCompleted: number;
  uExamsTotal: number;
  vaccinationsCompleted: number;
  vaccinationsTotal: number;
  overdueCount: number;
  nextUp: ScheduleItem | null;
}

export default function DashboardPage(): React.JSX.Element {
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [notifications, setNotifications] = useState<ScheduleItem[]>([]);
  const [childStats, setChildStats] = useState<Record<string, ChildStats>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchChildren = useCallback(async () => {
    try {
      const res = await fetch("/api/children");
      if (res.ok) {
        const data = await res.json();
        const kids = (data.children ?? []) as Child[];
        setChildren(kids);

        if (kids.length > 0) {
          const { items, stats } = await fetchAllSchedules(kids);
          setNotifications(items);
          setChildStats(stats);
        }
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  async function handleAddChild(data: ChildFormData) {
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to add child");
        setSaving(false);
        return;
      }

      const result = await res.json();
      setShowForm(false);
      setSaving(false);
      router.push(`/children/${result.child.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-4 space-y-4">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-7 w-32 animate-pulse rounded-lg bg-sage-100" />
          <div className="h-5 w-16 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="rounded-xl border border-sage-100 bg-white p-4">
          <div className="h-4 w-40 animate-pulse rounded bg-gray-100 mb-3" />
          <div className="space-y-2">
            <div className="h-12 w-full animate-pulse rounded bg-gray-50" />
            <div className="h-12 w-full animate-pulse rounded bg-gray-50" />
          </div>
        </div>
        {[1, 2].map((i) => (
          <div key={i} className="rounded-xl border border-sage-100 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-sage-100" />
              <div className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
                <div className="h-3 w-16 animate-pulse rounded bg-gray-50" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="max-w-md mx-auto p-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Add Child</h1>
          <button
            onClick={() => setShowForm(false)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-terracotta-50 p-4">
            <p className="text-sm text-terracotta-600">{error}</p>
          </div>
        )}

        <ChildForm onSubmit={handleAddChild} isLoading={saving} />
      </div>
    );
  }

  const overdueItems = notifications.filter((n) => n.status === "overdue");
  const upcomingItems = notifications.filter((n) => n.status === "upcoming");

  // Sort children by urgency: most overdue first, then soonest upcoming
  const sortedChildren = [...children].sort((a, b) => {
    const aStats = childStats[a.id];
    const bStats = childStats[b.id];
    const aOverdue = aStats?.overdueCount ?? 0;
    const bOverdue = bStats?.overdueCount ?? 0;
    if (aOverdue !== bOverdue) return bOverdue - aOverdue;
    const aNext = aStats?.nextUp?.scheduledDate;
    const bNext = bStats?.nextUp?.scheduledDate;
    if (aNext && bNext) return new Date(aNext).getTime() - new Date(bNext).getTime();
    if (aNext) return -1;
    if (bNext) return 1;
    return 0;
  });

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">My Children</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Settings
          </Link>
          <LogoutButton />
        </div>
      </div>

      {/* Notifications */}
      {children.length > 0 && (
        <div className="mb-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Notifications</h2>

          {overdueItems.length > 0 && (
            <div className="rounded-xl border border-terracotta-200 bg-terracotta-50 p-4">
              <h3 className="text-sm font-semibold text-terracotta-700 mb-2">
                Overdue ({overdueItems.length})
              </h3>
              <ul className="space-y-2">
                {overdueItems.map((item, i) => (
                  <li key={`overdue-${i}`}>
                    <button
                      onClick={() => router.push(`/children/${item.childId}/schedule`)}
                      className="w-full text-left flex items-start gap-2 text-sm"
                    >
                      <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-terracotta-400" />
                      <span>
                        <span className="font-medium text-gray-900">{item.name}</span>
                        <span className="text-gray-500"> for {item.childName}</span>
                        <span className="text-terracotta-500 text-xs ml-1">
                          (was due {formatDateDE(item.scheduledDate)})
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {upcomingItems.length > 0 && (
            <div className="rounded-xl border border-warm-amber-200 bg-warm-amber-50 p-4">
              <h3 className="text-sm font-semibold text-warm-amber-700 mb-2">
                Coming Up ({upcomingItems.length})
              </h3>
              <ul className="space-y-2">
                {upcomingItems.map((item, i) => (
                  <li key={`upcoming-${i}`}>
                    <button
                      onClick={() => router.push(`/children/${item.childId}/schedule`)}
                      className="w-full text-left flex items-start gap-2 text-sm"
                    >
                      <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-warm-amber-400" />
                      <span>
                        <span className="font-medium text-gray-900">{item.name}</span>
                        <span className="text-gray-500"> for {item.childName}</span>
                        {(() => {
                          const cd = calculateCountdown(item.scheduledDate);
                          return cd ? (
                            <span className="text-warm-amber-600 text-xs ml-1">
                              (in {cd})
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs ml-1">
                              ({formatDateDE(item.scheduledDate)})
                            </span>
                          );
                        })()}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {overdueItems.length === 0 && upcomingItems.length === 0 && (
            <div className="rounded-xl border border-sage-100 bg-sage-50 p-4 text-center">
              <p className="text-sm text-sage-600">
                All caught up! No upcoming appointments in the next 2 weeks.
              </p>
            </div>
          )}
        </div>
      )}

      {children.length === 0 ? (
        <div className="rounded-2xl border border-sage-100 bg-white p-8 text-center">
          <div className="mb-3 text-4xl">👶</div>
          <h2 className="text-lg font-semibold text-gray-900">No children yet</h2>
          <p className="mt-1 text-sm text-gray-500">
            Add your first child to start tracking their health records.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-6 min-h-[44px] w-full rounded-lg bg-sage-500 px-4 py-2.5
                       text-sm font-semibold text-white hover:bg-sage-600 transition-colors"
          >
            Add Your First Child
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedChildren.map((child) => (
            <ChildListItem
              key={child.id}
              child={child}
              stats={childStats[child.id] ?? null}
              onClick={() => router.push(`/children/${child.id}`)}
            />
          ))}
          <button
            onClick={() => setShowForm(true)}
            className="w-full min-h-[44px] rounded-lg border-2 border-dashed
                       border-sage-200 text-sage-600 font-medium text-sm
                       hover:border-sage-400 hover:bg-sage-50 transition-colors"
          >
            + Add another child
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Fetch schedules for all children — returns notification items + per-child stats
// ---------------------------------------------------------------------------

interface FetchResult {
  items: ScheduleItem[];
  stats: Record<string, ChildStats>;
}

async function fetchAllSchedules(kids: Child[]): Promise<FetchResult> {
  const statsMap: Record<string, ChildStats> = {};

  const results = await Promise.all(
    kids.map(async (child) => {
      const stat: ChildStats = {
        uExamsCompleted: 0,
        uExamsTotal: 0,
        vaccinationsCompleted: 0,
        vaccinationsTotal: 0,
        overdueCount: 0,
        nextUp: null,
      };

      try {
        const [uRes, vRes] = await Promise.all([
          fetch(`/api/children/${child.id}/u-exams`),
          fetch(`/api/children/${child.id}/vaccinations`),
        ]);

        const notificationItems: ScheduleItem[] = [];
        // Track earliest future item for "next up" (any not-completed, not-skipped)
        let earliestFuture: ScheduleItem | null = null;

        if (uRes.ok) {
          const uData = await uRes.json();
          for (const rec of uData.records ?? []) {
            stat.uExamsTotal++;
            const status = computeStatus(rec.status, rec.scheduled_date);
            if (status === "completed") {
              stat.uExamsCompleted++;
            } else if (status === "overdue") {
              stat.overdueCount++;
              notificationItems.push({
                childId: child.id,
                childName: child.name,
                name: rec.u_exams?.name ?? rec.name ?? "U-Exam",
                type: "u_exam",
                status,
                scheduledDate: rec.scheduled_date,
              });
            } else if (status === "upcoming") {
              const item: ScheduleItem = {
                childId: child.id,
                childName: child.name,
                name: rec.u_exams?.name ?? rec.name ?? "U-Exam",
                type: "u_exam",
                status,
                scheduledDate: rec.scheduled_date,
              };
              notificationItems.push(item);
              if (!earliestFuture || new Date(rec.scheduled_date) < new Date(earliestFuture.scheduledDate)) {
                earliestFuture = item;
              }
            } else if (status === "scheduled") {
              // Not in notification list, but track for "next up"
              const item: ScheduleItem = {
                childId: child.id,
                childName: child.name,
                name: rec.u_exams?.name ?? rec.name ?? "U-Exam",
                type: "u_exam",
                status,
                scheduledDate: rec.scheduled_date,
              };
              if (!earliestFuture || new Date(rec.scheduled_date) < new Date(earliestFuture.scheduledDate)) {
                earliestFuture = item;
              }
            }
          }
        }

        if (vRes.ok) {
          const vData = await vRes.json();
          for (const rec of vData.records ?? []) {
            stat.vaccinationsTotal++;
            const status = computeStatus(rec.status, rec.scheduled_date);
            const vacName = rec.vaccines?.name_en ?? "Vaccination";
            if (status === "completed") {
              stat.vaccinationsCompleted++;
            } else if (status === "overdue") {
              stat.overdueCount++;
              notificationItems.push({
                childId: child.id,
                childName: child.name,
                name: `${vacName} (Dose ${rec.dose_number})`,
                type: "vaccination",
                status,
                scheduledDate: rec.scheduled_date,
              });
            } else if (status === "upcoming") {
              const item: ScheduleItem = {
                childId: child.id,
                childName: child.name,
                name: `${vacName} (Dose ${rec.dose_number})`,
                type: "vaccination",
                status,
                scheduledDate: rec.scheduled_date,
              };
              notificationItems.push(item);
              if (!earliestFuture || new Date(rec.scheduled_date) < new Date(earliestFuture.scheduledDate)) {
                earliestFuture = item;
              }
            } else if (status === "scheduled") {
              const item: ScheduleItem = {
                childId: child.id,
                childName: child.name,
                name: `${vacName} (Dose ${rec.dose_number})`,
                type: "vaccination",
                status,
                scheduledDate: rec.scheduled_date,
              };
              if (!earliestFuture || new Date(rec.scheduled_date) < new Date(earliestFuture.scheduledDate)) {
                earliestFuture = item;
              }
            }
          }
        }

        stat.nextUp = earliestFuture;
        statsMap[child.id] = stat;
        return notificationItems;
      } catch {
        statsMap[child.id] = stat;
        return [];
      }
    })
  );

  const all = results.flat();
  // Sort: overdue first (by date ascending), then upcoming (by date ascending)
  const sorted = all.sort((a, b) => {
    if (a.status !== b.status) return a.status === "overdue" ? -1 : 1;
    return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
  });

  return { items: sorted, stats: statsMap };
}

function computeStatus(status: string, scheduledDate: string): string {
  if (status === "completed" || status === "administered") return "completed";
  if (status === "skipped") return "skipped";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const scheduled = new Date(scheduledDate);
  scheduled.setHours(0, 0, 0, 0);

  if (scheduled < today) return "overdue";
  const twoWeeks = new Date(today);
  twoWeeks.setDate(twoWeeks.getDate() + 14);
  if (scheduled <= twoWeeks) return "upcoming";
  return "scheduled";
}

// ---------------------------------------------------------------------------
// Child list item with overdue badge, next-up, and progress stats
// ---------------------------------------------------------------------------

function ChildListItem({
  child,
  stats,
  onClick,
}: {
  child: Child;
  stats: ChildStats | null;
  onClick: () => void;
}) {
  const age = calculateAge(child.date_of_birth);
  const overdueCount = stats?.overdueCount ?? 0;
  const nextUp = stats?.nextUp ?? null;

  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl border border-sage-100 bg-white p-4 text-left
                 hover:border-sage-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-100 text-lg">
          {child.gender === "female" ? "👧" : "👦"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900">{child.name}</p>
            {overdueCount > 0 && (
              <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-terracotta-50 text-terracotta-500">
                {overdueCount} overdue
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">{age}</p>
          {nextUp && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">
              Next: {nextUp.name}
              {(() => {
                const cd = calculateCountdown(nextUp.scheduledDate);
                return cd ? ` (${cd})` : ` (${formatDateDE(nextUp.scheduledDate)})`;
              })()}
            </p>
          )}
          {stats && (
            <div className="flex gap-3 mt-1.5">
              <span className="text-xs text-gray-400">
                U-Exams: {stats.uExamsCompleted}/{stats.uExamsTotal}
              </span>
              <span className="text-xs text-gray-400">
                Vaccinations: {stats.vaccinationsCompleted}/{stats.vaccinationsTotal}
              </span>
            </div>
          )}
        </div>
        <div className="ml-auto text-gray-400 shrink-0">&rarr;</div>
      </div>
    </button>
  );
}

function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const { createBrowserClient } = await import("@/lib/supabase-browser");
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
    >
      Sign out
    </button>
  );
}

function calculateAge(dob: string): string {
  const birth = new Date(dob);
  const now = new Date();
  const months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth());

  if (months < 1) {
    const days = Math.floor(
      (now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24)
    );
    return `${days} day${days !== 1 ? "s" : ""} old`;
  }
  if (months < 24) {
    return `${months} month${months !== 1 ? "s" : ""} old`;
  }
  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? "s" : ""} old`;
}
