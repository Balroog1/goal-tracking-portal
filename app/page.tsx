import Link from "next/link";
export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">

      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/20 blur-3xl rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/20 blur-3xl rounded-full"></div>

      {/* Navbar */}
      <nav className="w-full flex items-center justify-between px-8 py-6 border-b border-white/10 backdrop-blur-md">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          GoalPortal
        </h1>

        <div className="flex gap-4">
          <button className="px-5 py-2 rounded-lg hover:bg-white/10 transition">
            Login
          </button>

          <button className="bg-blue-600 hover:bg-blue-700 transition px-5 py-2 rounded-lg">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-28">

        <div className="max-w-5xl">

          <h1 className="text-6xl md:text-8xl font-extrabold leading-tight mb-8 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 text-transparent bg-clip-text">
            Enterprise Goal Tracking Portal
          </h1>

          <p className="text-gray-300 text-lg md:text-2xl mb-12 leading-relaxed">
            Streamline employee goal management, approvals,
            quarterly check-ins, and performance analytics
            in one centralized platform.
          </p>

          <div className="flex gap-5 justify-center flex-wrap">

           <Link
  href="/login"
  className="bg-blue-600 hover:bg-blue-700 transition px-8 py-4 rounded-2xl text-lg font-semibold shadow-lg shadow-blue-500/20"
>
  Employee Login
</Link>

            <button className="border border-white/20 hover:border-white/40 hover:bg-white/5 transition px-8 py-4 rounded-2xl text-lg font-semibold">
              Manager Dashboard
            </button>

          </div>

        </div>

      </section>

      {/* Features */}
      <section className="px-8 pb-20">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
            <h3 className="text-2xl font-bold mb-4">
              Goal Management
            </h3>

            <p className="text-gray-400">
              Create, edit, approve, and manage employee
              goals with structured workflows.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
            <h3 className="text-2xl font-bold mb-4">
              Quarterly Check-ins
            </h3>

            <p className="text-gray-400">
              Track planned vs actual achievements with
              real-time performance visibility.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
            <h3 className="text-2xl font-bold mb-4">
              Analytics Dashboard
            </h3>

            <p className="text-gray-400">
              Visualize progress trends, completion rates,
              and organizational insights.
            </p>
          </div>

        </div>

      </section>

    </main>
  );
}