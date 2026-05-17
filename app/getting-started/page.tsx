"use client";

import Link from "next/link";

const roles = [
  {
    role: "Employee",
    href: "/register?role=employee",
    description: "Track goals, submit check-ins, and review progress.",
  },
  {
    role: "Manager",
    href: "/register?role=manager",
    description: "Review team goals and approve submissions.",
  },
  {
    role: "Admin",
    href: "/register?role=admin",
    description: "Manage access, employee records, and company-wide insights.",
  },
];

export default function GettingStartedPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Onboarding</p>
            <h1 className="mt-2 text-5xl font-bold">Get Started</h1>
            <p className="mt-3 max-w-2xl text-gray-400">
              Pick the role you want to use. We’ll route you to a role-specific signup flow with the right dashboard access.
            </p>
          </div>

          <Link href="/login" className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold transition hover:bg-white/10">
            I already have access
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {roles.map((item) => (
            <Link
              key={item.role}
              href={item.href}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:border-blue-400/50 hover:bg-white/10"
            >
              <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Role</p>
              <h2 className="mt-3 text-3xl font-bold">{item.role}</h2>
              <p className="mt-3 text-sm leading-6 text-gray-400">{item.description}</p>
              <div className="mt-8 inline-flex rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
                Continue
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}