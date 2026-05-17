"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { fetchSession } from "@/lib/auth-client";
import {
  DEFAULT_EMPLOYEE_ID,
  QUARTERS,
  type GoalProgressRecord,
  type GoalQuarter,
  type ProgressDashboard,
} from "@/lib/goal-types";

const getCurrentQuarter = (): GoalQuarter => {
  const month = new Date().getMonth();

  if (month <= 2) return "Q1";
  if (month <= 5) return "Q2";
  if (month <= 8) return "Q3";
  return "Q4";
};

export default function DashboardPage() {
  const router = useRouter();
  const [quarter, setQuarter] = useState<GoalQuarter>(getCurrentQuarter());
  const [dashboard, setDashboard] = useState<ProgressDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const guard = async () => {
      const session = await fetchSession();

      if (active && session?.role !== "employee") {
        router.push("/login");
      }
    };

    void guard();

    return () => {
      active = false;
    };
  }, [router]);

  useEffect(() => {
    let active = true;

    const loadProgress = async () => {
      setLoading(true);

      try {
        const response = await fetch(
          `/api/progress?employeeId=${DEFAULT_EMPLOYEE_ID}&quarter=${quarter}`,
          { cache: "no-store" },
        );
        const payload = (await response.json()) as ProgressDashboard & { error?: string };

        if (!response.ok) {
          throw new Error(payload.error || "Unable to load progress.");
        }

        if (active) {
          setDashboard(payload);
        }
      } catch {
        if (active) {
          setDashboard(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadProgress();

    return () => {
      active = false;
    };
  }, [quarter]);

  const summary = useMemo(() => {
    return {
      total: dashboard?.summary.totalGoals ?? 0,
      submitted: dashboard?.summary.submittedCheckIns ?? 0,
      progress: dashboard?.summary.averageProgressPercent ?? 0,
      weightedProgress: dashboard?.summary.weightedProgressPercent ?? 0,
    };
  }, [dashboard]);

  const goals = dashboard?.goals ?? [];

  return (
    <main className="min-h-screen bg-black text-white flex">
      <Sidebar />

      <section className="flex-1 p-8">
        <Topbar />

        <div className="mb-8 flex flex-wrap items-center gap-4">
          <label className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="mr-3 text-sm text-gray-400">Quarter</span>
            <select
              value={quarter}
              onChange={(event) => setQuarter(event.target.value as GoalQuarter)}
              className="bg-transparent outline-none"
            >
              {QUARTERS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <Link
            href="/goals"
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-700"
          >
            Manage Goals
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-10 md:grid-cols-4">
          <StatCard label="Approved Goals" value={loading ? "..." : summary.total} />
          <StatCard label="Submitted Check-ins" value={loading ? "..." : summary.submitted} />
          <StatCard label="Average Progress" value={loading ? "..." : `${summary.progress}%`} />
          <StatCard label="Weighted Progress" value={loading ? "..." : `${summary.weightedProgress}%`} />
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Current Progress</h2>
              <p className="mt-2 text-gray-400">
                Each goal shows the latest computed progress from quarterly check-ins.
              </p>
            </div>

            <span
              className={`rounded-full px-4 py-2 text-sm ${summary.weightedProgress === 100 ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}
            >
              {summary.weightedProgress === 100
                ? "Quarter complete"
                : `Overall progress ${summary.weightedProgress}%`}
            </span>
          </div>

          <div className="space-y-5">
            {loading ? (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-6 text-gray-400">
                Loading progress...
              </div>
            ) : goals.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-6 text-gray-400">
                No approved goals found for this quarter.
              </div>
            ) : (
              goals.slice(0, 4).map((record) => (
                <GoalProgressCard key={record.goal.id} record={record} />
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function GoalProgressCard({ record }: { record: GoalProgressRecord }) {
  const progress = Math.min(100, record.progressPercent);

  return (
    <article className="rounded-2xl border border-white/10 bg-black/30 p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold">{record.goal.title}</h3>
          <p className="text-sm text-gray-400">{record.goal.thrustArea}</p>
        </div>
        <span
          className={`rounded-full px-4 py-2 text-sm ${record.status === "Completed" ? "bg-emerald-500/20 text-emerald-300" : record.status === "On Track" ? "bg-amber-500/20 text-amber-300" : "bg-slate-500/20 text-slate-300"}`}
        >
          {record.status}
        </span>
      </div>

      <p className="mb-4 text-gray-300">{record.goal.description}</p>

      <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
        <div className="rounded-2xl bg-white/5 p-4">
          <p className="text-gray-400">Weightage</p>
          <p className="mt-1 text-lg font-semibold">{record.goal.weightage}%</p>
        </div>
        <div className="rounded-2xl bg-white/5 p-4">
          <p className="text-gray-400">Target</p>
          <p className="mt-1 text-lg font-semibold">{record.goal.target}</p>
        </div>
        <div className="rounded-2xl bg-white/5 p-4">
          <p className="text-gray-400">Progress</p>
          <p className="mt-1 text-lg font-semibold">{record.progressPercent}%</p>
        </div>
        <div className="rounded-2xl bg-white/5 p-4">
          <p className="text-gray-400">Contribution</p>
          <p className="mt-1 text-lg font-semibold">{record.weightedContribution}%</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="h-2 rounded-full bg-white/10">
          <div
            className={`h-full rounded-full ${record.status === "Completed" ? "bg-emerald-500" : "bg-blue-500"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-400">
          <span>Latest check-in: {record.latestCheckIn?.actualAchievement ?? "None yet"}</span>
          <span>
            {record.latestCheckIn ? `Updated ${record.latestCheckIn.submittedAt}` : "Awaiting first submission"}
          </span>
        </div>
      </div>
    </article>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <h3 className="mb-2 text-gray-400">{label}</h3>
      <p className="text-5xl font-bold">{value}</p>
    </div>
  );
}
