"use client";
import Link from "next/link";
import { useState, FormEvent } from "react";

export default function GoalsPage() {

  const [showModal, setShowModal] = useState(false);
  const [goals, setGoals] = useState([
  {
    title: "Increase Sales Revenue",
    description: "Improve quarterly sales performance by expanding enterprise client acquisition.",
    progress: 78,
    target: "₹10,00,000",
    achievement: "₹7,80,000",
    weightage: 25,
    status: "On Track",
  },
  {
    title: "Customer Satisfaction",
    description: "Increase customer satisfaction score through faster issue resolution.",
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

const handleAddGoal = (e: FormEvent) => {

  e.preventDefault();

  const newGoal = {
    title,
    description,
    progress: 0,
    target,
    achievement: "0",
    weightage,
    status: "Just Started",
  };

  setGoals([newGoal, ...goals]);

  setTitle("");
  setDescription("");
  setTarget("");
  setWeightage("");

  setShowModal(false);
};

const handleDeleteGoal = (indexToDelete: number) => {
  const updatedGoals = goals.filter(
    (_, index) => index !== indexToDelete
  );

  setGoals(updatedGoals);
};

  return (
    <main className="min-h-screen bg-black text-white flex">

      {/* Sidebar */}
      <aside className="w-72 bg-white/5 border-r border-white/10 p-6 hidden md:flex flex-col">

        <h1 className="text-3xl font-bold mb-10 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          GoalPortal
        </h1>

        <nav className="space-y-3">

          <Link
            href="/dashboard"
            className="block px-4 py-3 rounded-xl hover:bg-white/10 transition"
          >
            Dashboard
          </Link>

          <Link
            href="/goals"
            className="block px-4 py-3 rounded-xl bg-blue-600"
          >
            Goals
          </Link>

          <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/10 transition">
            Check-ins
          </button>

          <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/10 transition">
            Analytics
          </button>

        </nav>

      </aside>

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
                Create Goal
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
                Save Goal
              </button>

            </form>

          </div>

        </div>

      )}
    </main>
  );
}