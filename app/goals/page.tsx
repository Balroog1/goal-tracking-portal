"use client";
import Link from "next/link";
import { useState, useEffect, FormEvent } from "react";
import Sidebar from "@/components/Sidebar";
type Goal = {
  title: string;
  description: string;
  progress: number;
  target: string;
  achievement: string;
  weightage: number | string;
  status: string;
};

export default function GoalsPage() {

  const [showModal, setShowModal] = useState(false);

  const [goals, setGoals] = useState<Goal[]>([
    {
      title: "Increase Sales Revenue",
      description:
        "Improve quarterly sales performance by expanding enterprise client acquisition.",
      progress: 78,
      target: "₹10,00,000",
      achievement: "₹7,80,000",
      weightage: 25,
      status: "On Track",
    },
    {
      title: "Customer Satisfaction",
      description:
        "Increase customer satisfaction score through faster issue resolution.",
      progress: 62,
      target: "95%",
      achievement: "62%",
      weightage: 20,
      status: "In Progress",
    },
  ]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState("");
  const [weightage, setWeightage] = useState("");
  const [editingIndex, setEditingIndex] =
  useState<number | null>(null);

  const handleAddGoal = (e: FormEvent) => {

  e.preventDefault();

  const newGoal = {
    title,
    description,
    progress: editingIndex !== null
      ? goals[editingIndex].progress
      : 0,
    target,
    achievement:
      editingIndex !== null
        ? goals[editingIndex].achievement
        : "0",
    weightage,
    status:
      editingIndex !== null
        ? goals[editingIndex].status
        : "Just Started",
  };

  if (editingIndex !== null) {

    const updatedGoals = [...goals];

    updatedGoals[editingIndex] = newGoal;

    setGoals(updatedGoals);

  } else {

    setGoals([newGoal, ...goals]);

  }

  setTitle("");
  setDescription("");
  setTarget("");
  setWeightage("");

  setEditingIndex(null);

  setShowModal(false);
};
  
const handleEditGoal = (index: number) => {

  const goal = goals[index];

  setTitle(goal.title);
  setDescription(goal.description);
  setTarget(goal.target);
  setWeightage(String(goal.weightage));

  setEditingIndex(index);

  setShowModal(true);
};

  const handleDeleteGoal = (indexToDelete: number) => {

    const updatedGoals = goals.filter(
      (_, index) => index !== indexToDelete
    );

    setGoals(updatedGoals);
  };

  const updateProgress = (
    indexToUpdate: number,
    amount: number
  ) => {

    const updatedGoals = [...goals];

    updatedGoals[indexToUpdate].progress =
      Math.max(
        0,
        Math.min(
          100,
          updatedGoals[indexToUpdate].progress + amount
        )
      );

    setGoals(updatedGoals);
  };

  useEffect(() => {

  const savedGoals = localStorage.getItem("goals");

  if (savedGoals) {
    setGoals(JSON.parse(savedGoals));
  }

}, []);

useEffect(() => {

  localStorage.setItem(
    "goals",
    JSON.stringify(goals)
  );

}, [goals]);

  return (
    <main className="min-h-screen bg-black text-white flex">

      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <section className="flex-1 p-8">

        <div className="flex items-center justify-between mb-10">

          <div>
            <h1 className="text-4xl font-bold">
              Goals
            </h1>

            <p className="text-gray-400 mt-2">
              Manage and track employee goals
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 transition px-6 py-3 rounded-xl font-semibold"
          >
            + Create Goal
          </button>

        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {goals.map((goal, index) => (

            <div
              key={index}
              className="bg-white/5 border border-white/10 rounded-3xl p-6"
            >

              <div className="flex items-center justify-between mb-5">

                <div>
                  <h2 className="text-2xl font-bold">
                    {goal.title}
                  </h2>

                  <p className="text-gray-400 text-sm mt-1">
                    Weightage: {goal.weightage}%
                  </p>
                </div>

                <div className="flex items-center gap-3">

                  <span className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-sm">
                    {goal.status}
                  </span>

                  <button
                     onClick={() => handleEditGoal(index)}
                     className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 px-3 py-2 rounded-xl text-sm transition"
                  >
                     Edit
                  </button>

                  <button
                    onClick={() => handleDeleteGoal(index)}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded-xl text-sm transition"
                  >
                    Delete
                  </button>

                </div>

              </div>

              <p className="text-gray-300 mb-6">
                {goal.description}
              </p>

              <div className="mb-4">

                <div className="flex justify-between mb-2 text-sm text-gray-400">
                  <span>Progress</span>
                  <span>{goal.progress}%</span>
                </div>

                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">

                  <div
                    className="bg-blue-500 h-full rounded-full"
                    style={{ width: `${goal.progress}%` }}
                  ></div>

                </div>

              </div>

              {/* Progress Buttons */}
              <div className="flex gap-3 mt-4">

                <button
                  onClick={() => updateProgress(index, -10)}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-xl transition"
                >
                  -10%
                </button>

                <button
                  onClick={() => updateProgress(index, 10)}
                  className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-xl transition"
                >
                  +10%
                </button>

              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">

                <div className="bg-black/30 rounded-2xl p-4">
                  <p className="text-gray-400 text-sm">
                    Target
                  </p>

                  <h3 className="text-xl font-bold mt-1">
                    {goal.target}
                  </h3>
                </div>

                <div className="bg-black/30 rounded-2xl p-4">
                  <p className="text-gray-400 text-sm">
                    Achievement
                  </p>

                  <h3 className="text-xl font-bold mt-1">
                    {goal.achievement}
                  </h3>
                </div>

              </div>

            </div>

          ))}

        </div>

      </section>

      {/* Modal */}
      {showModal && (

        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-50">

          <div className="w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-3xl p-8">

            <div className="flex items-center justify-between mb-8">

              <h2 className="text-3xl font-bold">
                {editingIndex !== null
                  ? "Edit Goal"
                  : "Create Goal"}
              </h2>

              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>

            </div>

            <form onSubmit={handleAddGoal} className="space-y-5">

              <div>
                <label className="block mb-2 text-gray-300">
                  Goal Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Increase Revenue"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block mb-2 text-gray-300">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the goal..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 h-32"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-5">

                <div>
                  <label className="block mb-2 text-gray-300">
                    Target
                  </label>

                  <input
                    type="text"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="₹10,00,000"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-gray-300">
                    Weightage %
                  </label>

                  <input
                    type="number"
                    value={weightage}
                    onChange={(e) => setWeightage(e.target.value)}
                    placeholder="25"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 transition py-3 rounded-xl font-semibold"
              >
                {editingIndex !== null
                 ? "Update Goal"
                 : "Save Goal"}
              </button>

            </form>

          </div>

        </div>

      )}

    </main>
  );
}