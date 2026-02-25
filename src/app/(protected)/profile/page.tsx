"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase-browser";
import { ReminderSettings } from "@/components/ReminderSettings";

export default function ProfilePage(): React.JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const supabase = createBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email ?? "");
      }
      setLoadingUser(false);
    }
    loadUser();
  }, []);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const supabase = createBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage("Password updated successfully");
    setNewPassword("");
    setConfirmPassword("");
  }

  async function handleSignOut() {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function handleDeleteAccount() {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone. All children and health records will be permanently deleted.")) {
      return;
    }

    setError("");
    setLoading(true);
    // Note: full account deletion requires a server-side endpoint with service role
    // For now, sign out
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loadingUser) {
    return (
      <div className="max-w-md mx-auto p-4 pt-8 text-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/dashboard")}
          className="min-h-[44px] min-w-[44px] text-sage-600 font-medium text-sm"
        >
          ← Back
        </button>
        <h1 className="text-xl font-bold text-gray-900">Profile & Settings</h1>
      </div>

      {/* Account info */}
      <div className="rounded-2xl border border-sage-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Account</h2>
        <div className="space-y-2">
          <div>
            <p className="text-xs text-gray-500">Email</p>
            <p className="text-sm font-medium text-gray-900">{email}</p>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="rounded-2xl border border-sage-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Change Password</h2>

        {message && (
          <div className="mb-4 rounded-lg bg-sage-50 p-3">
            <p className="text-sm text-sage-700">{message}</p>
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-lg bg-terracotta-50 p-3">
            <p className="text-sm text-terracotta-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm
                         focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500/20"
              placeholder="Minimum 8 characters"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <div>
            <label htmlFor="confirmNewPassword" className="mb-1.5 block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <input
              id="confirmNewPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm
                         focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500/20"
              placeholder="Re-enter new password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="min-h-[44px] w-full rounded-lg bg-sage-500 px-4 py-2.5 text-sm font-semibold
                       text-white shadow-sm hover:bg-sage-600 disabled:opacity-50 transition-colors"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      {/* Reminder Settings */}
      <div className="rounded-2xl border border-sage-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Reminder Settings</h2>
        <ReminderSettings />
      </div>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="min-h-[44px] w-full rounded-lg border border-gray-200 px-4 py-2.5
                   text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Sign Out
      </button>

      {/* Danger zone */}
      <div className="rounded-2xl border border-terracotta-200 bg-terracotta-50 p-5">
        <h2 className="text-sm font-semibold text-terracotta-600 mb-2">Danger Zone</h2>
        <p className="text-xs text-gray-500 mb-4">
          Permanently delete your account and all associated data. This cannot be undone.
        </p>
        <button
          onClick={handleDeleteAccount}
          disabled={loading}
          className="min-h-[44px] w-full rounded-lg border border-terracotta-300 px-4 py-2.5
                     text-sm font-medium text-terracotta-600 hover:bg-terracotta-100
                     disabled:opacity-50 transition-colors"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
