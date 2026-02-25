"use client";

import React, { useCallback, useEffect, useState } from "react";

interface Preferences {
  u_exam_reminders: boolean;
  vaccination_reminders: boolean;
  reminder_days_before_u_exam: number;
  reminder_days_before_vaccination: number;
}

export function ReminderSettings(): React.JSX.Element {
  const [prefs, setPrefs] = useState<Preferences>({
    u_exam_reminders: true,
    vaccination_reminders: true,
    reminder_days_before_u_exam: 14,
    reminder_days_before_vaccination: 7,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchPrefs = useCallback(async () => {
    try {
      const res = await fetch("/api/reminders");
      if (res.ok) {
        const data = await res.json();
        if (data.preferences) {
          setPrefs({
            u_exam_reminders: data.preferences.u_exam_reminders ?? true,
            vaccination_reminders: data.preferences.vaccination_reminders ?? true,
            reminder_days_before_u_exam: data.preferences.reminder_days_before_u_exam ?? 14,
            reminder_days_before_vaccination: data.preferences.reminder_days_before_vaccination ?? 7,
          });
        }
      }
    } catch {
      // use defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrefs();
  }, [fetchPrefs]);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/reminders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
        <div className="h-8 w-full animate-pulse rounded bg-gray-50" />
        <div className="h-8 w-full animate-pulse rounded bg-gray-50" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label htmlFor="uExamReminders" className="text-sm text-gray-700">U-Exam Reminders</label>
        <input
          id="uExamReminders"
          type="checkbox"
          checked={prefs.u_exam_reminders}
          onChange={(e) => setPrefs({ ...prefs, u_exam_reminders: e.target.checked })}
          className="h-4 w-4 rounded border-gray-300 text-sage-500 focus:ring-sage-500/20"
        />
      </div>

      {prefs.u_exam_reminders && (
        <div>
          <label htmlFor="daysBeforeUExam" className="block text-xs text-gray-500 mb-1">
            Days before U-Exam to remind
          </label>
          <input
            id="daysBeforeUExam"
            type="number"
            min={1}
            max={30}
            value={prefs.reminder_days_before_u_exam}
            onChange={(e) => setPrefs({ ...prefs, reminder_days_before_u_exam: parseInt(e.target.value) || 14 })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                       focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500/20"
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        <label htmlFor="vaccReminders" className="text-sm text-gray-700">Vaccination Reminders</label>
        <input
          id="vaccReminders"
          type="checkbox"
          checked={prefs.vaccination_reminders}
          onChange={(e) => setPrefs({ ...prefs, vaccination_reminders: e.target.checked })}
          className="h-4 w-4 rounded border-gray-300 text-sage-500 focus:ring-sage-500/20"
        />
      </div>

      {prefs.vaccination_reminders && (
        <div>
          <label htmlFor="daysBeforeVacc" className="block text-xs text-gray-500 mb-1">
            Days before Vaccination to remind
          </label>
          <input
            id="daysBeforeVacc"
            type="number"
            min={1}
            max={30}
            value={prefs.reminder_days_before_vaccination}
            onChange={(e) => setPrefs({ ...prefs, reminder_days_before_vaccination: parseInt(e.target.value) || 7 })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                       focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500/20"
          />
        </div>
      )}

      <p className="text-xs text-gray-400">
        Reminders are sent via email to your registered address.
      </p>

      <button
        onClick={handleSave}
        disabled={saving}
        className="min-h-[44px] w-full rounded-lg bg-sage-500 px-4 py-2.5 text-sm font-semibold
                   text-white hover:bg-sage-600 disabled:opacity-50 transition-colors"
      >
        {saving ? "Saving..." : "Save Reminder Settings"}
      </button>

      {saved && (
        <p className="text-sm text-sage-600 text-center">Settings saved successfully.</p>
      )}
    </div>
  );
}
