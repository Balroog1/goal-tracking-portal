"use client";

import Sidebar from "@/components/Sidebar";

export default function AdminPage() {

  return (

    <main className="min-h-screen bg-black text-white flex">

      <Sidebar />

      <section className="flex-1 p-10">

        <h1 className="text-5xl font-bold mb-4">
          Admin Dashboard
        </h1>

        <p className="text-gray-400 text-xl mb-10">
          Company-wide analytics and system controls.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">

            <p className="text-gray-400 mb-3">
              Total Employees
            </p>

            <h2 className="text-5xl font-bold">
              128
            </h2>

          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">

            <p className="text-gray-400 mb-3">
              Active Managers
            </p>

            <h2 className="text-5xl font-bold">
              12
            </h2>

          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">

            <p className="text-gray-400 mb-3">
              Goals Completed
            </p>

            <h2 className="text-5xl font-bold">
              87%
            </h2>

          </div>

        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">

          <h2 className="text-3xl font-bold mb-6">
            System Controls
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <button className="bg-blue-600 hover:bg-blue-700 transition rounded-2xl p-6 text-left">

              <h3 className="text-2xl font-bold mb-2">
                Manage Employees
              </h3>

              <p className="text-white/70">
                Add, edit, or remove employee accounts.
              </p>

            </button>

            <button className="bg-purple-600 hover:bg-purple-700 transition rounded-2xl p-6 text-left">

              <h3 className="text-2xl font-bold mb-2">
                Generate Reports
              </h3>

              <p className="text-white/70">
                Export company performance reports.
              </p>

            </button>

          </div>

        </div>

      </section>

    </main>

  );
}