import Link from "next/link";
export default function LoginPage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">

      <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-8">

        <h1 className="text-4xl font-bold mb-2 text-center bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          Welcome Back
        </h1>

        <p className="text-gray-400 text-center mb-8">
          Login to your Goal Tracking Portal
        </p>

        <form className="space-y-5">

          <div>
            <label className="block mb-2 text-sm text-gray-300">
              Email
            </label>

            <input
              type="email"
              placeholder="employee@company.com"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-300">
              Password
            </label>

            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500"
            />
          </div>

          <Link
  href="/dashboard"
  className="block text-center w-full bg-blue-600 hover:bg-blue-700 transition rounded-xl py-3 font-semibold"
>
  Login
</Link>

        </form>

        <div className="mt-8 text-sm text-gray-400 text-center">
          Demo Accounts:
          <br />
          employee@demo.com
          <br />
          manager@demo.com
          <br />
          admin@demo.com
        </div>

      </div>

    </main>
  );
}