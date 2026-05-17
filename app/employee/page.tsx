import Link from "next/link";

export default function DashboardPage() {
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
            className="block px-4 py-3 rounded-xl bg-blue-600"
          >
            Dashboard
          </Link>

          <Link
            href="/goals"
            className="block px-4 py-3 rounded-xl hover:bg-white/10 transition"
          >
            Goals
          </Link>

          <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/10 transition">
            Check-ins
          </button>

          <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/10 transition">
            Analytics
          </button>

          <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/10 transition">
            Reports
          </button>

        </nav>

      </aside>

      {/* Main Content */}
      <section className="flex-1 p-8">

        {/* Top Bar */}
        <div className="flex items-center justify-between mb-10">

          <div>
            <h1 className="text-4xl font-bold">
              Employee Dashboard
            </h1>

            <p className="text-gray-400 mt-2">
              Welcome back, Employee
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 px-5 py-3 rounded-xl">
            Q2 Check-in Active
          </div>

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

      </section>

    </main>
  );
}