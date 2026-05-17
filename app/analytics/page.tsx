"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Sidebar from "@/components/Sidebar";
import { QUARTERS, type GoalProgressRecord, type GoalQuarter, type ProgressDashboard } from "@/lib/goal-types";

const getCurrentQuarter = (): GoalQuarter => {
  const month = new Date().getMonth();

  if (month <= 2) return "Q1";
  if (month <= 5) return "Q2";
  if (month <= 8) return "Q3";
  return "Q4";
};

type ChartDatum = {
  name: string;
  value: number;
  color?: string;
};

export default function AnalyticsPage() {
  const [quarter, setQuarter] = useState<GoalQuarter>(getCurrentQuarter());
  const [dashboard, setDashboard] = useState<ProgressDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadAnalytics = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/progress?quarter=${quarter}`, { cache: "no-store" });
        const payload = (await response.json()) as ProgressDashboard & { error?: string };

        if (!response.ok) {
          throw new Error(payload.error || "Unable to load analytics.");
        }

        if (active) {
          setDashboard(payload);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load analytics.");
          setDashboard(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadAnalytics();

    return () => {
      active = false;
    };
  }, [quarter]);

  const summary = dashboard?.summary ?? null;
  const goals = dashboard?.goals ?? [];

  const completionRate = summary && summary.totalGoals > 0
    ? Math.round((summary.completedCount / summary.totalGoals) * 100)
    : 0;

  const statusData: ChartDatum[] = [
    { name: "Completed", value: summary?.completedCount ?? 0, color: "#22c55e" },
    { name: "On Track", value: summary?.onTrackCount ?? 0, color: "#f59e0b" },
    { name: "Not Started", value: summary?.notStartedCount ?? 0, color: "#64748b" },
  ];

  const measurementData: ChartDatum[] = (() => {
    const counts = new Map<string, number>();

    goals.forEach((record) => {
      counts.set(record.goal.measurementType, (counts.get(record.goal.measurementType) ?? 0) + 1);
    });

    const palette: Record<string, string> = {
      MIN: "#3b82f6",
      MAX: "#8b5cf6",
      ZERO: "#06b6d4",
      TIMELINE: "#f97316",
    };

    return ["MIN", "MAX", "ZERO", "TIMELINE"].map((name) => ({
      name,
      value: counts.get(name) ?? 0,
      color: palette[name],
    }));
  })();

  const userData: ChartDatum[] = (() => {
    const grouped = new Map<string, { total: number; count: number }>();

    goals.forEach((record) => {
      const bucket = grouped.get(record.goal.employeeId) ?? { total: 0, count: 0 };
      bucket.total += Math.min(100, record.progressPercent);
      bucket.count += 1;
      grouped.set(record.goal.employeeId, bucket);
    });

    return Array.from(grouped.entries()).map(([name, bucket]) => ({
      name,
      value: bucket.count > 0 ? Math.round(bucket.total / bucket.count) : 0,
    }));
  })();

  return (
    <main className="min-h-screen bg-black text-white flex">
      <Sidebar />

      <section className="flex-1 min-w-0 p-6 md:p-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 pt-4 md:pt-10">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Performance Insights</p>
            <h1 className="mt-2 text-4xl font-bold md:text-5xl">Analytics Dashboard</h1>
            <p className="mt-3 max-w-2xl text-gray-400">
              Real goal and check-in data for the selected quarter. Status, progress, and measurement type charts are built from stored records.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
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

            <Link href="/reports" className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold transition hover:bg-white/10">
              Open reports
            </Link>
          </div>
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-200">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <MetricCard label="Overall completion rate" value={`${completionRate}%`} tone="text-emerald-300" />
          <MetricCard label="Completed goals" value={loading ? "..." : summary?.completedCount ?? 0} tone="text-blue-300" />
          <MetricCard label="Average progress" value={loading ? "..." : `${summary?.averageProgressPercent ?? 0}%`} tone="text-purple-300" />
          <MetricCard label="Weighted progress" value={loading ? "..." : `${summary?.weightedProgressPercent ?? 0}%`} tone="text-amber-300" />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ChartCard title="Goals by Status" description="Completed, On Track, and Not Started counts come from stored check-ins.">
            <PieChartContainer data={statusData} innerRadius={60} outerRadius={108} />
          </ChartCard>

          <ChartCard title="Progress by User" description="Average progress per employee from the actual goal records.">
            <BarChartContainer data={userData} />
          </ChartCard>

          <ChartCard title="Measurement Type Breakdown" description="MIN, MAX, ZERO, and TIMELINE goals counted from live records.">
            <PieChartContainer data={measurementData} innerRadius={68} outerRadius={108} />
          </ChartCard>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-bold">Top Goal Progress</h2>
            <p className="mt-1 text-sm text-gray-400">Current quarter snapshot sorted by progress.</p>

            <div className="mt-5 space-y-3">
              {loading ? (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-6 text-gray-400">Loading analytics...</div>
              ) : goals.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-6 text-gray-400">No approved goals found for this quarter.</div>
              ) : (
                goals.slice(0, 5).map((record) => <GoalRow key={record.goal.id} record={record} />)
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function MetricCard({ label, value, tone }: { label: string; value: number | string; tone: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <p className="text-sm uppercase tracking-[0.25em] text-gray-400">{label}</p>
      <p className={`mt-3 text-4xl font-bold ${tone}`}>{value}</p>
    </div>
  );
}

function ChartCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="mt-1 text-sm text-gray-400">{description}</p>
        </div>
      </div>

      <div className="h-[320px] w-full">{children}</div>
    </section>
  );
}

function PieChartContainer({ data, innerRadius, outerRadius }: { data: ChartDatum[]; innerRadius: number; outerRadius: number }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={innerRadius} outerRadius={outerRadius} paddingAngle={4}>
          {data.map((segment) => (
            <Cell key={segment.name} fill={segment.color ?? "#3b82f6"} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ backgroundColor: "#0b0b0f", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function BarChartContainer({ data }: { data: ChartDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <XAxis dataKey="name" stroke="#9ca3af" tickLine={false} axisLine={false} />
        <YAxis stroke="#9ca3af" tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ backgroundColor: "#0b0b0f", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16 }} />
        <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function GoalRow({ record }: { record: GoalProgressRecord }) {
  const progress = Math.min(100, record.progressPercent);

  return (
    <article className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">{record.goal.title}</h3>
          <p className="mt-1 text-sm text-gray-400">{record.goal.employeeId} • {record.goal.measurementType}</p>
        </div>
        <span className="rounded-full bg-blue-500/20 px-3 py-1 text-sm text-blue-200">{record.status}</span>
      </div>

      <div className="mt-4 h-2 rounded-full bg-white/10">
        <div className="h-full rounded-full bg-blue-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="mt-3 flex items-center justify-between text-sm text-gray-400">
        <span>{progress}% progress</span>
        <span>{record.weightedContribution}% weighted</span>
      </div>
    </article>
  );
}
