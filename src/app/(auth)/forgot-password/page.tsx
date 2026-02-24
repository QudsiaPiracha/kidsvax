"use client";

import { useState } from "react";
import Link from "next/link";
import { resetPassword } from "@/lib/auth";

export function ForgotPasswordPage(): React.JSX.Element {
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
        <h1 className="mb-4 text-2xl font-semibold text-gray-900">
          Check Your Email
        </h1>
        <p className="mb-6 text-sm text-gray-600">
          We sent a password reset link to <strong>{email}</strong>.
        </p>
        <Link
          href="/login"
          className="text-sm text-sage-600 hover:text-sage-700"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-2 text-center text-2xl font-semibold text-gray-900">
        Reset Password
      </h1>
      <p className="mb-6 text-center text-sm text-gray-600">
        Enter your email and we will send you a reset link.
      </p>

      {error && (
        <p className="mb-4 rounded bg-terracotta-50 p-3 text-sm text-terracotta-600">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-sage-500 focus:outline-none focus:ring-1 focus:ring-sage-500"
            required
            autoComplete="email"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="min-h-[44px] w-full rounded bg-sage-500 px-4 py-2 text-sm font-medium text-white hover:bg-sage-600 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        <Link href="/login" className="text-sage-600 hover:text-sage-700">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

export default ForgotPasswordPage;
