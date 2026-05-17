"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchSession, loginWithDemoAccount } from "@/lib/auth-client";
import { ROLE_HOME, type AppRole } from "@/lib/goal-types";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      const session = await fetchSession();

      if (active && session) {
        router.push(ROLE_HOME[session.role as AppRole]);
      }
    };

    void restoreSession();

    return () => {
      active = false;
    };
  }, [router]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await loginWithDemoAccount(email, password);
      router.push(result.redirectTo);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
        <h1 className="mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-center text-4xl font-bold text-transparent">
          Welcome Back
        </h1>
        <p className="mb-8 text-center text-gray-400">Login to your Goal Tracking Portal</p>

        {error ? (
          <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="employee@demo.com"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Demo password"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-purple-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400">
          Demo Accounts:
          <br />
          employee@demo.com
          <br />
          manager@demo.com
          <br />
          admin@demo.com
        </div>
      </div>
    </main>
  );
}
