"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { type GoalProgressRecord, type GoalQuarter, QUARTERS } from "@/lib/goal-types";

export default function SearchClient({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [quarter, setQuarter] = useState<GoalQuarter>("Q2");
  const [goals, setGoals] = useState<GoalProgressRecord[]>([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const response = await fetch(`/api/progress?quarter=${quarter}`, { cache: "no-store" });
      const payload = (await response.json()) as { goals?: GoalProgressRecord[] };

      if (active) {
        setGoals(payload.goals ?? []);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [quarter]);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return goals;
    }

    return goals.filter((record) => {
      const haystack = [record.goal.title, record.goal.description, record.goal.thrustArea, record.goal.employeeId, record.status].join(" ").toLowerCase();
      return haystack.includes(normalized);
    });
  }, [goals, query]);

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Search</p>
            <h1 className="mt-2 text-4xl font-bold">Find goals and progress</h1>
          </div>

          <Link href="/employee/dashboard" className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold transition hover:bg-white/10">
            Back to dashboard
          </Link>
        </div>

        <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 md:grid-cols-[1fr_auto]">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search titles, notes, statuses, or employee ids" className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-blue-500" />
          <select value={quarter} onChange={(event) => setQuarter(event.target.value as GoalQuarter)} className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-blue-500">
            {QUARTERS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <div className="mt-6 grid gap-4">
          {results.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-gray-400">No matching goals found.</div>
          ) : (
            results.map((record) => (
              <article key={record.goal.id} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">{record.goal.title}</h2>
                    <p className="mt-1 text-gray-400">{record.goal.thrustArea} • {record.goal.employeeId}</p>
                  </div>
                  <span className="rounded-full bg-blue-500/20 px-4 py-2 text-sm text-blue-200">{record.status}</span>
                </div>
                <p className="mt-4 text-gray-300">{record.goal.description}</p>
                <div className="mt-4 text-sm text-gray-400">{record.progressPercent}% progress • {record.weightedContribution}% weighted contribution</div>
              </article>
            ))
          )}
        </div>
      </div>
    </main>
  );
}