"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, sendMagicLink } from "@/lib/auth";

function LoginPage(): React.JSX.Element {
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
    if (!email) return;
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
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="mt-1 text-sm text-gray-500">
          Sign in to access your children&apos;s health records.
        </p>
      </div>

      {magicLinkSent && (
        <div className="mb-6 rounded-lg bg-sage-50 p-4 text-center">
          <p className="text-sm font-medium text-sage-700">
            Magic link sent! Check your email.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg bg-terracotta-50 p-4">
          <p className="text-sm text-terracotta-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
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

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs text-sage-600 hover:text-sage-700">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm
                       placeholder:text-gray-400
                       focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500/20"
            placeholder="Enter your password"
            required
            minLength={8}
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="min-h-[44px] w-full rounded-lg bg-sage-500 px-4 py-2.5 text-sm font-semibold
                     text-white shadow-sm hover:bg-sage-600 disabled:opacity-50 transition-colors"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-gray-400">or</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleMagicLink}
        disabled={loading || !email}
        className="min-h-[44px] w-full rounded-lg border border-sage-200 px-4 py-2.5 text-sm
                   font-medium text-sage-700 hover:bg-sage-50 disabled:opacity-50 transition-colors"
      >
        Send Magic Link
      </button>

      <p className="mt-8 text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-sage-600 hover:text-sage-700">
          Create one
        </Link>
      </p>
    </div>
  );
}

export default LoginPage;
