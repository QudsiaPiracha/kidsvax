"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth";

function SignupPage(): React.JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const result = await signUp(email, password);
    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
        <p className="mt-1 text-sm text-gray-500">
          Start tracking your children&apos;s health records digitally.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-terracotta-50 p-4">
          <p className="text-sm text-terracotta-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-5">
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
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm
                       placeholder:text-gray-400
                       focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500/20"
            placeholder="Minimum 8 characters"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm
                       placeholder:text-gray-400
                       focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500/20"
            placeholder="Re-enter your password"
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
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-gray-400">
        By signing up, you agree to our privacy policy. Your data is stored in the EU and never shared.
      </p>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-sage-600 hover:text-sage-700">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default SignupPage;
