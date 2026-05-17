"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { fetchSession } from "@/lib/auth-client";
import {
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

export default function AdminPage() {
  const router = useRouter();
  const [quarter, setQuarter] = useState<GoalQuarter>(getCurrentQuarter());
  const [dashboard, setDashboard] = useState<ProgressDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const guard = async () => {
      const session = await fetchSession();

      if (active && session?.role !== "admin") {
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

    const loadDashboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/progress?quarter=${quarter}`, { cache: "no-store" });
        const payload = (await response.json()) as ProgressDashboard & { error?: string };

        if (!response.ok) {
          throw new Error(payload.error || "Unable to load company progress.");
        }

        if (active) {
          setDashboard(payload);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load company progress.");
          setDashboard(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      active = false;
    };
  }, [quarter]);

  const summary = dashboard?.summary;
  const topGoals = useMemo(() => dashboard?.goals.slice(0, 4) ?? [], [dashboard]);

  return (
    <main className="min-h-screen bg-black text-white flex">
      <Sidebar />

      <section className="flex-1 p-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-5xl font-bold mb-4">Admin Dashboard</h1>
            <p className="text-gray-400 text-xl mb-10">
              Company-wide progress, weighted achievement, and system controls.
            </p>
          </div>

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
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-200">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 mb-10 md:grid-cols-3">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <p className="text-gray-400 mb-3">Approved Goals</p>
            <h2 className="text-5xl font-bold">{loading ? "..." : summary?.totalGoals ?? 0}</h2>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <p className="text-gray-400 mb-3">Company Progress</p>
            <h2 className="text-5xl font-bold">
              {loading ? "..." : `${summary?.weightedProgressPercent ?? 0}%`}
            </h2>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <p className="text-gray-400 mb-3">Employees Covered</p>
            <h2 className="text-5xl font-bold">{loading ? "..." : summary?.employeeCount ?? 0}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-10 md:grid-cols-3">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <p className="text-gray-400 mb-3">Average Progress</p>
            <h2 className="text-5xl font-bold">{loading ? "..." : `${summary?.averageProgressPercent ?? 0}%`}</h2>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <p className="text-gray-400 mb-3">Completed Goals</p>
            <h2 className="text-5xl font-bold">{loading ? "..." : summary?.completedCount ?? 0}</h2>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <p className="text-gray-400 mb-3">Check-ins Submitted</p>
            <h2 className="text-5xl font-bold">{loading ? "..." : summary?.submittedCheckIns ?? 0}</h2>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <h2 className="text-3xl font-bold mb-6">Ranked Goal Progress</h2>

          <div className="space-y-4 mb-8">
            {loading ? (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-6 text-gray-400">
                Loading company progress...
              </div>
            ) : topGoals.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-6 text-gray-400">
                No approved goals found for this quarter.
              </div>
            ) : (
              topGoals.map((record) => <ProgressRow key={record.goal.id} record={record} />)
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button className="bg-blue-600 hover:bg-blue-700 transition rounded-2xl p-6 text-left">
              <h3 className="text-2xl font-bold mb-2">Manage Employees</h3>
              <p className="text-white/70">Add, edit, or remove employee accounts.</p>
            </button>

            <Link href="/reports" className="bg-purple-600 hover:bg-purple-700 transition rounded-2xl p-6 text-left block">
              <h3 className="text-2xl font-bold mb-2">Generate Reports</h3>
              <p className="text-white/70">Export company performance reports.</p>
            </Link>
          </div>
        </div>

        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8">
          <h2 className="text-3xl font-bold mb-6">Quarter Snapshot</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Metric label="On Track" value={summary?.onTrackCount ?? 0} />
            <Metric label="Not Started" value={summary?.notStartedCount ?? 0} />
            <Metric label="Total Weightage" value={`${summary?.totalWeightage ?? 0}%`} />
            <Metric label="Quarter" value={quarter} />
          </div>
        </div>
      </section>
    </main>
  );
}

function ProgressRow({ record }: { record: GoalProgressRecord }) {
  const progress = Math.min(100, record.progressPercent);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold">{record.goal.title}</h3>
          <p className="text-sm text-gray-400">
            {record.goal.employeeId} • {record.goal.thrustArea}
          </p>
        </div>
        <span className="rounded-full bg-blue-500/20 px-4 py-2 text-sm text-blue-300">
          {record.status}
        </span>
      </div>

      <div className="mb-3 h-2 rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-400">
        <span>{record.progressPercent}% progress</span>
        <span>{record.weightedContribution}% weighted contribution</span>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
