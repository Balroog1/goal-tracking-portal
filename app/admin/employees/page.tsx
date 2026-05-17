import Link from "next/link";

const demoEmployees = [
  { name: "Employee Demo", email: "employee@demo.com", role: "Employee" },
  { name: "Manager Demo", email: "manager@demo.com", role: "Manager" },
  { name: "Admin Demo", email: "admin@demo.com", role: "Admin" },
];

export default function ManageEmployeesPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Administration</p>
            <h1 className="mt-2 text-4xl font-bold">Manage Employees</h1>
            <p className="mt-3 text-gray-400">Review demo accounts and role assignments from a central view.</p>
          </div>

          <Link href="/admin/dashboard" className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold transition hover:bg-white/10">
            Back to dashboard
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {demoEmployees.map((employee) => (
            <article key={employee.email} className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm uppercase tracking-[0.25em] text-gray-400">{employee.role}</p>
              <h2 className="mt-3 text-2xl font-bold">{employee.name}</h2>
              <p className="mt-2 text-gray-300">{employee.email}</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}