"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Child {
  id: string;
  name: string;
}

interface InsightContent {
  growth_summary?: string;
  dietary_suggestions?: string;
  activity_tips?: string;
  doctor_questions?: string;
}

interface InsightRecord {
  id: string;
  content: string;
  language: string;
  created_at: string;
  expires_at: string;
}

export default function InsightsPage(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [child, setChild] = useState<Child | null>(null);
  const [insight, setInsight] = useState<InsightContent | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [childRes, insRes] = await Promise.all([
        fetch(`/api/children/${id}`),
        fetch(`/api/children/${id}/insights?lang=en`),
      ]);

      if (childRes.ok) {
        const cData = await childRes.json();
        setChild(cData.child);
      }
      if (insRes.ok) {
        const iData = await insRes.json();
        const records = iData.insights ?? [];
        if (records.length > 0) {
          const latest = records[0] as InsightRecord;
          try {
            const parsed = typeof latest.content === "string"
              ? JSON.parse(latest.content) as InsightContent
              : latest.content as InsightContent;
            setInsight(parsed);
            setCreatedAt(latest.created_at);
          } catch {
            setInsight(null);
          }
        }
      }
    } catch {
      setError("Failed to load insights");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleRefresh() {
    setRefreshing(true);
    setError("");
    try {
      const res = await fetch(`/api/children/${id}/insights/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: "en" }),
      });
      if (res.ok) {
        await fetchData();
      } else {
        const errData = await res.json().catch(() => ({}));
        const msg = (errData as Record<string, string>).error || "Could not generate insights. Please try again.";
        setError(msg);
      }
    } catch {
      setError("Could not generate insights. Please try again later.");
    } finally {
      setRefreshing(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-4 space-y-4">
        <div className="h-5 w-16 animate-pulse rounded bg-sage-100" />
        <div className="h-6 w-40 animate-pulse rounded bg-gray-100" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-sage-100 bg-white p-4">
              <div className="h-4 w-32 animate-pulse rounded bg-gray-100 mb-2" />
              <div className="h-3 w-full animate-pulse rounded bg-gray-50" />
              <div className="h-3 w-3/4 animate-pulse rounded bg-gray-50 mt-1" />
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
          <h1 className="text-xl font-bold text-gray-900">Insights</h1>
          {child && <p className="text-sm text-gray-500">for {child.name}</p>}
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="min-h-[44px] rounded-lg border border-sage-200 px-4 py-2 text-sm font-medium
                     text-sage-600 hover:bg-sage-50 disabled:opacity-50 transition-colors"
        >
          {refreshing ? "Generating..." : "Refresh Insights"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-terracotta-50 p-3">
          <p className="text-sm text-terracotta-600">{error}</p>
        </div>
      )}

      {!insight ? (
        <div className="rounded-2xl border border-sage-100 bg-white p-8 text-center">
          <p className="text-gray-500">No insights yet for {child?.name ?? "this child"}.</p>
          <p className="mt-1 text-sm text-gray-400">
            Tap &quot;Refresh Insights&quot; to generate personalized guidance based on growth data.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {createdAt && (
            <p className="text-xs text-gray-400">
              Last updated: {new Date(createdAt).toLocaleDateString("en-GB")}
            </p>
          )}

          {insight.growth_summary && (
            <InsightCard title="Growth Summary" content={insight.growth_summary} />
          )}
          {insight.dietary_suggestions && (
            <InsightCard title="Dietary Suggestions" content={insight.dietary_suggestions} />
          )}
          {insight.activity_tips && (
            <InsightCard title="Activity Tips" content={insight.activity_tips} />
          )}
          {insight.doctor_questions && (
            <InsightCard title="Questions for Your Pediatrician" content={insight.doctor_questions} />
          )}

          <div className="rounded-lg bg-warm-amber-50 border border-warm-amber-200 p-3">
            <p className="text-xs text-warm-amber-700">
              General guidance, not medical advice. Always consult your pediatrician for health decisions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function InsightCard({ title, content }: { title: string; content: string }) {
  return (
    <div className="rounded-xl border border-sage-100 bg-white p-4">
      <h3 className="text-sm font-semibold text-sage-700 mb-2">{title}</h3>
      <p className="text-sm text-gray-700 leading-relaxed">{content}</p>
    </div>
  );
}
