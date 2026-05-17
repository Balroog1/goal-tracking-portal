import "server-only";

import { getSupabaseAdmin } from "./supabase";
import {
  DEFAULT_EMPLOYEE_ID,
  GOAL_LIMIT,
  MIN_WEIGHTAGE,
  MEASUREMENT_TYPES,
  QUARTERS,
  type AuditEntry,
  type AuditReport,
  type AuditReportSummary,
  type CheckInSummary,
  type GoalActorRole,
  type GoalApprovalStatus,
  type GoalChange,
  type GoalCheckIn,
  type GoalInput,
  type GoalProgressRecord,
  type GoalQuarter,
  type GoalRecord,
  type GoalStatus,
  type GoalSummary,
  type ManagerGoalSummary,
  type MeasurementType,
  type ProgressDashboard,
  type ProgressScope,
  type ProgressSummary,
} from "./goal-types";

interface MutationActor {
  role: GoalActorRole;
  label: string;
}

type GoalDbRow = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  thrust_area: string;
  uom: string;
  target: string;
  weightage: number;
  status: GoalStatus;
  approval_status: GoalApprovalStatus;
  is_locked: boolean;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  quarter: GoalQuarter;
  measurement_type: MeasurementType;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
};

type AchievementDbRow = {
  id: string;
  goal_id: string;
  employee_id: string;
  actual_value: string;
  status: "not_started" | "on_track" | "completed";
  quarter: GoalQuarter;
  notes: string | null;
  progress_percent: number;
  created_at: string;
  updated_at: string;
};

type AuditDbRow = {
  id: string;
  goal_id: string | null;
  employee_id: string | null;
  action: AuditEntry["action"];
  performed_by: string;
  actor_role: GoalActorRole;
  actor_label: string;
  timestamp: string;
  changes: GoalChange[];
};

// Supabase responses are handled inline at call sites; previous DbResult/DbListResult aliases removed.

const ROLE_USER_IDS: Record<GoalActorRole, string> = {
  employee: DEFAULT_EMPLOYEE_ID,
  manager: "22222222-2222-2222-2222-222222222222",
  admin: "33333333-3333-3333-3333-333333333333",
};

const toGoalRecord = (row: GoalDbRow): GoalRecord => ({
  id: row.id,
  employeeId: row.user_id,
  title: row.title,
  description: row.description,
  thrustArea: row.thrust_area,
  uom: row.uom,
  target: row.target,
  weightage: Number(row.weightage),
  status: row.status,
  approvalStatus: row.approval_status,
  isLocked: row.is_locked,
  reviewedBy: row.reviewed_by,
  reviewedAt: row.reviewed_at,
  reviewNotes: row.review_notes,
  quarter: row.quarter,
  measurementType: row.measurement_type,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  submittedAt: row.submitted_at,
});

const toCheckInRecord = (row: AchievementDbRow): GoalCheckIn => ({
  id: row.id,
  goalId: row.goal_id,
  employeeId: row.employee_id,
  quarter: row.quarter,
  actualAchievement: row.actual_value,
  status: row.status === "completed" ? "Completed" : row.status === "on_track" ? "On Track" : "Not Started",
  progressPercent: row.progress_percent,
  notes: row.notes,
  submittedAt: row.created_at,
});

const toAuditEntry = (row: AuditDbRow): AuditEntry => ({
  id: row.id,
  goalId: row.goal_id ?? "",
  employeeId: row.employee_id ?? "",
  action: row.action,
  actorRole: row.actor_role,
  actorLabel: row.actor_label,
  timestamp: row.timestamp,
  changes: row.changes ?? [],
});

const getSupabase = () => getSupabaseAdmin();

// Note: Supabase responses are unwrapped at call sites now; helper wrappers removed.

const getCurrentQuarter = (): GoalQuarter => {
  const month = new Date().getMonth();

  if (month <= 2) return "Q1";
  if (month <= 5) return "Q2";
  if (month <= 8) return "Q3";
  return "Q4";
};

const normalizeString = (value: FormDataEntryValue | undefined | null): string =>
  typeof value === "string" ? value.trim() : "";

const serializeGoalValue = (
  goal: GoalRecord,
  field: keyof GoalRecord,
): string | number | boolean | null => {
  const value = goal[field];

  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  return null;
};

const collectChanges = (before: GoalRecord, after: GoalRecord): GoalChange[] => {
  const comparableFields: Array<keyof GoalRecord> = [
    "title",
    "description",
    "thrustArea",
    "uom",
    "target",
    "weightage",
    "status",
    "approvalStatus",
    "quarter",
    "measurementType",
    "isLocked",
    "reviewedBy",
    "reviewNotes",
  ];

  return comparableFields
    .filter((field) => before[field] !== after[field])
    .map((field) => ({
      field,
      before: serializeGoalValue(before, field),
      after: serializeGoalValue(after, field),
    }));
};

const buildSummary = (goals: GoalRecord[]): GoalSummary => {
  const totalWeightage = goals.reduce((sum, goal) => sum + goal.weightage, 0);
  const draftGoals = goals.filter((goal) => goal.status === "draft").length;
  const submittedGoals = goals.filter((goal) => goal.status === "submitted").length;

  return {
    totalGoals: goals.length,
    draftGoals,
    submittedGoals,
    totalWeightage,
    isReadyForSubmission: goals.length > 0 && totalWeightage === 100,
  };
};

const validateGoalInput = (input: GoalInput): string[] => {
  const errors: string[] = [];

  if (!input.title.trim()) {
    errors.push("Goal title is required.");
  }

  if (!input.description.trim()) {
    errors.push("Goal description is required.");
  }

  if (!input.thrustArea.trim()) {
    errors.push("Thrust area is required.");
  }

  if (!input.uom.trim()) {
    errors.push("Unit of measure is required.");
  }

  if (!input.target.trim()) {
    errors.push("Target is required.");
  }

  if (!QUARTERS.includes(input.quarter)) {
    errors.push("Select a valid quarter.");
  }

  if (!MEASUREMENT_TYPES.includes(input.measurementType)) {
    errors.push("Select a valid measurement type.");
  }

  const parsedWeightage = Number(input.weightage);

  if (!Number.isFinite(parsedWeightage) || parsedWeightage <= 0) {
    errors.push("Weightage must be a positive number.");
  } else if (parsedWeightage < MIN_WEIGHTAGE) {
    errors.push(`Each goal must carry at least ${MIN_WEIGHTAGE}% weightage.`);
  }

  return errors;
};

const validateEmployeeGoalSet = (goals: GoalRecord[]): string[] => {
  const errors: string[] = [];

  if (goals.length > GOAL_LIMIT) {
    errors.push(`An employee can only have up to ${GOAL_LIMIT} goals.`);
  }

  for (const goal of goals) {
    if (goal.weightage < MIN_WEIGHTAGE) {
      errors.push(`Goal "${goal.title}" must be at least ${MIN_WEIGHTAGE}% weightage.`);
      break;
    }
  }

  const totalWeightage = goals.reduce((sum, goal) => sum + goal.weightage, 0);

  if (totalWeightage > 100) {
    errors.push("Total weightage cannot exceed 100%.");
  }

  return errors;
};

const updateGoalRecord = (
  goal: GoalRecord,
  patch: Partial<GoalRecord>,
): GoalRecord => ({
  ...goal,
  ...patch,
  updatedAt: new Date().toISOString(),
});

// `ensureGoalExists` was used in the previous file-backed implementation. Current Supabase-backed
// flows locate records via queries and throw when missing, so this helper is no longer required.

const buildManagerSummary = (goals: GoalRecord[]): ManagerGoalSummary => {
  const uniqueEmployees = new Set(goals.map((goal) => goal.employeeId));

  return {
    totalGoals: goals.length,
    pendingApprovals: goals.filter((goal) => goal.approvalStatus === "pending").length,
    approvedGoals: goals.filter((goal) => goal.approvalStatus === "approved").length,
    rejectedGoals: goals.filter((goal) => goal.approvalStatus === "rejected").length,
    lockedGoals: goals.filter((goal) => goal.isLocked).length,
    totalEmployees: uniqueEmployees.size,
  };
};

const parseNumericValue = (value: string): number | null => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeProgressPercent = (value: number): number => Math.max(0, Math.round(value));

const clampProgressPercent = (value: number): number => Math.min(100, normalizeProgressPercent(value));

const calculateCheckInResult = (
  goal: GoalRecord,
  actualAchievement: string,
): Pick<GoalCheckIn, "status" | "progressPercent"> => {
  const trimmedActual = actualAchievement.trim();

  if (!trimmedActual) {
    return { status: "Not Started", progressPercent: 0 };
  }

  if (goal.measurementType === "TIMELINE") {
    const targetDate = new Date(goal.target);
    const actualDate = new Date(trimmedActual);

    if (Number.isNaN(targetDate.getTime()) || Number.isNaN(actualDate.getTime())) {
      return { status: "On Track", progressPercent: 0 };
    }

    return actualDate.getTime() <= targetDate.getTime()
      ? { status: "Completed", progressPercent: 100 }
      : { status: "On Track", progressPercent: 0 };
  }

  const targetNumber = parseNumericValue(goal.target);
  const actualNumber = parseNumericValue(trimmedActual);

  if (goal.measurementType === "ZERO") {
    if (actualNumber === null) {
      return { status: "Not Started", progressPercent: 0 };
    }

    return actualNumber === 0
      ? { status: "Completed", progressPercent: 100 }
      : { status: "On Track", progressPercent: 0 };
  }

  if (targetNumber === null || targetNumber <= 0 || actualNumber === null || actualNumber < 0) {
    return { status: "On Track", progressPercent: 0 };
  }

  const progressPercent = goal.measurementType === "MIN"
    ? normalizeProgressPercent((actualNumber / targetNumber) * 100)
    : normalizeProgressPercent((targetNumber / Math.max(actualNumber, 1)) * 100);

  return progressPercent >= 100
    ? { status: "Completed", progressPercent }
    : { status: "On Track", progressPercent };
};

const buildProgressRecord = (
  goal: GoalRecord,
  latestCheckIn: GoalCheckIn | null,
): GoalProgressRecord => {
  const progressPercent = latestCheckIn?.progressPercent ?? 0;

  return {
    goal,
    latestCheckIn,
    status: latestCheckIn?.status ?? "Not Started",
    progressPercent,
    weightedContribution: normalizeProgressPercent(clampProgressPercent(progressPercent) * goal.weightage / 100),
  };
};

const buildProgressSummary = (
  quarter: GoalQuarter,
  scope: ProgressScope,
  goals: GoalRecord[],
  records: GoalProgressRecord[],
): ProgressSummary => {
  const totalWeightage = goals.reduce((sum, goal) => sum + goal.weightage, 0);
  const progressTotals = records.reduce((sum, record) => sum + clampProgressPercent(record.progressPercent), 0);
  const weightedTotals = records.reduce(
    (sum, record) => sum + (clampProgressPercent(record.progressPercent) * record.goal.weightage) / 100,
    0,
  );

  return {
    scope,
    quarter,
    totalGoals: goals.length,
    submittedCheckIns: records.filter((record) => record.latestCheckIn !== null).length,
    completedCount: records.filter((record) => record.status === "Completed").length,
    onTrackCount: records.filter((record) => record.status === "On Track").length,
    notStartedCount: records.filter((record) => record.status === "Not Started").length,
    averageProgressPercent: goals.length > 0 ? Math.round(progressTotals / goals.length) : 0,
    weightedProgressPercent: totalWeightage > 0 ? Math.round((weightedTotals / totalWeightage) * 100) : 0,
    totalWeightage,
    employeeCount: new Set(goals.map((goal) => goal.employeeId)).size,
  };
};

const buildProgressDashboard = (
  quarter: GoalQuarter,
  scope: ProgressScope,
  goals: GoalRecord[],
  checkIns: GoalCheckIn[],
): ProgressDashboard => {
  const latestCheckInsByGoal = new Map<string, GoalCheckIn>();

  for (const checkIn of checkIns) {
    const current = latestCheckInsByGoal.get(checkIn.goalId);

    if (!current || current.submittedAt.localeCompare(checkIn.submittedAt) < 0) {
      latestCheckInsByGoal.set(checkIn.goalId, checkIn);
    }
  }

  const records = goals.map((goal) => buildProgressRecord(goal, latestCheckInsByGoal.get(goal.id) ?? null))
    .sort((left, right) => right.progressPercent - left.progressPercent || left.goal.createdAt.localeCompare(right.goal.createdAt));

  return {
    goals: records,
    summary: buildProgressSummary(quarter, scope, goals, records),
  };
};

const buildCheckInSummary = (quarter: GoalQuarter, records: GoalCheckIn[]): CheckInSummary => ({
  quarter,
  totalGoals: records.length,
  submittedCheckIns: records.length,
  completedCount: records.filter((record) => record.status === "Completed").length,
  onTrackCount: records.filter((record) => record.status === "On Track").length,
  notStartedCount: records.filter((record) => record.status === "Not Started").length,
});

const insertAuditLog = async (entry: Omit<AuditDbRow, "id" | "timestamp"> & { timestamp?: string }) => {
  const supabase = getSupabase();
  const payload: AuditDbRow = {
    id: globalThis.crypto.randomUUID(),
    goal_id: entry.goal_id,
    employee_id: entry.employee_id,
    action: entry.action,
    performed_by: entry.performed_by,
    actor_role: entry.actor_role,
    actor_label: entry.actor_label,
    timestamp: entry.timestamp ?? new Date().toISOString(),
    changes: entry.changes,
  };

  const result = await supabase.from("audit_logs").insert(payload).select("*").single();
  if (result.error) {
    throw new Error(result.error.message);
  }
};

const getGoalsByEmployee = async (employeeId: string): Promise<GoalRecord[]> => {
  const supabase = getSupabase();
  const result = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", employeeId)
    .order("created_at", { ascending: true });

  if (result.error) {
    throw new Error(result.error.message);
  }

  const rows = result.data ?? [];
  return rows.map((r) => toGoalRecord(r as GoalDbRow));
};

const getGoalsByEmployeeAndQuarter = async (employeeId: string, quarter: GoalQuarter): Promise<GoalRecord[]> => {
  const supabase = getSupabase();
  const result = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", employeeId)
    .eq("quarter", quarter)
    .order("created_at", { ascending: true });

  if (result.error) {
    throw new Error(result.error.message);
  }

  const rows = result.data ?? [];
  return rows.map((r) => toGoalRecord(r as GoalDbRow));
};

const getGoalsByQuarter = async (quarter: GoalQuarter): Promise<GoalRecord[]> => {
  const supabase = getSupabase();
  const result = await supabase
    .from("goals")
    .select("*")
    .eq("quarter", quarter)
    .order("created_at", { ascending: true });

  if (result.error) {
    throw new Error(result.error.message);
  }

  const rows = result.data ?? [];
  return rows.map((r) => toGoalRecord(r as GoalDbRow));
};

const getGoalRowById = async (goalId: string): Promise<GoalRecord> => {
  const supabase = getSupabase();
  const result = await supabase
    .from("goals")
    .select("*")
    .eq("id", goalId)
    .maybeSingle();

  if (result.error) {
    throw new Error(result.error.message);
  }

  const row = result.data as GoalDbRow | null;

  if (!row) {
    throw new Error("Goal not found.");
  }

  return toGoalRecord(row);
};

// `getLatestAchievementsByGoalIds` removed — we now query and process achievements inline where needed.

const getCheckInsByEmployeeAndQuarter = async (
  employeeId: string,
  quarter: GoalQuarter,
): Promise<GoalCheckIn[]> => {
  const supabase = getSupabase();
  const result = await supabase
    .from("achievements")
    .select("*")
    .eq("employee_id", employeeId)
    .eq("quarter", quarter)
    .order("created_at", { ascending: false });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return (result.data ?? []).map((r) => toCheckInRecord(r as AchievementDbRow));
};

export const getEmployeeGoals = async (employeeId: string): Promise<{ goals: GoalRecord[]; summary: GoalSummary; auditLog: AuditEntry[] }> => {
  const supabase = getSupabase();
  const [goals, auditRows] = await Promise.all([
    getGoalsByEmployee(employeeId),
    (async () => {
      const res = await supabase.from("audit_logs").select("*").eq("employee_id", employeeId).order("timestamp", { ascending: false });
      if (res.error) throw new Error(res.error.message);
      return (res.data ?? []) as AuditDbRow[];
    })(),
  ]);

  return {
    goals,
    summary: buildSummary(goals),
    auditLog: auditRows.map(toAuditEntry),
  };
};

export const createEmployeeGoal = async (
  employeeId: string,
  goalInput: GoalInput,
  actor: MutationActor,
): Promise<{ goals: GoalRecord[]; summary: GoalSummary; auditLog: AuditEntry[] }> => {
  const validationErrors = validateGoalInput(goalInput);
  const existingGoals = await getGoalsByEmployeeAndQuarter(employeeId, goalInput.quarter);

  if (existingGoals.length >= GOAL_LIMIT) {
    validationErrors.push(`An employee can only have up to ${GOAL_LIMIT} goals.`);
  }

  const nextWeightage = existingGoals.reduce((sum, goal) => sum + goal.weightage, 0) + Number(goalInput.weightage);

  if (nextWeightage > 100) {
    validationErrors.push("Saving this goal would push total weightage above 100%.");
  }

  if (validationErrors.length > 0) {
    throw new Error(validationErrors.join(" "));
  }

  const supabase = getSupabase();
  const now = new Date().toISOString();
  const goalPayload = {
    user_id: employeeId,
    title: goalInput.title.trim(),
    description: goalInput.description.trim(),
    thrust_area: goalInput.thrustArea.trim(),
    uom: goalInput.uom.trim(),
    target: goalInput.target.trim(),
    weightage: Number(goalInput.weightage),
    status: "draft" as GoalStatus,
    approval_status: "not_submitted" as GoalApprovalStatus,
    is_locked: false,
    reviewed_by: null,
    reviewed_at: null,
    review_notes: null,
    quarter: goalInput.quarter,
    measurement_type: goalInput.measurementType,
    created_at: now,
    updated_at: now,
    submitted_at: null,
  };

  const insertResult = await supabase.from("goals").insert(goalPayload).select("*").single();
  if (insertResult.error) throw new Error(insertResult.error.message);
  const insertedGoal = insertResult.data as GoalDbRow;

  await insertAuditLog({
    goal_id: insertedGoal.id,
    employee_id: employeeId,
    action: "created",
    performed_by: ROLE_USER_IDS[actor.role],
    actor_role: actor.role,
    actor_label: actor.label,
    changes: [],
    timestamp: now,
  });

  return getEmployeeGoals(employeeId);
};

export const updateEmployeeGoal = async (
  goalId: string,
  goalInput: GoalInput,
  actor: MutationActor,
): Promise<{ goals: GoalRecord[]; summary: GoalSummary; auditLog: AuditEntry[] }> => {
  const currentGoal = await getGoalRowById(goalId);

  if (currentGoal.status !== "draft" || currentGoal.isLocked) {
    throw new Error("Only draft goals can be edited.");
  }

  const validationErrors = validateGoalInput(goalInput);
  const siblingGoals = (await getGoalsByEmployeeAndQuarter(currentGoal.employeeId, goalInput.quarter)).filter((goal) => goal.id !== goalId);
  const nextWeightage = siblingGoals.reduce((sum, goal) => sum + goal.weightage, 0) + Number(goalInput.weightage);

  if (nextWeightage > 100) {
    validationErrors.push("Updating this goal would push total weightage above 100%.");
  }

  if (validationErrors.length > 0) {
    throw new Error(validationErrors.join(" "));
  }

  const supabase = getSupabase();
  const updatedAt = new Date().toISOString();
  const updatedPayload = {
    title: goalInput.title.trim(),
    description: goalInput.description.trim(),
    thrust_area: goalInput.thrustArea.trim(),
    uom: goalInput.uom.trim(),
    target: goalInput.target.trim(),
    weightage: Number(goalInput.weightage),
    approval_status: "not_submitted" as GoalApprovalStatus,
    reviewed_by: null,
    reviewed_at: null,
    review_notes: null,
    quarter: goalInput.quarter,
    measurement_type: goalInput.measurementType,
    updated_at: updatedAt,
  };

  const updateResult = await supabase.from("goals").update(updatedPayload).eq("id", goalId).select("*").single();
  if (updateResult.error) throw new Error(updateResult.error.message);
  const updatedGoal = toGoalRecord(updateResult.data as GoalDbRow);

  await insertAuditLog({
    goal_id: goalId,
    employee_id: currentGoal.employeeId,
    action: "updated",
    performed_by: ROLE_USER_IDS[actor.role],
    actor_role: actor.role,
    actor_label: actor.label,
    changes: collectChanges(currentGoal, updatedGoal),
    timestamp: updatedAt,
  });

  return getEmployeeGoals(currentGoal.employeeId);
};

export const deleteEmployeeGoal = async (
  goalId: string,
  actor: MutationActor,
): Promise<{ goals: GoalRecord[]; summary: GoalSummary; auditLog: AuditEntry[] }> => {
  const currentGoal = await getGoalRowById(goalId);

  if (currentGoal.status !== "draft" || currentGoal.isLocked) {
    throw new Error("Only draft goals can be deleted.");
  }

  const supabase = getSupabase();
  const deleteResult = await supabase.from("goals").delete().eq("id", goalId).select("id").single();
  if (deleteResult.error) {
    throw new Error(deleteResult.error.message);
  }

  await insertAuditLog({
    goal_id: goalId,
    employee_id: currentGoal.employeeId,
    action: "deleted",
    performed_by: ROLE_USER_IDS[actor.role],
    actor_role: actor.role,
    actor_label: actor.label,
    changes: [],
    timestamp: new Date().toISOString(),
  });

  return getEmployeeGoals(currentGoal.employeeId);
};

export const submitEmployeeGoals = async (
  employeeId: string,
  actor: MutationActor,
): Promise<{ goals: GoalRecord[]; summary: GoalSummary; auditLog: AuditEntry[] }> => {
  const currentQuarter = getCurrentQuarter();
  const goals = await getGoalsByEmployeeAndQuarter(employeeId, currentQuarter);
  const validationErrors = validateEmployeeGoalSet(goals);

  if (goals.length === 0) {
    validationErrors.push("Create at least one goal before submitting.");
  }

  if (goals.some((goal) => goal.status !== "draft")) {
    validationErrors.push("Only draft goals can be submitted.");
  }

  if (validationErrors.length > 0) {
    throw new Error(validationErrors.join(" "));
  }

  const timestamp = new Date().toISOString();
  const supabase = getSupabase();

  const updateResult = await supabase
    .from("goals")
    .update({
      status: "submitted" as GoalStatus,
      approval_status: "pending" as GoalApprovalStatus,
      is_locked: false,
      updated_at: timestamp,
      submitted_at: timestamp,
    })
    .eq("user_id", employeeId)
    .eq("quarter", currentQuarter)
    .select("*");

  if (updateResult.error) {
    throw new Error(updateResult.error.message);
  }

  await insertAuditLog({
    goal_id: null,
    employee_id: employeeId,
    action: "submitted",
    performed_by: ROLE_USER_IDS[actor.role],
    actor_role: actor.role,
    actor_label: actor.label,
    changes: [],
    timestamp,
  });

  return getEmployeeGoals(employeeId);
};

export const getManagerGoals = async (): Promise<{ goals: GoalRecord[]; summary: ManagerGoalSummary; auditLog: AuditEntry[] }> => {
  const supabase = getSupabase();
  const [goalRows, auditRows] = await Promise.all([
    (async () => {
      const res = await supabase.from("goals").select("*").order("updated_at", { ascending: false });
      if (res.error) throw new Error(res.error.message);
      return (res.data ?? []) as GoalDbRow[];
    })(),
    (async () => {
      const res = await supabase.from("audit_logs").select("*").order("timestamp", { ascending: false });
      if (res.error) throw new Error(res.error.message);
      return (res.data ?? []) as AuditDbRow[];
    })(),
  ]);

  const goals = goalRows.map(toGoalRecord);

  return {
    goals,
    summary: buildManagerSummary(goals),
    auditLog: auditRows.map(toAuditEntry),
  };
};

export const updateManagerGoal = async (
  goalId: string,
  patch: { target?: string; weightage?: number | string; reviewNotes?: string },
  actor: MutationActor,
): Promise<{ goals: GoalRecord[]; summary: ManagerGoalSummary; auditLog: AuditEntry[] }> => {
  const currentGoal = await getGoalRowById(goalId);

  if (currentGoal.approvalStatus !== "pending" || currentGoal.isLocked) {
    throw new Error("Only pending goals can be edited by a manager.");
  }

  const nextTarget = typeof patch.target === "string" ? patch.target.trim() : currentGoal.target;
  const nextWeightage = patch.weightage === undefined ? currentGoal.weightage : Number(patch.weightage);

  if (nextTarget.length === 0) {
    throw new Error("Target is required.");
  }

  if (!Number.isFinite(nextWeightage) || nextWeightage < MIN_WEIGHTAGE) {
    throw new Error(`Weightage must be at least ${MIN_WEIGHTAGE}%.`);
  }

  const updatedGoal = updateGoalRecord(currentGoal, {
    target: nextTarget,
    weightage: nextWeightage,
    reviewNotes: typeof patch.reviewNotes === "string" ? patch.reviewNotes.trim() || null : currentGoal.reviewNotes,
  });

  const supabase = getSupabase();
  const timestamp = updatedGoal.updatedAt;
  const updateResult = await supabase
    .from("goals")
    .update({
      target: updatedGoal.target,
      weightage: updatedGoal.weightage,
      review_notes: updatedGoal.reviewNotes,
      updated_at: timestamp,
    })
    .eq("id", goalId)
    .select("*")
    .single();

  if (updateResult.error) throw new Error(updateResult.error.message);
  const after = toGoalRecord(updateResult.data as GoalDbRow);

  await insertAuditLog({
    goal_id: goalId,
    employee_id: currentGoal.employeeId,
    action: "updated",
    performed_by: ROLE_USER_IDS[actor.role],
    actor_role: actor.role,
    actor_label: actor.label,
    timestamp,
    changes: collectChanges(currentGoal, after),
  });

  return getManagerGoals();
};

const approveGoalRecord = async (
  goalId: string,
  actor: MutationActor,
): Promise<{ goals: GoalRecord[]; summary: ManagerGoalSummary; auditLog: AuditEntry[] }> => {
  const currentGoal = await getGoalRowById(goalId);

  if (currentGoal.approvalStatus !== "pending") {
    throw new Error("Only pending goals can be approved.");
  }

  const employeeGoals = (await getGoalsByEmployeeAndQuarter(currentGoal.employeeId, currentGoal.quarter)).filter((goal) => goal.id !== goalId);
  const totalWeightage = employeeGoals.reduce((sum, goal) => sum + goal.weightage, 0) + currentGoal.weightage;

  if (totalWeightage !== 100) {
    throw new Error("Approve after the employee goal set totals 100%.");
  }

  const supabase = getSupabase();
  const updatedAt = new Date().toISOString();
  const updateResult = await supabase
    .from("goals")
    .update({
      status: "locked" as GoalStatus,
      approval_status: "approved" as GoalApprovalStatus,
      is_locked: true,
      reviewed_by: actor.label,
      reviewed_at: updatedAt,
      updated_at: updatedAt,
    })
    .eq("id", goalId)
    .select("*")
    .single();

  if (updateResult.error) throw new Error(updateResult.error.message);
  const updatedGoal = toGoalRecord(updateResult.data as GoalDbRow);

  await insertAuditLog({
    goal_id: goalId,
    employee_id: currentGoal.employeeId,
    action: "updated",
    performed_by: ROLE_USER_IDS[actor.role],
    actor_role: actor.role,
    actor_label: actor.label,
    timestamp: updatedAt,
    changes: collectChanges(currentGoal, updatedGoal),
  });

  return getManagerGoals();
};

const rejectGoalRecord = async (
  goalId: string,
  actor: MutationActor,
  notes: string,
): Promise<{ goals: GoalRecord[]; summary: ManagerGoalSummary; auditLog: AuditEntry[] }> => {
  const currentGoal = await getGoalRowById(goalId);

  if (currentGoal.approvalStatus !== "pending") {
    throw new Error("Only pending goals can be rejected.");
  }

  const supabase = getSupabase();
  const updatedAt = new Date().toISOString();
  const updateResult = await supabase
    .from("goals")
    .update({
      status: "draft" as GoalStatus,
      approval_status: "rejected" as GoalApprovalStatus,
      is_locked: false,
      reviewed_by: actor.label,
      reviewed_at: updatedAt,
      review_notes: notes.trim() || "Rejected by manager",
      submitted_at: null,
      updated_at: updatedAt,
    })
    .eq("id", goalId)
    .select("*")
    .single();

  if (updateResult.error) throw new Error(updateResult.error.message);
  const updatedGoal = toGoalRecord(updateResult.data as GoalDbRow);

  await insertAuditLog({
    goal_id: goalId,
    employee_id: currentGoal.employeeId,
    action: "updated",
    performed_by: ROLE_USER_IDS[actor.role],
    actor_role: actor.role,
    actor_label: actor.label,
    timestamp: updatedAt,
    changes: collectChanges(currentGoal, updatedGoal),
  });

  return getManagerGoals();
};

export const managerApproveGoal = approveGoalRecord;

export const managerRejectGoal = rejectGoalRecord;

export const getManagerGoalById = async (goalId: string): Promise<GoalRecord> => getGoalRowById(goalId);

export const getCurrentGoalQuarter = (): GoalQuarter => getCurrentQuarter();

export const getEmployeeCheckIns = async (
  employeeId: string,
  quarter: GoalQuarter = getCurrentQuarter(),
): Promise<{
  quarter: GoalQuarter;
  goals: GoalRecord[];
  checkIns: GoalCheckIn[];
  summary: CheckInSummary;
}> => {
  const goals = (await getGoalsByEmployeeAndQuarter(employeeId, quarter)).filter((goal) => goal.approvalStatus === "approved" && goal.isLocked);
  const checkIns = await getCheckInsByEmployeeAndQuarter(employeeId, quarter);

  return {
    quarter,
    goals,
    checkIns,
    summary: buildCheckInSummary(quarter, checkIns),
  };
};

export const getEmployeeProgress = async (
  employeeId: string,
  quarter: GoalQuarter = getCurrentQuarter(),
): Promise<ProgressDashboard> => {
  const goals = (await getGoalsByEmployeeAndQuarter(employeeId, quarter)).filter((goal) => goal.approvalStatus === "approved" && goal.isLocked);
  const checkIns = await getCheckInsByEmployeeAndQuarter(employeeId, quarter);

  return buildProgressDashboard(quarter, "employee", goals, checkIns);
};

export const getCompanyProgress = async (
  quarter: GoalQuarter = getCurrentQuarter(),
): Promise<ProgressDashboard> => {
  const goals = (await getGoalsByQuarter(quarter)).filter((goal) => goal.approvalStatus === "approved" && goal.isLocked);
  const supabase = getSupabase();
  const achievementsRes = await supabase
    .from("achievements")
    .select("*")
    .eq("quarter", quarter)
    .order("created_at", { ascending: false });

  if (achievementsRes.error) throw new Error(achievementsRes.error.message);

  const checkIns = (achievementsRes.data ?? []).map((r) => toCheckInRecord(r as AchievementDbRow));

  const goalIds = new Set(goals.map((goal) => goal.id));
  return buildProgressDashboard(quarter, "company", goals, checkIns.filter((checkIn) => goalIds.has(checkIn.goalId)));
};

export const submitEmployeeCheckIn = async (
  input: {
    goalId: string;
    employeeId: string;
    quarter: GoalQuarter;
    actualAchievement: string;
    notes?: string;
  },
  actor: MutationActor,
): Promise<{
  quarter: GoalQuarter;
  goals: GoalRecord[];
  checkIns: GoalCheckIn[];
  summary: CheckInSummary;
}> => {
  const goal = await getGoalRowById(input.goalId);

  if (goal.employeeId !== input.employeeId) {
    throw new Error("You can only submit check-ins for your own goals.");
  }

  if (goal.approvalStatus !== "approved" || !goal.isLocked) {
    throw new Error("Only approved and locked goals can receive quarterly check-ins.");
  }

  if (!QUARTERS.includes(input.quarter)) {
    throw new Error("Select a valid quarter.");
  }

  const trimmedAchievement = input.actualAchievement.trim();

  if (!trimmedAchievement) {
    throw new Error("Actual achievement is required.");
  }

  const result = calculateCheckInResult(goal, trimmedAchievement);
  const supabase = getSupabase();
  const now = new Date().toISOString();

  const existingResult = await supabase
    .from("achievements")
    .select("*")
    .eq("goal_id", goal.id)
    .eq("employee_id", goal.employeeId)
    .eq("quarter", input.quarter)
    .maybeSingle();

  if (existingResult.error) {
    throw new Error(existingResult.error.message);
  }

  const existing = existingResult.data as AchievementDbRow | null;
  const achievementPayload = {
    id: existing?.id ?? globalThis.crypto.randomUUID(),
    goal_id: goal.id,
    employee_id: goal.employeeId,
    actual_value: trimmedAchievement,
    status: result.status === "Completed" ? "completed" : result.status === "On Track" ? "on_track" : "not_started",
    quarter: input.quarter,
    notes: input.notes?.trim() ? input.notes.trim() : null,
    progress_percent: result.progressPercent,
    created_at: existing?.created_at ?? now,
    updated_at: now,
  };

  const upsertResult = await supabase
    .from("achievements")
    .upsert(achievementPayload, { onConflict: "goal_id,quarter" })
    .select("*")
    .single();

  if (upsertResult.error) throw new Error(upsertResult.error.message);
  const achievementRow = upsertResult.data as AchievementDbRow;
  const nextCheckIn = toCheckInRecord(achievementRow);

  await insertAuditLog({
    goal_id: goal.id,
    employee_id: goal.employeeId,
    action: existing ? "updated" : "created",
    performed_by: ROLE_USER_IDS[actor.role],
    actor_role: actor.role,
    actor_label: actor.label,
    timestamp: now,
    changes: [
      {
        field: "status",
        before: existing ? existing.status : null,
        after: nextCheckIn.status,
      },
    ],
  });

  const updatedGoalResult = await supabase
    .from("goals")
    .update({ updated_at: now })
    .eq("id", goal.id)
    .select("*")
    .single();

  if (updatedGoalResult.error) {
    throw new Error(updatedGoalResult.error.message);
  }

  const quarterGoals = (await getGoalsByEmployeeAndQuarter(input.employeeId, input.quarter)).filter((entry) => entry.approvalStatus === "approved" && entry.isLocked);
  const quarterCheckIns = await getCheckInsByEmployeeAndQuarter(input.employeeId, input.quarter);

  return {
    quarter: input.quarter,
    goals: quarterGoals,
    checkIns: quarterCheckIns,
    summary: buildCheckInSummary(input.quarter, quarterCheckIns),
  };
};

export const parseGoalInput = (body: Record<string, unknown>): GoalInput => ({
  title: normalizeString(body.title as FormDataEntryValue),
  description: normalizeString(body.description as FormDataEntryValue),
  thrustArea: normalizeString(body.thrustArea as FormDataEntryValue),
  uom: normalizeString(body.uom as FormDataEntryValue),
  target: normalizeString(body.target as FormDataEntryValue),
  weightage: typeof body.weightage === "number" ? body.weightage : normalizeString(body.weightage as FormDataEntryValue),
  quarter: (normalizeString(body.quarter as FormDataEntryValue) as GoalQuarter) || "Q2",
  measurementType: (normalizeString(body.measurementType as FormDataEntryValue) as MeasurementType) || "MIN",
});

export const getDefaultEmployeeId = (): string => DEFAULT_EMPLOYEE_ID;

export const getAuditReport = async (limit = 25): Promise<AuditReport> => {
  const supabase = getSupabase();
  const entriesRes = await supabase.from("audit_logs").select("*").order("timestamp", { ascending: false }).limit(limit);
  if (entriesRes.error) throw new Error(entriesRes.error.message);
  const entries = (entriesRes.data ?? []) as AuditDbRow[];

  const allRes = await supabase.from("audit_logs").select("*").order("timestamp", { ascending: false });
  if (allRes.error) throw new Error(allRes.error.message);
  const allEntries = (allRes.data ?? []) as AuditDbRow[];

  const summary: AuditReportSummary = {
    totalEntries: allEntries.length,
    createdCount: allEntries.filter((entry) => entry.action === "created").length,
    updatedCount: allEntries.filter((entry) => entry.action === "updated").length,
    deletedCount: allEntries.filter((entry) => entry.action === "deleted").length,
    submittedCount: allEntries.filter((entry) => entry.action === "submitted").length,
    employeeCount: new Set(allEntries.map((entry) => entry.employee_id ?? "")).size,
    actorCount: new Set(allEntries.map((entry) => `${entry.actor_role}:${entry.actor_label}`)).size,
  };

  return { entries: entries.map(toAuditEntry), summary };
};

export const createActor = (role: GoalActorRole, label: string): MutationActor => ({
  role,
  label,
});

export const buildGoalErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Unable to complete the goal action.";
