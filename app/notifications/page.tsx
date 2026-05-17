"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type AuditEntry } from "@/lib/goal-types";

export default function NotificationsPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const response = await fetch("/api/reports?limit=10", { cache: "no-store" });
      const payload = (await response.json()) as { entries?: AuditEntry[] };

      if (active) {
        setEntries(payload.entries ?? []);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Updates</p>
            <h1 className="mt-2 text-4xl font-bold">Notifications</h1>
          </div>

          <Link href="/employee/dashboard" className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold transition hover:bg-white/10">
            Back to dashboard
          </Link>
        </div>

        <div className="space-y-4">
          {entries.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-gray-400">No recent updates yet.</div>
          ) : (
            entries.map((entry) => (
              <article key={entry.id} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-sm uppercase tracking-[0.25em] text-gray-400">{entry.action}</p>
                <h2 className="mt-2 text-2xl font-bold">{entry.actorLabel}</h2>
                <p className="mt-2 text-gray-300">Goal: {entry.goalId}</p>
                <p className="mt-2 text-sm text-gray-400">{entry.timestamp}</p>
              </article>
            ))
          )}
        </div>
      </div>
    </main>
  );
}