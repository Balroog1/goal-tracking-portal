"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { DEFAULT_EMPLOYEE_ID, type GoalRecord } from "@/lib/goal-types";

export default function DashboardPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<GoalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem("role");

    if (role !== "employee") {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    const loadGoals = async () => {
      try {
        const response = await fetch(`/api/goals?employeeId=${DEFAULT_EMPLOYEE_ID}`, {
          cache: "no-store",
        });
        const payload = (await response.json()) as { goals?: GoalRecord[] };
        setGoals(payload.goals ?? []);
      } finally {
        setLoading(false);
      }
    };

    void loadGoals();
  }, []);

  const summary = useMemo(() => {
    const total = goals.reduce((sum, goal) => sum + goal.weightage, 0);
    const submitted = goals.filter((goal) => goal.status === "submitted").length;
    const draft = goals.filter((goal) => goal.status === "draft").length;

    return {
      total,
      submitted,
      draft,
    };
  }, [goals]);

  return (
    <main className="min-h-screen bg-black text-white flex">
      <Sidebar />

      <section className="flex-1 p-8">
        <Topbar />

        <div className="mb-8 flex flex-wrap items-center gap-4">
          <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-3">
            Q2 Check-in Active
          </div>
          <Link
            href="/goals"
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-700"
          >
            Manage Goals
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-10 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-2 text-gray-400">Active Goals</h3>
            <p className="text-5xl font-bold">{loading ? "..." : goals.length}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-2 text-gray-400">Submitted Goals</h3>
            <p className="text-5xl font-bold">{loading ? "..." : summary.submitted}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-2 text-gray-400">Total Weightage</h3>
            <p className="text-5xl font-bold">{loading ? "..." : `${summary.total}%`}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Current Goals</h2>
              <p className="mt-2 text-gray-400">Draft goals stay editable until you submit them.</p>
            </div>

            <span className={`rounded-full px-4 py-2 text-sm ${summary.total === 100 ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}>
              {summary.total === 100 ? "Ready for submission" : `Need ${100 - summary.total}% more weightage`}
            </span>
          </div>

          <div className="space-y-5">
            {goals.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-6 text-gray-400">
                No goals available yet.
              </div>
            ) : (
              goals.slice(0, 4).map((goal) => (
                <article key={goal.id} className="rounded-2xl border border-white/10 bg-black/30 p-5">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold">{goal.title}</h3>
                      <p className="text-sm text-gray-400">{goal.thrustArea}</p>
                    </div>
                    <span
                      className={`rounded-full px-4 py-2 text-sm ${goal.status === "submitted" ? "bg-emerald-500/20 text-emerald-300" : "bg-sky-500/20 text-sky-300"}`}
                    >
                      {goal.status}
                    </span>
                  </div>

                  <p className="mb-4 text-gray-300">{goal.description}</p>

                  <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                    <div className="rounded-2xl bg-white/5 p-4">
                      <p className="text-gray-400">Weightage</p>
                      <p className="mt-1 text-lg font-semibold">{goal.weightage}%</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-4">
                      <p className="text-gray-400">Quarter</p>
                      <p className="mt-1 text-lg font-semibold">{goal.quarter}</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-4">
                      <p className="text-gray-400">Target</p>
                      <p className="mt-1 text-lg font-semibold">{goal.target}</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-4">
                      <p className="text-gray-400">Measure</p>
                      <p className="mt-1 text-lg font-semibold">{goal.measurementType}</p>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
