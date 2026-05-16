"use client";
import Link from "next/link";
import { useState } from "react";

export default function GoalsPage() {

  const [showModal, setShowModal] = useState(false);

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

          {/* Goal Card */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">

            <div className="flex items-center justify-between mb-5">

              <div>
                <h2 className="text-2xl font-bold">
                  Increase Sales Revenue
                </h2>

                <p className="text-gray-400 text-sm mt-1">
                  Weightage: 25%
                </p>
              </div>

              <span className="bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm">
                On Track
              </span>

            </div>

            <p className="text-gray-300 mb-6">
              Improve quarterly sales performance
              by expanding enterprise client acquisition.
            </p>

            {/* Progress */}
            <div className="mb-4">

              <div className="flex justify-between mb-2 text-sm text-gray-400">
                <span>Progress</span>
                <span>78%</span>
              </div>

              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">

                <div className="bg-blue-500 h-full w-[78%] rounded-full"></div>

              </div>

            </div>

            {/* Goal Details */}
            <div className="grid grid-cols-2 gap-4 mt-6">

              <div className="bg-black/30 rounded-2xl p-4">
                <p className="text-gray-400 text-sm">
                  Target
                </p>

                <h3 className="text-xl font-bold mt-1">
                  ₹10,00,000
                </h3>
              </div>

              <div className="bg-black/30 rounded-2xl p-4">
                <p className="text-gray-400 text-sm">
                  Achievement
                </p>

                <h3 className="text-xl font-bold mt-1">
                  ₹7,80,000
                </h3>
              </div>

            </div>

          </div>

          {/* Second Goal */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">

            <div className="flex items-center justify-between mb-5">

              <div>
                <h2 className="text-2xl font-bold">
                  Customer Satisfaction
                </h2>

                <p className="text-gray-400 text-sm mt-1">
                  Weightage: 20%
                </p>
              </div>

              <span className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full text-sm">
                In Progress
              </span>

            </div>

            <p className="text-gray-300 mb-6">
              Increase customer satisfaction score
              through faster issue resolution.
            </p>

            <div className="mb-4">

              <div className="flex justify-between mb-2 text-sm text-gray-400">
                <span>Progress</span>
                <span>62%</span>
              </div>

              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">

                <div className="bg-purple-500 h-full w-[62%] rounded-full"></div>

              </div>

            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">

              <div className="bg-black/30 rounded-2xl p-4">
                <p className="text-gray-400 text-sm">
                  Target
                </p>

                <h3 className="text-xl font-bold mt-1">
                  95%
                </h3>
              </div>

              <div className="bg-black/30 rounded-2xl p-4">
                <p className="text-gray-400 text-sm">
                  Achievement
                </p>

                <h3 className="text-xl font-bold mt-1">
                  62%
                </h3>
              </div>

            </div>

          </div>

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

            <form className="space-y-5">

              <div>
                <label className="block mb-2 text-gray-300">
                  Goal Title
                </label>

                <input
                  type="text"
                  placeholder="Increase Revenue"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block mb-2 text-gray-300">
                  Description
                </label>

                <textarea
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