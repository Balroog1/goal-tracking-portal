"use client";

import Link from "next/link";
import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function DashboardPage() {
    const router = useRouter();
    useEffect(() => {

  const role = localStorage.getItem("role");

  if (role !== "employee") {

    router.push("/login");

  }

}, [router]);
    const handleLogout = () => {

  localStorage.removeItem("role");

  router.push("/login");
};
  return (
    <main className="min-h-screen bg-black text-white flex">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <section className="flex-1 p-8">
        <Topbar />

        {/* Top Bar */}
        <div className="flex items-center gap-4">

            <div className="bg-white/5 border border-white/10 px-5 py-3 rounded-xl">
              Q2 Check-in Active
            </div>

             <button
               onClick={handleLogout}
               className="bg-red-500 hover:bg-red-600 transition px-5 py-3 rounded-xl font-semibold"
             >
              Logout
             </button>

        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <h3 className="text-gray-400 mb-2">
              Active Goals
            </h3>

            <p className="text-5xl font-bold">
              6
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <h3 className="text-gray-400 mb-2">
              Completion Rate
            </h3>

            <p className="text-5xl font-bold">
              78%
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <h3 className="text-gray-400 mb-2">
              Pending Reviews
            </h3>

            <p className="text-5xl font-bold">
              2
            </p>
          </div>

        </div>

        {/* Goals Section */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">

          <div className="flex items-center justify-between mb-8">

            <h2 className="text-2xl font-bold">
              Current Goals
            </h2>

            <button className="bg-blue-600 hover:bg-blue-700 transition px-5 py-3 rounded-xl">
              + Add Goal
            </button>

          </div>

          <div className="space-y-5">

            {/* Goal Card */}
            <div className="bg-black/30 border border-white/10 rounded-2xl p-5">

              <div className="flex items-center justify-between mb-4">

                <div>
                  <h3 className="text-xl font-semibold">
                    Increase Sales Revenue
                  </h3>

                  <p className="text-gray-400 text-sm">
                    Weightage: 25%
                  </p>
                </div>

                <span className="bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm">
                  On Track
                </span>

              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">

                <div className="bg-blue-500 h-full w-[78%] rounded-full"></div>

              </div>

              <p className="text-gray-400 mt-3 text-sm">
                Progress: 78%
              </p>

            </div>

          </div>

        </div>

      <div className="mt-10 bg-white/5 border border-white/10 rounded-3xl p-8">

  <h2 className="text-3xl font-bold mb-6">
    Recent Activity
  </h2>

  <div className="space-y-5">

    <div className="flex items-start gap-4">

      <div className="w-3 h-3 bg-green-400 rounded-full mt-2"></div>

      <div>

        <p className="font-semibold">
          Sales Revenue goal updated
        </p>

        <p className="text-gray-400 text-sm">
          Progress increased to 78%
        </p>

      </div>

    </div>

    <div className="flex items-start gap-4">

      <div className="w-3 h-3 bg-blue-400 rounded-full mt-2"></div>

      <div>

        <p className="font-semibold">
          New goal created
        </p>

        <p className="text-gray-400 text-sm">
          Customer Satisfaction goal added
        </p>

      </div>

    </div>

    <div className="flex items-start gap-4">

      <div className="w-3 h-3 bg-purple-400 rounded-full mt-2"></div>

      <div>

        <p className="font-semibold">
          Analytics report generated
        </p>

        <p className="text-gray-400 text-sm">
          Weekly performance report exported
        </p>

      </div>

    </div>

  </div>

</div>
      
      </section>

    </main>
  );
}