import { getAuditReport } from "@/lib/goals";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const report = await getAuditReport(30);

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Audit & Reports</p>
          <h1 className="mt-2 text-5xl font-bold">Reports</h1>
          <p className="mt-3 max-w-2xl text-gray-400">Track recent goal changes, ownership, and submission activity across the portal.</p>
        </div>

        <a
          href="/api/reports"
          className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold transition hover:bg-white/10"
        >
          Download JSON
        </a>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
        <StatCard label="Entries" value={report.summary.totalEntries} />
        <StatCard label="Created" value={report.summary.createdCount} />
        <StatCard label="Updated" value={report.summary.updatedCount} />
        <StatCard label="Deleted" value={report.summary.deletedCount} />
        <StatCard label="Submitted" value={report.summary.submittedCount} />
        <StatCard label="Actors" value={report.summary.actorCount} />
      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">Recent Audit Trail</h2>
          <p className="text-sm text-gray-400">{report.summary.employeeCount} employees touched</p>
        </div>

        <div className="space-y-4">
          {report.entries.length === 0 ? (
            <p className="text-gray-400">No audit entries yet.</p>
          ) : (
            report.entries.map((entry) => (
              <article key={entry.id} className="rounded-2xl border border-white/10 bg-black/30 p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold capitalize">{entry.action}</p>
                    <p className="text-sm text-gray-400">
                      {entry.actorLabel} • {entry.actorRole} • {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-full bg-white/10 px-4 py-2 text-sm text-gray-300">
                    {entry.employeeId}
                  </div>
                </div>

                {entry.changes.length > 0 ? (
                  <div className="mt-4 grid gap-2 md:grid-cols-2">
                    {entry.changes.map((change) => (
                      <div key={change.field} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300">
                        <span className="font-semibold text-white">{change.field}</span>: {String(change.before ?? "—")} → {String(change.after ?? "—")}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-gray-400">No field changes recorded.</p>
                )}
              </article>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <p className="text-sm uppercase tracking-[0.3em] text-gray-400">{label}</p>
      <p className="mt-3 text-4xl font-bold">{value}</p>
    </div>
  );
}