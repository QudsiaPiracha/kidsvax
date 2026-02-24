"use client";

import { useState } from "react";
import Link from "next/link";
import { resetPassword } from "@/lib/auth";

function ForgotPasswordPage(): React.JSX.Element {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await resetPassword(email);
    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="mb-4 text-4xl">📧</div>
        <h1 className="mb-3 text-2xl font-bold text-gray-900">
          Check your email
        </h1>
        <p className="mb-8 text-sm text-gray-500">
          We sent a password reset link to <strong className="text-gray-700">{email}</strong>.
        </p>
        <Link
          href="/login"
          className="text-sm font-medium text-sage-600 hover:text-sage-700"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Reset password</h1>
        <p className="mt-1 text-sm text-gray-500">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-terracotta-50 p-4">
          <p className="text-sm text-terracotta-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm
                       placeholder:text-gray-400
                       focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500/20"
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="min-h-[44px] w-full rounded-lg bg-sage-500 px-4 py-2.5 text-sm font-semibold
                     text-white shadow-sm hover:bg-sage-600 disabled:opacity-50 transition-colors"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-500">
        <Link href="/login" className="font-medium text-sage-600 hover:text-sage-700">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

export default ForgotPasswordPage;
