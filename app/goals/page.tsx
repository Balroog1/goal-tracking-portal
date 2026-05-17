"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Sidebar from "@/components/Sidebar";
import {
  DEFAULT_EMPLOYEE_ID,
  GOAL_LIMIT,
  MEASUREMENT_TYPES,
  QUARTERS,
  type GoalQuarter,
  type GoalRecord,
  type MeasurementType,
} from "@/lib/goal-types";

type GoalFormState = {
  title: string;
  description: string;
  thrustArea: string;
  uom: string;
  target: string;
  weightage: string;
  quarter: GoalQuarter;
  measurementType: MeasurementType;
};

const emptyForm = (): GoalFormState => ({
  title: "",
  description: "",
  thrustArea: "",
  uom: "",
  target: "",
  weightage: "10",
  quarter: "Q2",
  measurementType: "MIN",
});

const goalToForm = (goal: GoalRecord): GoalFormState => ({
  title: goal.title,
  description: goal.description,
  thrustArea: goal.thrustArea,
  uom: goal.uom,
  target: goal.target,
  weightage: String(goal.weightage),
  quarter: goal.quarter,
  measurementType: goal.measurementType,
});

export default function GoalsPage() {
  const [goals, setGoals] = useState<GoalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<GoalFormState>(emptyForm());

  const totalWeightage = useMemo(
    () => goals.reduce((sum, goal) => sum + goal.weightage, 0),
    [goals],
  );

  useEffect(() => {
    let active = true;

    const loadGoals = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/goals?employeeId=${DEFAULT_EMPLOYEE_ID}`, {
          cache: "no-store",
        });
        const payload = (await response.json()) as { goals?: GoalRecord[]; error?: string };

        if (!response.ok) {
          throw new Error(payload.error || "Unable to load goals.");
        }

        if (active) {
          setGoals(payload.goals ?? []);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load goals.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadGoals();

    return () => {
      active = false;
    };
  }, []);

  const refreshGoals = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/goals?employeeId=${DEFAULT_EMPLOYEE_ID}`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as { goals?: GoalRecord[]; error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Unable to load goals.");
      }

      setGoals(payload.goals ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load goals.");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingGoalId(null);
    setForm(emptyForm());
    setError(null);
    setSuccess(null);
    setShowModal(true);
  };

  const openEditModal = (goal: GoalRecord) => {
    setEditingGoalId(goal.id);
    setForm(goalToForm(goal));
    setError(null);
    setSuccess(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingGoalId(null);
    setForm(emptyForm());
  };

  const updateForm = <Key extends keyof GoalFormState>(field: Key, value: GoalFormState[Key]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const payload = {
      employeeId: DEFAULT_EMPLOYEE_ID,
      title: form.title,
      description: form.description,
      thrustArea: form.thrustArea,
      uom: form.uom,
      target: form.target,
      weightage: Number(form.weightage),
      quarter: form.quarter,
      measurementType: form.measurementType,
      actorLabel: "Employee",
    };

    try {
      const response = await fetch(
        editingGoalId ? `/api/goals/${editingGoalId}` : "/api/goals",
        {
          method: editingGoalId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const result = (await response.json()) as { goals?: GoalRecord[]; error?: string };

      if (!response.ok) {
        throw new Error(result.error || "Unable to save goal.");
      }

      setGoals(result.goals ?? []);
      setSuccess(editingGoalId ? "Goal updated successfully." : "Goal created successfully.");
      closeModal();
    } catch (formError) {
      setError(formError instanceof Error ? formError.message : "Unable to save goal.");
    } finally {
      setSaving(false);
    }
  };

  const deleteGoal = async (goalId: string) => {
    if (!window.confirm("Delete this draft goal?")) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorLabel: "Employee" }),
      });

      const result = (await response.json()) as { goals?: GoalRecord[]; error?: string };

      if (!response.ok) {
        throw new Error(result.error || "Unable to delete goal.");
      }

      setGoals(result.goals ?? []);
      setSuccess("Draft goal deleted.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete goal.");
    }
  };

  const submitAllGoals = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/goals/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: DEFAULT_EMPLOYEE_ID, actorLabel: "Employee" }),
      });

      const result = (await response.json()) as { goals?: GoalRecord[]; error?: string };

      if (!response.ok) {
        throw new Error(result.error || "Unable to submit goals.");
      }

      setGoals(result.goals ?? []);
      setSuccess("All goals submitted for manager review.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit goals.");
    } finally {
      setSubmitting(false);
    }
  };

  const draftCount = goals.filter((goal) => goal.status === "draft").length;
  const submittedCount = goals.filter((goal) => goal.status === "submitted").length;

  return (
    <main className="min-h-screen bg-black text-white flex">
      <Sidebar />

      <section className="flex-1 p-8">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-bold">Goals</h1>
            <p className="mt-2 text-gray-400">
              Create draft goals, keep editing until submission, and lock the set for review.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={refreshGoals}
              className="rounded-xl border border-white/10 px-5 py-3 transition hover:bg-white/5"
            >
              Refresh
            </button>
            <button
              onClick={openCreateModal}
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-700"
            >
              + Create Goal
            </button>
            <button
              onClick={submitAllGoals}
              disabled={submitting || loading || goals.length === 0}
              className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit All Goals"}
            </button>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="mb-2 text-sm text-gray-400">Goals</p>
            <h2 className="text-4xl font-bold">{goals.length}</h2>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="mb-2 text-sm text-gray-400">Draft</p>
            <h2 className="text-4xl font-bold">{draftCount}</h2>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="mb-2 text-sm text-gray-400">Submitted</p>
            <h2 className="text-4xl font-bold">{submittedCount}</h2>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="mb-2 text-sm text-gray-400">Total Weightage</p>
            <h2 className="text-4xl font-bold">{totalWeightage}%</h2>
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
            Max {GOAL_LIMIT} goals per employee
          </span>
          <span
            className={`rounded-full px-4 py-2 ${totalWeightage === 100 ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}
          >
            {totalWeightage === 100 ? "Ready for submission" : "Weightage must total 100% before submission"}
          </span>
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-200">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-emerald-200">
            {success}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {loading ? (
            <div className="col-span-full rounded-3xl border border-white/10 bg-white/5 p-8 text-gray-400">
              Loading goals...
            </div>
          ) : goals.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-white/10 bg-white/5 p-8 text-gray-400">
              No goals have been created yet.
            </div>
          ) : (
            goals.map((goal) => (
              <article key={goal.id} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-bold">{goal.title}</h2>
                      <span
                        className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] ${goal.status === "submitted" ? "bg-emerald-500/20 text-emerald-300" : "bg-sky-500/20 text-sky-300"}`}
                      >
                        {goal.status}
                      </span>
                    </div>
                    <p className="mb-2 text-sm text-gray-400">{goal.description}</p>
                    <p className="text-sm text-gray-500">
                      {goal.thrustArea} • {goal.quarter} • {goal.measurementType}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(goal)}
                      disabled={goal.status !== "draft"}
                      className="rounded-xl bg-amber-500/15 px-4 py-2 text-sm text-amber-300 transition hover:bg-amber-500/25 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      disabled={goal.status !== "draft"}
                      className="rounded-xl bg-red-500/15 px-4 py-2 text-sm text-red-300 transition hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="rounded-2xl bg-black/30 p-4">
                    <p className="mb-1 text-gray-400">Target</p>
                    <p className="text-lg font-semibold">{goal.target}</p>
                  </div>
                  <div className="rounded-2xl bg-black/30 p-4">
                    <p className="mb-1 text-gray-400">Weightage</p>
                    <p className="text-lg font-semibold">{goal.weightage}%</p>
                  </div>
                  <div className="rounded-2xl bg-black/30 p-4">
                    <p className="mb-1 text-gray-400">Unit of Measure</p>
                    <p className="text-lg font-semibold">{goal.uom}</p>
                  </div>
                  <div className="rounded-2xl bg-black/30 p-4">
                    <p className="mb-1 text-gray-400">Measurement Type</p>
                    <p className="text-lg font-semibold">{goal.measurementType}</p>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {showModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
            <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-zinc-950 p-8 shadow-2xl shadow-black/40">
              <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold">
                    {editingGoalId ? "Edit Draft Goal" : "Create Draft Goal"}
                  </h2>
                  <p className="mt-2 text-gray-400">
                    Draft goals remain editable until you submit the full set.
                  </p>
                </div>

                <button onClick={closeModal} className="text-3xl text-gray-400 hover:text-white">
                  ×
                </button>
              </div>

              <form onSubmit={submitForm} className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm text-gray-300">Goal Title</span>
                    <input
                      value={form.title}
                      onChange={(event) => updateForm("title", event.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-blue-500"
                      placeholder="Launch enterprise renewal plan"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm text-gray-300">Thrust Area</span>
                    <input
                      value={form.thrustArea}
                      onChange={(event) => updateForm("thrustArea", event.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-blue-500"
                      placeholder="Revenue Growth"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm text-gray-300">Description</span>
                  <textarea
                    value={form.description}
                    onChange={(event) => updateForm("description", event.target.value)}
                    className="h-28 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-blue-500"
                    placeholder="Describe the outcome, scope, and success criteria."
                  />
                </label>

                <div className="grid gap-5 md:grid-cols-4">
                  <label className="block">
                    <span className="mb-2 block text-sm text-gray-300">Target</span>
                    <input
                      value={form.target}
                      onChange={(event) => updateForm("target", event.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-blue-500"
                      placeholder="1000000"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm text-gray-300">Unit</span>
                    <input
                      value={form.uom}
                      onChange={(event) => updateForm("uom", event.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-blue-500"
                      placeholder="INR"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm text-gray-300">Weightage %</span>
                    <input
                      type="number"
                      min="10"
                      value={form.weightage}
                      onChange={(event) => updateForm("weightage", event.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-blue-500"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm text-gray-300">Quarter</span>
                    <select
                      value={form.quarter}
                      onChange={(event) => updateForm("quarter", event.target.value as GoalQuarter)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-blue-500"
                    >
                      {QUARTERS.map((quarter) => (
                        <option key={quarter} value={quarter}>
                          {quarter}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm text-gray-300">Measurement Type</span>
                  <select
                    value={form.measurementType}
                    onChange={(event) => updateForm("measurementType", event.target.value as MeasurementType)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    {MEASUREMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-xl border border-white/10 px-5 py-3 transition hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? "Saving..." : editingGoalId ? "Update Goal" : "Save Goal"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
