"use client";

import { useMemo, useState } from "react";
import { filterAuditEntries, DEFAULT_AUDIT_FILTERS, summarizeAuditEntries, type AuditReportFilters } from "@/lib/audit-reports";
import { type AuditReport } from "@/lib/goal-types";

const ACTION_OPTIONS: Array<AuditReportFilters["action"]> = ["all", "created", "updated", "deleted", "submitted"];
const ROLE_OPTIONS: Array<AuditReportFilters["actorRole"]> = ["all", "employee", "manager", "admin"];

export default function ReportsClient({ report }: { report: AuditReport }) {
  const [filters, setFilters] = useState<AuditReportFilters>(DEFAULT_AUDIT_FILTERS);

  const filteredEntries = useMemo(() => filterAuditEntries(report.entries, filters), [filters, report.entries]);
  const filteredSummary = useMemo(() => summarizeAuditEntries(filteredEntries), [filteredEntries]);
  const exportHref = useMemo(() => {
    const params = new URLSearchParams();

    if (filters.action !== "all") params.set("action", filters.action);
    if (filters.actorRole !== "all") params.set("actorRole", filters.actorRole);
    if (filters.employeeId.trim()) params.set("employeeId", filters.employeeId.trim());
    if (filters.keyword.trim()) params.set("keyword", filters.keyword.trim());
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    params.set("limit", "1000");

    const query = params.toString();
    return query ? `/api/reports/export?${query}` : "/api/reports/export";
  }, [filters]);

  const updateFilter = <K extends keyof AuditReportFilters>(key: K, value: AuditReportFilters[K]) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  return (
    <main className="min-h-screen bg-black p-6 text-white md:p-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-blue-300">Audit & Reports</p>
          <h1 className="mt-2 text-4xl font-bold md:text-5xl">Reports</h1>
          <p className="mt-3 max-w-2xl text-gray-400">Filter recent changes, review who made them, and export the audit trail as CSV.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href="/api/reports"
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold transition hover:bg-white/10"
          >
            Download JSON
          </a>
          <a
            href={exportHref}
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-700"
          >
            Download CSV
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <StatCard label="Visible" value={filteredSummary.totalEntries} />
        <StatCard label="Created" value={filteredSummary.createdCount} />
        <StatCard label="Updated" value={filteredSummary.updatedCount} />
        <StatCard label="Deleted" value={filteredSummary.deletedCount} />
        <StatCard label="Submitted" value={filteredSummary.submittedCount} />
      </div>

      <section className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
          <FilterField label="Action">
            <Select value={filters.action} onChange={(value) => updateFilter("action", value as AuditReportFilters["action"]) } options={ACTION_OPTIONS} />
          </FilterField>
          <FilterField label="Role">
            <Select value={filters.actorRole} onChange={(value) => updateFilter("actorRole", value as AuditReportFilters["actorRole"]) } options={ROLE_OPTIONS} />
          </FilterField>
          <FilterField label="Employee">
            <input
              value={filters.employeeId}
              onChange={(event) => updateFilter("employeeId", event.target.value)}
              placeholder="employee-demo"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </FilterField>
          <FilterField label="Keyword">
            <input
              value={filters.keyword}
              onChange={(event) => updateFilter("keyword", event.target.value)}
              placeholder="goal, actor, note..."
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </FilterField>
          <FilterField label="From">
            <input
              type="date"
              value={filters.from}
              onChange={(event) => updateFilter("from", event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </FilterField>
          <FilterField label="To">
            <input
              type="date"
              value={filters.to}
              onChange={(event) => updateFilter("to", event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </FilterField>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4 text-sm text-gray-400">
          <p>
            Showing {filteredEntries.length} of {report.entries.length} entries
          </p>
          <button
            type="button"
            onClick={() => setFilters(DEFAULT_AUDIT_FILTERS)}
            className="rounded-lg border border-white/10 px-4 py-2 text-white transition hover:bg-white/10"
          >
            Reset filters
          </button>
        </div>
      </section>

      <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">Recent Audit Trail</h2>
          <p className="text-sm text-gray-400">{filteredSummary.employeeCount} employees touched</p>
        </div>

        <div className="space-y-4">
          {filteredEntries.length === 0 ? (
            <p className="text-gray-400">No audit entries match the current filters.</p>
          ) : (
            filteredEntries.map((entry) => (
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

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-300">
                  <span className="rounded-full border border-white/10 px-3 py-1">Goal {entry.goalId}</span>
                  <span className="rounded-full border border-white/10 px-3 py-1">{entry.actorRole}</span>
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

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-gray-300">{label}</span>
      {children}
    </label>
  );
}

function Select({ options, value, onChange }: { options: Array<string>; value: string; onChange: (value: string) => void }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-blue-500"
    >
      {options.map((option) => (
        <option key={option} value={option} className="bg-black">
          {option === "all" ? "All" : option.charAt(0).toUpperCase() + option.slice(1)}
        </option>
      ))}
    </select>
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
