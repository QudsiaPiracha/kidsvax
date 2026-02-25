"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Child {
  id: string;
  name: string;
  date_of_birth: string;
  gender: string;
  is_premature: boolean;
  allergies?: string;
  notes?: string;
}

interface UExamRecord {
  id: string;
  status: string;
  exam_name?: string;
  u_exam?: { name: string };
  scheduled_date: string;
  completed_date?: string;
}

interface VaccRecord {
  id: string;
  status: string;
  vaccine_name?: string;
  vaccine?: { name: string };
  scheduled_date: string;
  completed_date?: string;
}

export default function ChildDetailPage(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [child, setChild] = useState<Child | null>(null);
  const [uExams, setUExams] = useState<UExamRecord[]>([]);
  const [vaccinations, setVaccinations] = useState<VaccRecord[]>([]);
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
        setError("Child not found");
        setLoading(false);
        return;
      }

      const childData = await childRes.json();
      setChild(childData.child);

      if (uRes.ok) {
        const uData = await uRes.json();
        setUExams(uData.records ?? []);
      }
      if (vRes.ok) {
        const vData = await vRes.json();
        setVaccinations(vData.records ?? []);
      }
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-4 space-y-5">
        <div className="h-5 w-16 animate-pulse rounded bg-sage-100" />
        <div className="rounded-2xl border border-sage-100 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 animate-pulse rounded-full bg-sage-100" />
            <div className="space-y-2">
              <div className="h-5 w-28 animate-pulse rounded bg-gray-100" />
              <div className="h-3 w-40 animate-pulse rounded bg-gray-50" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-sage-100 bg-white p-4">
            <div className="h-3 w-16 animate-pulse rounded bg-gray-50 mb-2" />
            <div className="h-5 w-12 animate-pulse rounded bg-gray-100" />
          </div>
          <div className="rounded-xl border border-sage-100 bg-white p-4">
            <div className="h-3 w-20 animate-pulse rounded bg-gray-50 mb-2" />
            <div className="h-5 w-12 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
        <div className="rounded-xl border border-sage-100 bg-white p-4 space-y-2">
          <div className="h-3 w-20 animate-pulse rounded bg-gray-50" />
          <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
        </div>
      </div>
    );
  }

  if (error || !child) {
    return (
      <div className="max-w-md mx-auto p-4 pt-8 text-center">
        <p className="text-terracotta-500">{error || "Child not found"}</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-4 text-sm text-sage-600 hover:text-sage-700"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  const age = calculateAge(child.date_of_birth);
  const completedExams = uExams.filter((e) => e.status === "completed").length;
  const completedVacc = vaccinations.filter((v) => v.status === "completed").length;
  const overdueExams = uExams.filter((e) => e.status === "overdue");
  const overdueVacc = vaccinations.filter((v) => v.status === "overdue");
  const upcomingExams = uExams.filter((e) => e.status === "scheduled" || e.status === "upcoming");
  const upcomingVacc = vaccinations.filter((v) => v.status === "scheduled" || v.status === "upcoming");

  return (
    <div className="max-w-md mx-auto p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/dashboard")}
          className="min-h-[44px] min-w-[44px] text-sage-600 font-medium text-sm"
        >
          ← Back
        </button>
      </div>

      {/* Child info */}
      <div className="rounded-2xl border border-sage-100 bg-white p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sage-100 text-2xl">
            {child.gender === "female" ? "👧" : "👦"}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{child.name}</h1>
            <p className="text-sm text-gray-500">{age} · Born {formatDate(child.date_of_birth)}</p>
          </div>
        </div>
        {child.is_premature && (
          <span className="mt-2 inline-block rounded-full bg-warm-amber-100 px-2 py-0.5 text-xs text-warm-amber-700">
            Premature
          </span>
        )}
        {child.allergies && (
          <p className="mt-2 text-sm text-gray-500">Allergies: {child.allergies}</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-sage-100 bg-white p-4">
          <p className="text-xs text-gray-500">U-Exams</p>
          <p className="text-lg font-bold text-gray-900">{completedExams} / {uExams.length}</p>
        </div>
        <div className="rounded-xl border border-sage-100 bg-white p-4">
          <p className="text-xs text-gray-500">Vaccinations</p>
          <p className="text-lg font-bold text-gray-900">{completedVacc} / {vaccinations.length}</p>
        </div>
      </div>

      {/* Overdue */}
      {(overdueExams.length > 0 || overdueVacc.length > 0) && (
        <div className="rounded-xl border border-terracotta-200 bg-terracotta-50 p-4">
          <h2 className="text-sm font-semibold text-terracotta-600 mb-2">Overdue</h2>
          <ul className="space-y-1">
            {overdueExams.map((e) => (
              <li key={e.id} className="text-sm text-gray-700">
                {e.exam_name || e.u_exam?.name || "U-Exam"} — {formatDate(e.scheduled_date)}
              </li>
            ))}
            {overdueVacc.map((v) => (
              <li key={v.id} className="text-sm text-gray-700">
                {v.vaccine_name || v.vaccine?.name || "Vaccination"} — {formatDate(v.scheduled_date)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Upcoming */}
      {(upcomingExams.length > 0 || upcomingVacc.length > 0) && (
        <div className="rounded-xl border border-warm-amber-200 bg-warm-amber-50 p-4">
          <h2 className="text-sm font-semibold text-warm-amber-600 mb-2">Coming Up</h2>
          <ul className="space-y-1">
            {[...upcomingExams.slice(0, 3)].map((e) => (
              <li key={e.id} className="text-sm text-gray-700">
                {e.exam_name || e.u_exam?.name || "U-Exam"} — {formatDate(e.scheduled_date)}
              </li>
            ))}
            {[...upcomingVacc.slice(0, 3)].map((v) => (
              <li key={v.id} className="text-sm text-gray-700">
                {v.vaccine_name || v.vaccine?.name || "Vaccination"} — {formatDate(v.scheduled_date)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quick links */}
      <div className="space-y-2">
        <Link
          href={`/children/${id}/schedule`}
          className="flex items-center justify-between w-full rounded-xl border border-sage-100 bg-white p-4
                     hover:border-sage-300 transition-colors"
        >
          <span className="text-sm font-medium text-gray-900">Full Schedule</span>
          <span className="text-gray-400">→</span>
        </Link>
        <Link
          href={`/children/${id}/scan`}
          className="flex items-center justify-between w-full rounded-xl border border-sage-100 bg-white p-4
                     hover:border-sage-300 transition-colors"
        >
          <span className="text-sm font-medium text-gray-900">Scan Document</span>
          <span className="text-gray-400">→</span>
        </Link>
      </div>
    </div>
  );
}

function calculateAge(dob: string): string {
  const birth = new Date(dob);
  const now = new Date();
  const months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth());

  if (months < 1) {
    const days = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    return `${days} day${days !== 1 ? "s" : ""} old`;
  }
  if (months < 24) {
    return `${months} month${months !== 1 ? "s" : ""} old`;
  }
  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? "s" : ""} old`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}.${d.getFullYear()}`;
}
