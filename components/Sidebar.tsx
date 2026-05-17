"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Sidebar() {

  const router = useRouter();

  return (

    <aside className="w-72 bg-white/5 border-r border-white/10 p-6 hidden md:flex flex-col">

      <h1 className="text-3xl font-bold mb-10 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
        GoalPortal
      </h1>

      <nav className="space-y-3">

        <Link
          href="/employee"
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
          className="block px-4 py-3 rounded-xl hover:bg-white/10 transition"
        >
          Analytics
        </Link>

      </nav>

      <button
        onClick={() => {

          localStorage.removeItem("role");

          router.push("/login");

        }}
        className="mt-auto bg-red-500 hover:bg-red-600 transition px-5 py-3 rounded-xl font-semibold"
      >
        Logout
      </button>

    </aside>

  );
}