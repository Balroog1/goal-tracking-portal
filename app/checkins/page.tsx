"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { fetchSession } from "@/lib/auth-client";
import {
  CHECKIN_STATUSES,
  QUARTERS,
  type CheckInSummary,
  type GoalCheckIn,
  type GoalQuarter,
  type GoalRecord,
} from "@/lib/goal-types";

type CheckInForm = {
  goalId: string;
  actualAchievement: string;
  notes: string;
};

const getCurrentQuarter = (): GoalQuarter => {
  const month = new Date().getMonth();

  if (month <= 2) return "Q1";
  if (month <= 5) return "Q2";
  if (month <= 8) return "Q3";
  return "Q4";
};

const createEmptyForm = (goalId = ""): CheckInForm => ({
  goalId,
  actualAchievement: "",
  notes: "",
});

export default function CheckinsPage() {
  const router = useRouter();
  const [quarter, setQuarter] = useState<GoalQuarter>(getCurrentQuarter());
  const [goals, setGoals] = useState<GoalRecord[]>([]);
  const [checkIns, setCheckIns] = useState<GoalCheckIn[]>([]);
  const [summary, setSummary] = useState<CheckInSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingGoalId, setSubmittingGoalId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [forms, setForms] = useState<Record<string, CheckInForm>>({});

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

  const loadCheckIns = async (nextQuarter = quarter) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/checkins?quarter=${nextQuarter}`,
        { cache: "no-store" },
      );
      const payload = (await response.json()) as {
        goals?: GoalRecord[];
        checkIns?: GoalCheckIn[];
        summary?: CheckInSummary;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Unable to load check-ins.");
      }

      const nextGoals = payload.goals ?? [];
      const nextCheckIns = payload.checkIns ?? [];
      setGoals(nextGoals);
      setCheckIns(nextCheckIns);
      setSummary(payload.summary ?? null);
      setForms(
        Object.fromEntries(
          nextGoals.map((goal) => {
            const existing = nextCheckIns.find((checkIn) => checkIn.goalId === goal.id) ?? null;

            return [
              goal.id,
              existing
                ? {
                    goalId: goal.id,
                    actualAchievement: existing.actualAchievement,
                    notes: existing.notes ?? "",
                  }
                : createEmptyForm(goal.id),
            ];
          }),
        ),
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load check-ins.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/checkins?quarter=${quarter}`,
          { cache: "no-store" },
        );
        const payload = (await response.json()) as {
          goals?: GoalRecord[];
          checkIns?: GoalCheckIn[];
          summary?: CheckInSummary;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error || "Unable to load check-ins.");
        }

        if (!active) {
          return;
        }

        const nextGoals = payload.goals ?? [];
        const nextCheckIns = payload.checkIns ?? [];
        setGoals(nextGoals);
        setCheckIns(nextCheckIns);
        setSummary(payload.summary ?? null);
        setForms(
          Object.fromEntries(
            nextGoals.map((goal) => {
              const existing = nextCheckIns.find((checkIn) => checkIn.goalId === goal.id) ?? null;

              return [
                goal.id,
                existing
                  ? {
                      goalId: goal.id,
                      actualAchievement: existing.actualAchievement,
                      notes: existing.notes ?? "",
                    }
                  : createEmptyForm(goal.id),
              ];
            }),
          ),
        );
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load check-ins.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void initialize();

    return () => {
      active = false;
    };
  }, [quarter]);

  const latestCheckInByGoal = useMemo(() => {
    return new Map(checkIns.map((checkIn) => [checkIn.goalId, checkIn]));
  }, [checkIns]);

  const updateForm = (goalId: string, field: keyof CheckInForm, value: string) => {
    setForms((current) => ({
      ...current,
      [goalId]: {
        ...(current[goalId] ?? createEmptyForm(goalId)),
        goalId,
        [field]: value,
      },
    }));
  };

  const submitCheckIn = async (event: FormEvent<HTMLFormElement>, goalId: string) => {
    event.preventDefault();
    setSubmittingGoalId(goalId);
    setError(null);
    setMessage(null);

    try {
      const form = forms[goalId];
      const response = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalId,
          quarter,
          actualAchievement: form?.actualAchievement,
          notes: form?.notes,
        }),
      });

      const payload = (await response.json()) as {
        goals?: GoalRecord[];
        checkIns?: GoalCheckIn[];
        summary?: CheckInSummary;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Unable to submit check-in.");
      }

      setGoals(payload.goals ?? []);
      setCheckIns(payload.checkIns ?? []);
      setSummary(payload.summary ?? null);
      setMessage("Quarterly check-in saved.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit check-in.");
    } finally {
      setSubmittingGoalId(null);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex">
      <Sidebar />

      <section className="flex-1 p-8">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Quarterly Tracking</p>
            <h1 className="mt-2 text-4xl font-bold">Check-ins</h1>
            <p className="mt-2 max-w-2xl text-gray-400">
              Submit actual achievement per approved goal for the selected quarter and track the latest status at a glance.
            </p>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm text-gray-300">Quarter</span>
            <select
              value={quarter}
              onChange={(event) => setQuarter(event.target.value as GoalQuarter)}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-blue-500"
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

        {message ? (
          <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-emerald-200">
            {message}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard label="Approved Goals" value={summary?.totalGoals ?? 0} />
          <StatCard label="Submitted" value={summary?.submittedCheckIns ?? 0} />
          <StatCard label="Completed" value={summary?.completedCount ?? 0} />
          <StatCard label="On Track" value={summary?.onTrackCount ?? 0} />
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[2fr_1fr]">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Submit Achievements</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Status is computed from the actual achievement you submit for each approved goal.
                </p>
              </div>

              <button
                onClick={() => loadCheckIns(quarter)}
                className="rounded-xl border border-white/10 px-4 py-2 transition hover:bg-white/5"
              >
                Refresh
              </button>
            </div>

            <div className="space-y-5">
              {loading ? (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-6 text-gray-400">
                  Loading check-ins...
                </div>
              ) : goals.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-6 text-gray-400">
                  No approved goals are available for check-ins yet.
                </div>
              ) : (
                goals.map((goal) => {
                  const form = forms[goal.id] ?? createEmptyForm(goal.id);
                  const latest = latestCheckInByGoal.get(goal.id);
                  const isTimeline = goal.measurementType === "TIMELINE";

                  return (
                    <article key={goal.id} className="rounded-3xl border border-white/10 bg-black/30 p-5">
                      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h3 className="text-2xl font-bold">{goal.title}</h3>
                          <p className="mt-1 text-sm text-gray-400">{goal.thrustArea}</p>
                          <p className="mt-2 text-sm text-gray-300">{goal.description}</p>
                        </div>

                        <span
                          className={`rounded-full px-4 py-2 text-sm ${latest ? latest.status === "Completed" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300" : "bg-slate-500/20 text-slate-300"}`}
                        >
                          {latest?.status ?? "Not Started"}
                        </span>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl bg-white/5 p-4">
                          <p className="text-gray-400 text-sm">Target</p>
                          <p className="mt-1 text-lg font-semibold">{goal.target}</p>
                        </div>
                        <div className="rounded-2xl bg-white/5 p-4">
                          <p className="text-gray-400 text-sm">Measurement</p>
                          <p className="mt-1 text-lg font-semibold">{goal.measurementType}</p>
                        </div>
                        <div className="rounded-2xl bg-white/5 p-4">
                          <p className="text-gray-400 text-sm">Weightage</p>
                          <p className="mt-1 text-lg font-semibold">{goal.weightage}%</p>
                        </div>
                      </div>

                      <form onSubmit={(event) => submitCheckIn(event, goal.id)} className="mt-5 space-y-4">
                        <label className="block">
                          <span className="mb-2 block text-sm text-gray-300">Actual Achievement</span>
                          <input
                            type={isTimeline ? "date" : "text"}
                            value={form.actualAchievement}
                            onChange={(event) => updateForm(goal.id, "actualAchievement", event.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-blue-500"
                            placeholder={isTimeline ? "YYYY-MM-DD" : "Enter achieved value"}
                          />
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-sm text-gray-300">Notes</span>
                          <textarea
                            value={form.notes}
                            onChange={(event) => updateForm(goal.id, "notes", event.target.value)}
                            className="h-24 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-blue-500"
                            placeholder="Optional context for this check-in"
                          />
                        </label>

                        <div className="flex flex-wrap gap-3">
                          <button
                            type="submit"
                            disabled={submittingGoalId === goal.id}
                            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {submittingGoalId === goal.id ? "Saving..." : "Submit Check-in"}
                          </button>

                          {latest ? (
                            <span className="rounded-xl border border-white/10 px-4 py-3 text-sm text-gray-300">
                              Last submitted {latest.progressPercent}% progress
                            </span>
                          ) : null}
                        </div>
                      </form>
                    </article>
                  );
                })
              )}
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-2xl font-bold">Quarter Status</h2>
              <div className="mt-4 space-y-3">
                {CHECKIN_STATUSES.map((status) => (
                  <div key={status} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm">
                    <span>{status}</span>
                    <span>
                      {status === "Completed"
                        ? summary?.completedCount ?? 0
                        : status === "On Track"
                          ? summary?.onTrackCount ?? 0
                          : summary?.notStartedCount ?? 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-2xl font-bold">Recent Check-ins</h2>
              <div className="mt-4 space-y-3">
                {checkIns.length === 0 ? (
                  <p className="text-sm text-gray-400">No check-ins submitted for this quarter yet.</p>
                ) : (
                  checkIns.slice(0, 5).map((checkIn) => (
                    <div key={checkIn.id} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                      <p className="font-semibold">{checkIn.actualAchievement}</p>
                      <p className="mt-1 text-sm text-gray-400">
                        {checkIn.status} • {checkIn.progressPercent}% progress
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="mt-2 text-4xl font-bold">{value}</p>
    </div>
  );
}
