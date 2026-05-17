import { type AuditEntry, type AuditReportSummary, type GoalActorRole } from "./goal-types";

export interface AuditReportFilters {
  action: AuditEntry["action"] | "all";
  actorRole: GoalActorRole | "all";
  employeeId: string;
  keyword: string;
  from: string;
  to: string;
}

export const DEFAULT_AUDIT_FILTERS: AuditReportFilters = {
  action: "all",
  actorRole: "all",
  employeeId: "",
  keyword: "",
  from: "",
  to: "",
};

const normalize = (value: string): string => value.trim().toLowerCase();

const parseDate = (value: string): number | null => {
  if (!value) {
    return null;
  }

  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
};

export const parseAuditFilters = (searchParams: URLSearchParams): AuditReportFilters => ({
  action: (searchParams.get("action") as AuditReportFilters["action"]) ?? "all",
  actorRole: (searchParams.get("actorRole") as AuditReportFilters["actorRole"]) ?? "all",
  employeeId: searchParams.get("employeeId") ?? "",
  keyword: searchParams.get("keyword") ?? "",
  from: searchParams.get("from") ?? "",
  to: searchParams.get("to") ?? "",
});

export const filterAuditEntries = (entries: AuditEntry[], filters: AuditReportFilters): AuditEntry[] => {
  const keyword = normalize(filters.keyword);
  const employeeId = normalize(filters.employeeId);
  const fromTime = parseDate(filters.from);
  const toTime = parseDate(filters.to);

  return entries.filter((entry) => {
    if (filters.action !== "all" && entry.action !== filters.action) {
      return false;
    }

    if (filters.actorRole !== "all" && entry.actorRole !== filters.actorRole) {
      return false;
    }

    if (employeeId && !normalize(entry.employeeId).includes(employeeId)) {
      return false;
    }

    const timestamp = new Date(entry.timestamp).getTime();

    if (fromTime !== null && timestamp < fromTime) {
      return false;
    }

    if (toTime !== null && timestamp > toTime + 24 * 60 * 60 * 1000 - 1) {
      return false;
    }

    if (!keyword) {
      return true;
    }

    const haystack = normalize([
      entry.action,
      entry.actorRole,
      entry.actorLabel,
      entry.employeeId,
      entry.goalId,
      ...entry.changes.map((change) => `${change.field} ${change.before ?? ""} ${change.after ?? ""}`),
    ].join(" "));

    return haystack.includes(keyword);
  });
};

export const summarizeAuditEntries = (entries: AuditEntry[]): AuditReportSummary => ({
  totalEntries: entries.length,
  createdCount: entries.filter((entry) => entry.action === "created").length,
  updatedCount: entries.filter((entry) => entry.action === "updated").length,
  deletedCount: entries.filter((entry) => entry.action === "deleted").length,
  submittedCount: entries.filter((entry) => entry.action === "submitted").length,
  employeeCount: new Set(entries.map((entry) => entry.employeeId)).size,
  actorCount: new Set(entries.map((entry) => `${entry.actorRole}:${entry.actorLabel}`)).size,
});

const escapeCsv = (value: string): string => {
  const safe = value.replace(/"/g, '""');
  return /[",\n]/.test(safe) ? `"${safe}"` : safe;
};

export const toCsv = (entries: AuditEntry[]): string => {
  const header = ["timestamp", "action", "actorRole", "actorLabel", "employeeId", "goalId", "changes"];
  const rows = entries.map((entry) => [
    entry.timestamp,
    entry.action,
    entry.actorRole,
    entry.actorLabel,
    entry.employeeId,
    entry.goalId,
    entry.changes.length === 0
      ? ""
      : entry.changes.map((change) => `${change.field}: ${String(change.before ?? "—")} -> ${String(change.after ?? "—")}`).join(" | "),
  ].map((value) => escapeCsv(String(value))).join(","));

  return [header.join(","), ...rows].join("\n");
};
