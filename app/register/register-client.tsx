"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { type AppRole } from "@/lib/goal-types";

const ROLE_OPTIONS: AppRole[] = ["employee", "manager", "admin"];

const roleInfo: Record<AppRole, { title: string; description: string }> = {
  employee: { title: "Employee signup", description: "Create your profile and start tracking goals." },
  manager: { title: "Manager signup", description: "Set up review access for team approvals." },
  admin: { title: "Admin signup", description: "Provision company-level management access." },
};

export default function RegisterClient({ initialRole }: { initialRole: AppRole }) {
  const router = useRouter();
  const [role, setRole] = useState<AppRole>(initialRole);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const info = useMemo(() => roleInfo[role], [role]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.replace(`/login?role=${role}&email=${encodeURIComponent(email || `${role}@demo.com`)}`);
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
        <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Role-based signup</p>
        <h1 className="mt-2 text-4xl font-bold">{info.title}</h1>
        <p className="mt-3 text-gray-400">{info.description}</p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
          <div>
            <label className="mb-2 block text-sm text-gray-300">Full name</label>
            <input value={fullName} onChange={(event) => setFullName(event.target.value)} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-blue-500" placeholder="Jane Doe" />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">Work email</label>
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-blue-500" placeholder={`${role}@company.com`} />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">Role</label>
            <select value={role} onChange={(event) => setRole(event.target.value as AppRole)} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-blue-500">
              {ROLE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="rounded-xl bg-blue-600 py-3 font-semibold transition hover:bg-blue-700">
            Continue to login
          </button>
        </form>

        <p className="mt-5 text-sm text-gray-400">
          Demo access is provisioned through the existing login flow after you confirm the role.
        </p>
      </div>
    </main>
  );
}