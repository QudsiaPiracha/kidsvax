"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatDateDE } from "@/lib/age-utils";
import { GrowthChart } from "@/components/GrowthChart";

interface Child {
  id: string;
  name: string;
  date_of_birth: string;
  gender: string;
}

interface Measurement {
  id: string;
  measured_date: string;
  weight_kg: number | null;
  height_cm: number | null;
  head_circumference_cm: number | null;
  bmi: number | null;
}

export default function GrowthPage(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [child, setChild] = useState<Child | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [headCirc, setHeadCirc] = useState("");
  const [measuredDate, setMeasuredDate] = useState(new Date().toISOString().split("T")[0]);

  const fetchData = useCallback(async () => {
    try {
      const [childRes, growthRes] = await Promise.all([
        fetch(`/api/children/${id}`),
        fetch(`/api/children/${id}/growth`),
      ]);

      if (childRes.ok) {
        const cData = await childRes.json();
        setChild(cData.child);
      }
      if (growthRes.ok) {
        const gData = await growthRes.json();
        setMeasurements(gData.measurements ?? []);
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const body: Record<string, unknown> = { measured_date: measuredDate };
    if (weight) body.weight_kg = parseFloat(weight);
    if (height) body.height_cm = parseFloat(height);
    if (headCirc) body.head_circumference_cm = parseFloat(headCirc);

    try {
      const res = await fetch(`/api/children/${id}/growth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setShowForm(false);
        setWeight("");
        setHeight("");
        setHeadCirc("");
        fetchData();
      }
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div data-testid="growth-skeleton" className="max-w-md mx-auto p-4 space-y-4">
        <div className="h-5 w-16 animate-pulse rounded bg-sage-100" />
        <div className="h-6 w-40 animate-pulse rounded bg-gray-100" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-sage-100 bg-white p-4">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-100 mb-2" />
              <div className="h-3 w-full animate-pulse rounded bg-gray-50" />
            </div>
          ))}
        </div>
      </div>
    );
  }

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

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Growth</h1>
          {child && <p className="text-sm text-gray-500">for {child.name}</p>}
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="min-h-[44px] rounded-lg bg-sage-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sage-600 transition-colors"
          >
            Add Measurement
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border border-sage-100 bg-white p-4 space-y-3">
          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
            <input id="weight" type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500/20" />
          </div>
          <div>
            <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
            <input id="height" type="number" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500/20" />
          </div>
          <div>
            <label htmlFor="headCirc" className="block text-sm font-medium text-gray-700 mb-1">Head Circumference (cm)</label>
            <input id="headCirc" type="number" step="0.1" value={headCirc} onChange={(e) => setHeadCirc(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500/20" />
          </div>
          <div>
            <label htmlFor="measuredDate" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input id="measuredDate" type="date" value={measuredDate} onChange={(e) => setMeasuredDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500/20" />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)}
              className="flex-1 min-h-[44px] rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 min-h-[44px] rounded-lg bg-sage-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sage-600 disabled:opacity-50 transition-colors">
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      )}

      {/* Growth Chart */}
      {child && measurements.length > 0 && (
        <>
          <GrowthChart
            measurements={measurements}
            gender={child.gender}
            dateOfBirth={child.date_of_birth}
          />
          <button
            onClick={() => router.push(`/children/${id}/insights`)}
            className="w-full text-center text-sm text-sage-600 font-medium hover:text-sage-700 transition-colors py-2"
          >
            View Growth Insights →
          </button>
        </>
      )}

      {measurements.length === 0 ? (
        <div className="rounded-2xl border border-sage-100 bg-white p-8 text-center">
          <p className="text-gray-500">No measurements recorded yet.</p>
          <p className="mt-1 text-sm text-gray-400">Add a measurement to start tracking growth.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {[...measurements].reverse().map((m) => (
            <div key={m.id} className="rounded-lg border border-sage-100 bg-white p-4">
              <p className="text-xs text-gray-500 mb-1">{formatDateDE(m.measured_date)}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {m.weight_kg != null && <span className="text-gray-900">{m.weight_kg} kg</span>}
                {m.height_cm != null && <span className="text-gray-900">{m.height_cm} cm</span>}
                {m.head_circumference_cm != null && <span className="text-gray-900">HC {m.head_circumference_cm} cm</span>}
                {m.bmi != null && <span className="text-gray-500">BMI {m.bmi.toFixed(1)}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
