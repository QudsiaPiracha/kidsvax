"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, sendMagicLink } from "@/lib/auth";

export function LoginPage(): React.JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn(email, password);
    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }
    router.push("/dashboard");
  }

  async function handleMagicLink() {
    setError("");
    setLoading(true);

    const result = await sendMagicLink(email);
    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }
    setMagicLinkSent(true);
  }

  return (
    <div>
      <h1 className="mb-6 text-center text-2xl font-semibold text-gray-900">
        Sign In
      </h1>

      {magicLinkSent && (
        <p className="mb-4 rounded bg-sage-50 p-3 text-sm text-sage-700">
          Check your email for the magic link.
        </p>
      )}

      {error && (
        <p className="mb-4 rounded bg-terracotta-50 p-3 text-sm text-terracotta-600">
          {error}
        </p>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
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

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-sage-500 focus:outline-none focus:ring-1 focus:ring-sage-500"
            required
            minLength={8}
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="min-h-[44px] w-full rounded bg-sage-500 px-4 py-2 text-sm font-medium text-white hover:bg-sage-600 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="mt-4 space-y-3">
        <button
          type="button"
          onClick={handleMagicLink}
          disabled={loading || !email}
          className="min-h-[44px] w-full rounded border border-sage-300 px-4 py-2 text-sm font-medium text-sage-700 hover:bg-sage-50 disabled:opacity-50"
        >
          Send Magic Link
        </button>

        <div className="flex justify-between text-sm">
          <Link href="/forgot-password" className="text-sage-600 hover:text-sage-700">
            Forgot password?
          </Link>
          <Link href="/signup" className="text-sage-600 hover:text-sage-700">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
