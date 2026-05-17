"use client";

import Link from "next/link";

export default function AnalyticsPage() {

  const totalGoals = 8;
  const completedGoals = 5;
  const averageProgress = 74;

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
            className="block px-4 py-3 rounded-xl hover:bg-white/10 transition"
          >
            Goals
          </Link>

          <Link
            href="/analytics"
            className="block px-4 py-3 rounded-xl bg-blue-600"
          >
            Analytics
          </Link>

        </nav>

      </aside>

      {/* Main */}
      <section className="flex-1 p-8">

        <div className="mb-10">

          <h1 className="text-4xl font-bold">
            Analytics Dashboard
          </h1>

          <p className="text-gray-400 mt-2">
            Performance insights and goal statistics
          </p>

        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">

            <p className="text-gray-400 mb-3">
              Total Goals
            </p>

            <h2 className="text-5xl font-bold">
              {totalGoals}
            </h2>

          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">

            <p className="text-gray-400 mb-3">
              Completed Goals
            </p>

            <h2 className="text-5xl font-bold">
              {completedGoals}
            </h2>

          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">

            <p className="text-gray-400 mb-3">
              Average Progress
            </p>

            <h2 className="text-5xl font-bold">
              {averageProgress}%
            </h2>

          </div>

        </div>

        {/* Fake Analytics Graph */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">

          <div className="flex items-end gap-6 h-80">

            <div className="flex flex-col items-center gap-3">
              <div className="w-16 bg-blue-500 rounded-t-2xl h-40"></div>
              <p className="text-gray-400">Jan</p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="w-16 bg-purple-500 rounded-t-2xl h-56"></div>
              <p className="text-gray-400">Feb</p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="w-16 bg-green-500 rounded-t-2xl h-72"></div>
              <p className="text-gray-400">Mar</p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="w-16 bg-yellow-500 rounded-t-2xl h-48"></div>
              <p className="text-gray-400">Apr</p>
            </div>

          </div>

        </div>

      </section>

    </main>
  );
}