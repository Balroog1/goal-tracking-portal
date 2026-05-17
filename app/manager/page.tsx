"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchSession } from "@/lib/auth-client";
import { type GoalRecord, type ManagerGoalSummary } from "@/lib/goal-types";

type ManagerDraft = {
  target: string;
  weightage: string;
  reviewNotes: string;
};

const managerLabel = "Manager";

export default function ManagerPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<GoalRecord[]>([]);
  const [summary, setSummary] = useState<ManagerGoalSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, ManagerDraft>>({});

  useEffect(() => {
    let active = true;

    const guard = async () => {
      const session = await fetchSession();

      if (active && session?.role !== "manager") {
        router.push("/login");
      }
    };

    void guard();

    return () => {
      active = false;
    };
  }, [router]);

  const loadGoals = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/manager/goals", { cache: "no-store" });
      const payload = (await response.json()) as {
        goals?: GoalRecord[];
        summary?: ManagerGoalSummary;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Unable to load manager goals.");
      }

      const nextGoals = payload.goals ?? [];
      setGoals(nextGoals);
      setSummary(payload.summary ?? null);
      setDrafts(
        Object.fromEntries(
          nextGoals.map((goal) => [goal.id, {
            target: goal.target,
            weightage: String(goal.weightage),
            reviewNotes: goal.reviewNotes ?? "",
          }]),
        ),
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load manager goals.");
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
        const response = await fetch("/api/manager/goals", { cache: "no-store" });
        const payload = (await response.json()) as {
          goals?: GoalRecord[];
          summary?: ManagerGoalSummary;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error || "Unable to load manager goals.");
        }

        if (!active) {
          return;
        }

        const nextGoals = payload.goals ?? [];
        setGoals(nextGoals);
        setSummary(payload.summary ?? null);
        setDrafts(
          Object.fromEntries(
            nextGoals.map((goal) => [goal.id, {
              target: goal.target,
              weightage: String(goal.weightage),
              reviewNotes: goal.reviewNotes ?? "",
            }]),
          ),
        );
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load manager goals.");
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
  }, []);

  const pendingGoals = useMemo(
    () => goals.filter((goal) => goal.approvalStatus === "pending"),
    [goals],
  );

  const approvedGoals = useMemo(
    () => goals.filter((goal) => goal.approvalStatus === "approved"),
    [goals],
  );

  const rejectedGoals = useMemo(
    () => goals.filter((goal) => goal.approvalStatus === "rejected"),
    [goals],
  );

  const updateDraft = (goalId: string, field: keyof ManagerDraft, value: string) => {
    setDrafts((current) => ({
      ...current,
      [goalId]: {
        ...(current[goalId] ?? { target: "", weightage: "", reviewNotes: "" }),
        [field]: value,
      },
    }));
  };

  const refreshAfterMutation = async (successText: string) => {
    setMessage(successText);
    await loadGoals();
  };

  const saveGoal = async (goalId: string) => {
    setError(null);
    setMessage(null);

    try {
      const draft = drafts[goalId];
      const response = await fetch(`/api/manager/goals/${goalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: draft?.target,
          weightage: draft?.weightage,
          reviewNotes: draft?.reviewNotes,
          actorLabel: managerLabel,
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Unable to update goal.");
      }

      await refreshAfterMutation("Goal updated for review.");
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : "Unable to update goal.");
    }
  };

  const approveGoal = async (goalId: string) => {
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/manager/goals/${goalId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorLabel: managerLabel }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Unable to approve goal.");
      }

      await refreshAfterMutation("Goal approved and locked.");
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : "Unable to approve goal.");
    }
  };

  const rejectGoal = async (goalId: string) => {
    setError(null);
    setMessage(null);

    try {
      const draft = drafts[goalId];
      const response = await fetch(`/api/manager/goals/${goalId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewNotes: draft?.reviewNotes, actorLabel: managerLabel }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Unable to reject goal.");
      }

      await refreshAfterMutation("Goal returned to employee for revision.");
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : "Unable to reject goal.");
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-blue-300">L1 Manager</p>
          <h1 className="mt-2 text-5xl font-bold">Approval Workflow</h1>
          <p className="mt-3 max-w-2xl text-gray-400">
            Review submitted goals, adjust target or weightage before approval, and lock approved goals so employees can no longer edit them.
          </p>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("role");
            router.push("/login");
          }}
          className="rounded-xl bg-red-500 px-5 py-3 font-semibold transition hover:bg-red-600"
        >
          Logout
        </button>
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <StatCard label="Total Goals" value={summary?.totalGoals ?? 0} />
        <StatCard label="Pending" value={summary?.pendingApprovals ?? 0} />
        <StatCard label="Approved" value={summary?.approvedGoals ?? 0} />
        <StatCard label="Rejected" value={summary?.rejectedGoals ?? 0} />
        <StatCard label="Locked" value={summary?.lockedGoals ?? 0} />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[2fr_1fr]">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Pending Approvals</h2>
              <p className="mt-1 text-sm text-gray-400">
                Inline edits apply before approval. Approved goals are locked immediately.
              </p>
            </div>

            <button
              onClick={loadGoals}
              className="rounded-xl border border-white/10 px-4 py-2 transition hover:bg-white/5"
            >
              Refresh
            </button>
          </div>

          <div className="space-y-5">
            {loading ? (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-6 text-gray-400">
                Loading manager goals...
              </div>
            ) : pendingGoals.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-6 text-gray-400">
                No goals are waiting for approval right now.
              </div>
            ) : (
              pendingGoals.map((goal) => {
                const draft = drafts[goal.id] ?? {
                  target: goal.target,
                  weightage: String(goal.weightage),
                  reviewNotes: goal.reviewNotes ?? "",
                };

                return (
                  <article key={goal.id} className="rounded-3xl border border-white/10 bg-black/30 p-5">
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="text-2xl font-bold">{goal.title}</h3>
                        <p className="mt-1 text-sm text-gray-400">Employee: {goal.employeeId}</p>
                        <p className="mt-2 text-sm text-gray-300">{goal.description}</p>
                      </div>

                      <div className="rounded-full bg-blue-500/20 px-4 py-2 text-sm text-blue-200">
                        Pending approval
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <label className="block">
                        <span className="mb-2 block text-sm text-gray-300">Target</span>
                        <input
                          value={draft.target}
                          onChange={(event) => updateDraft(goal.id, "target", event.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-blue-500"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm text-gray-300">Weightage</span>
                        <input
                          value={draft.weightage}
                          onChange={(event) => updateDraft(goal.id, "weightage", event.target.value)}
                          type="number"
                          min="10"
                          className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-blue-500"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm text-gray-300">Review Notes</span>
                        <input
                          value={draft.reviewNotes}
                          onChange={(event) => updateDraft(goal.id, "reviewNotes", event.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-blue-500"
                          placeholder="Optional manager note"
                        />
                      </label>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-400">
                      <span className="rounded-full border border-white/10 px-3 py-1">Quarter {goal.quarter}</span>
                      <span className="rounded-full border border-white/10 px-3 py-1">{goal.measurementType}</span>
                      <span className="rounded-full border border-white/10 px-3 py-1">Current weightage {goal.weightage}%</span>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        onClick={() => saveGoal(goal.id)}
                        className="rounded-xl bg-sky-600 px-5 py-3 font-semibold transition hover:bg-sky-700"
                      >
                        Save Edits
                      </button>

                      <button
                        onClick={() => approveGoal(goal.id)}
                        className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold transition hover:bg-emerald-700"
                      >
                        Approve & Lock
                      </button>

                      <button
                        onClick={() => rejectGoal(goal.id)}
                        className="rounded-xl bg-red-600 px-5 py-3 font-semibold transition hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-bold">Approved Goals</h2>
            <p className="mt-1 text-sm text-gray-400">These goals are locked and no longer editable.</p>

            <div className="mt-4 space-y-3">
              {approvedGoals.length === 0 ? (
                <p className="text-sm text-gray-400">No approved goals yet.</p>
              ) : (
                approvedGoals.slice(0, 4).map((goal) => (
                  <div key={goal.id} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <p className="font-semibold">{goal.title}</p>
                    <p className="mt-1 text-sm text-gray-400">Locked by {goal.reviewedBy ?? managerLabel}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-bold">Rejected Goals</h2>
            <p className="mt-1 text-sm text-gray-400">Rejected goals return to draft for employee revision.</p>

            <div className="mt-4 space-y-3">
              {rejectedGoals.length === 0 ? (
                <p className="text-sm text-gray-400">No rejected goals yet.</p>
              ) : (
                rejectedGoals.slice(0, 4).map((goal) => (
                  <div key={goal.id} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <p className="font-semibold">{goal.title}</p>
                    <p className="mt-1 text-sm text-gray-400">{goal.reviewNotes ?? "Returned for revision."}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
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
