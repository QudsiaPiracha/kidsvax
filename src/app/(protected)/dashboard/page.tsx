"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChildForm, type ChildFormData } from "@/components/ChildForm";

interface Child {
  id: string;
  name: string;
  date_of_birth: string;
  gender: string;
  is_premature: boolean;
}

export default function DashboardPage(): React.JSX.Element {
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchChildren = useCallback(async () => {
    try {
      const res = await fetch("/api/children");
      if (res.ok) {
        const data = await res.json();
        setChildren(data.children ?? []);
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
      // Navigate to the new child's detail page
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
          {children.map((child) => (
            <ChildListItem
              key={child.id}
              child={child}
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

function ChildListItem({
  child,
  onClick,
}: {
  child: Child;
  onClick: () => void;
}) {
  const age = calculateAge(child.date_of_birth);

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
        <div>
          <p className="font-semibold text-gray-900">{child.name}</p>
          <p className="text-sm text-gray-500">{age}</p>
        </div>
        <div className="ml-auto text-gray-400">→</div>
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
