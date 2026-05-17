import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  DEFAULT_EMPLOYEE_ID,
  GOAL_LIMIT,
  MIN_WEIGHTAGE,
  MEASUREMENT_TYPES,
  QUARTERS,
  type AuditEntry,
  type GoalActorRole,
  type GoalChange,
  type GoalInput,
  type GoalRecord,
  type ManagerGoalSummary,
  type GoalSummary,
  type GoalQuarter,
  type MeasurementType,
} from "./goal-types";

interface GoalsDatabase {
  goals: GoalRecord[];
  auditLog: AuditEntry[];
}

interface MutationActor {
  role: GoalActorRole;
  label: string;
}

const DATA_FILE = path.join(process.cwd(), "data", "goals.json");

const defaultDatabase = (): GoalsDatabase => {
  const now = new Date().toISOString();

  return {
    goals: [
      {
        id: randomUUID(),
        employeeId: DEFAULT_EMPLOYEE_ID,
        title: "Increase Sales Revenue",
        description:
          "Improve quarterly sales by expanding enterprise client acquisition.",
        thrustArea: "Revenue Growth",
        uom: "INR",
        target: "1000000",
        weightage: 30,
        status: "draft",
        approvalStatus: "not_submitted",
        isLocked: false,
        reviewedBy: null,
        reviewedAt: null,
        reviewNotes: null,
        quarter: "Q2",
        measurementType: "MIN",
        createdAt: now,
        updatedAt: now,
        submittedAt: null,
      },
      {
        id: randomUUID(),
        employeeId: DEFAULT_EMPLOYEE_ID,
        title: "Improve Customer Satisfaction",
        description:
          "Increase support response quality and reduce repeated escalations.",
        thrustArea: "Customer Experience",
        uom: "Percent",
        target: "95",
        weightage: 25,
        status: "draft",
        approvalStatus: "not_submitted",
        isLocked: false,
        reviewedBy: null,
        reviewedAt: null,
        reviewNotes: null,
        quarter: "Q2",
        measurementType: "MAX",
        createdAt: now,
        updatedAt: now,
        submittedAt: null,
      },
      {
        id: randomUUID(),
        employeeId: DEFAULT_EMPLOYEE_ID,
        title: "Process Improvement",
        description:
          "Reduce manual work by automating recurring reporting steps.",
        thrustArea: "Operational Excellence",
        uom: "Tasks",
        target: "12",
        weightage: 20,
        status: "draft",
        approvalStatus: "not_submitted",
        isLocked: false,
        reviewedBy: null,
        reviewedAt: null,
        reviewNotes: null,
        quarter: "Q2",
        measurementType: "ZERO",
        createdAt: now,
        updatedAt: now,
        submittedAt: null,
      },
      {
        id: randomUUID(),
        employeeId: DEFAULT_EMPLOYEE_ID,
        title: "Leadership Development",
        description:
          "Complete manager-led mentoring sessions and share team learnings.",
        thrustArea: "Capability Building",
        uom: "Sessions",
        target: "8",
        weightage: 25,
        status: "draft",
        approvalStatus: "not_submitted",
        isLocked: false,
        reviewedBy: null,
        reviewedAt: null,
        reviewNotes: null,
        quarter: "Q2",
        measurementType: "TIMELINE",
        createdAt: now,
        updatedAt: now,
        submittedAt: null,
      },
    ],
    auditLog: [],
  };
};

const ensureDatabase = async (): Promise<void> => {
  await mkdir(path.dirname(DATA_FILE), { recursive: true });

  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<GoalsDatabase>;

    if (!Array.isArray(parsed.goals) || parsed.goals.length === 0) {
      await writeFile(DATA_FILE, `${JSON.stringify(defaultDatabase(), null, 2)}\n`, {
        encoding: "utf8",
      });
    }
  } catch {
    await writeFile(DATA_FILE, `${JSON.stringify(defaultDatabase(), null, 2)}\n`, {
      encoding: "utf8",
    });
  }
};

const readDatabase = async (): Promise<GoalsDatabase> => {
  await ensureDatabase();
  const raw = await readFile(DATA_FILE, "utf8");

  try {
    const parsed = JSON.parse(raw) as Partial<GoalsDatabase>;

    return {
      goals: Array.isArray(parsed.goals) ? parsed.goals : [],
      auditLog: Array.isArray(parsed.auditLog) ? parsed.auditLog : [],
    };
  } catch {
    return defaultDatabase();
  }
};

const writeDatabase = async (database: GoalsDatabase): Promise<void> => {
  await ensureDatabase();
  await writeFile(DATA_FILE, `${JSON.stringify(database, null, 2)}\n`, {
    encoding: "utf8",
  });
};

const normalizeString = (value: FormDataEntryValue | undefined | null): string =>
  typeof value === "string" ? value.trim() : "";

const serializeGoalValue = (
  goal: GoalRecord,
  field: keyof GoalRecord,
): string | number | null => {
  const value = goal[field];

  if (value === undefined || value === null) {
    return null;
  }

  return typeof value === "string" || typeof value === "number" ? value : null;
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
      errors.push(`Goal \"${goal.title}\" must be at least ${MIN_WEIGHTAGE}% weightage.`);
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

const ensureGoalExists = (database: GoalsDatabase, goalId: string): [number, GoalRecord] => {
  const goalIndex = database.goals.findIndex((goal) => goal.id === goalId);

  if (goalIndex < 0) {
    throw new Error("Goal not found.");
  }

  return [goalIndex, database.goals[goalIndex]];
};

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

export const getEmployeeGoals = async (employeeId: string): Promise<{ goals: GoalRecord[]; summary: GoalSummary; auditLog: AuditEntry[] }> => {
  const database = await readDatabase();
  const goals = database.goals
    .filter((goal) => goal.employeeId === employeeId)
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt));

  return {
    goals,
    summary: buildSummary(goals),
    auditLog: database.auditLog.filter((entry) => entry.employeeId === employeeId),
  };
};

export const createEmployeeGoal = async (
  employeeId: string,
  goalInput: GoalInput,
  actor: MutationActor,
): Promise<{ goals: GoalRecord[]; summary: GoalSummary; auditLog: AuditEntry[] }> => {
  const database = await readDatabase();
  const currentGoals = database.goals.filter((goal) => goal.employeeId === employeeId);
  const validationErrors = validateGoalInput(goalInput);

  if (currentGoals.length >= GOAL_LIMIT) {
    validationErrors.push(`An employee can only have up to ${GOAL_LIMIT} goals.`);
  }

  const nextWeightage = currentGoals.reduce((sum, goal) => sum + goal.weightage, 0) + Number(goalInput.weightage);

  if (nextWeightage > 100) {
    validationErrors.push("Saving this goal would push total weightage above 100%.");
  }

  if (validationErrors.length > 0) {
    throw new Error(validationErrors.join(" "));
  }

  const now = new Date().toISOString();
  const goal: GoalRecord = {
    id: randomUUID(),
    employeeId,
    title: goalInput.title.trim(),
    description: goalInput.description.trim(),
    thrustArea: goalInput.thrustArea.trim(),
    uom: goalInput.uom.trim(),
    target: goalInput.target.trim(),
    weightage: Number(goalInput.weightage),
    status: "draft",
    approvalStatus: "not_submitted",
    isLocked: false,
    reviewedBy: null,
    reviewedAt: null,
    reviewNotes: null,
    quarter: goalInput.quarter,
    measurementType: goalInput.measurementType,
    createdAt: now,
    updatedAt: now,
    submittedAt: null,
  };

  database.goals.push(goal);
  database.auditLog.unshift({
    id: randomUUID(),
    goalId: goal.id,
    employeeId,
    action: "created",
    actorRole: actor.role,
    actorLabel: actor.label,
    timestamp: now,
    changes: [],
  });

  await writeDatabase(database);

  return getEmployeeGoals(employeeId);
};

export const updateEmployeeGoal = async (
  goalId: string,
  goalInput: GoalInput,
  actor: MutationActor,
): Promise<{ goals: GoalRecord[]; summary: GoalSummary; auditLog: AuditEntry[] }> => {
  const database = await readDatabase();
  const goalIndex = database.goals.findIndex((goal) => goal.id === goalId);

  if (goalIndex < 0) {
    throw new Error("Goal not found.");
  }

  const currentGoal = database.goals[goalIndex];

  if (currentGoal.status !== "draft" || currentGoal.isLocked) {
    throw new Error("Only draft goals can be edited.");
  }

  const validationErrors = validateGoalInput(goalInput);
  const employeeGoals = database.goals.filter((goal) => goal.employeeId === currentGoal.employeeId && goal.id !== goalId);
  const nextWeightage = employeeGoals.reduce((sum, goal) => sum + goal.weightage, 0) + Number(goalInput.weightage);

  if (nextWeightage > 100) {
    validationErrors.push("Updating this goal would push total weightage above 100%.");
  }

  if (validationErrors.length > 0) {
    throw new Error(validationErrors.join(" "));
  }

  const updatedGoal: GoalRecord = {
    ...currentGoal,
    title: goalInput.title.trim(),
    description: goalInput.description.trim(),
    thrustArea: goalInput.thrustArea.trim(),
    uom: goalInput.uom.trim(),
    target: goalInput.target.trim(),
    weightage: Number(goalInput.weightage),
    approvalStatus: "not_submitted",
    reviewedBy: null,
    reviewedAt: null,
    reviewNotes: null,
    quarter: goalInput.quarter,
    measurementType: goalInput.measurementType,
    updatedAt: new Date().toISOString(),
  };

  database.goals[goalIndex] = updatedGoal;
  database.auditLog.unshift({
    id: randomUUID(),
    goalId,
    employeeId: currentGoal.employeeId,
    action: "updated",
    actorRole: actor.role,
    actorLabel: actor.label,
    timestamp: updatedGoal.updatedAt,
    changes: collectChanges(currentGoal, updatedGoal),
  });

  await writeDatabase(database);

  return getEmployeeGoals(currentGoal.employeeId);
};

export const deleteEmployeeGoal = async (
  goalId: string,
  actor: MutationActor,
): Promise<{ goals: GoalRecord[]; summary: GoalSummary; auditLog: AuditEntry[] }> => {
  const database = await readDatabase();
  const goalIndex = database.goals.findIndex((goal) => goal.id === goalId);

  if (goalIndex < 0) {
    throw new Error("Goal not found.");
  }

  const goal = database.goals[goalIndex];

  if (goal.status !== "draft" || goal.isLocked) {
    throw new Error("Only draft goals can be deleted.");
  }

  database.goals.splice(goalIndex, 1);
  database.auditLog.unshift({
    id: randomUUID(),
    goalId,
    employeeId: goal.employeeId,
    action: "deleted",
    actorRole: actor.role,
    actorLabel: actor.label,
    timestamp: new Date().toISOString(),
    changes: [],
  });

  await writeDatabase(database);

  return getEmployeeGoals(goal.employeeId);
};

export const submitEmployeeGoals = async (
  employeeId: string,
  actor: MutationActor,
): Promise<{ goals: GoalRecord[]; summary: GoalSummary; auditLog: AuditEntry[] }> => {
  const database = await readDatabase();
  const goals = database.goals.filter((goal) => goal.employeeId === employeeId);
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

  database.goals = database.goals.map((goal) =>
    goal.employeeId === employeeId
      ? {
          ...goal,
          status: "submitted",
          approvalStatus: "pending",
          isLocked: false,
          updatedAt: timestamp,
          submittedAt: timestamp,
        }
      : goal,
  );

  database.auditLog.unshift({
    id: randomUUID(),
    goalId: employeeId,
    employeeId,
    action: "submitted",
    actorRole: actor.role,
    actorLabel: actor.label,
    timestamp,
    changes: [],
  });

  await writeDatabase(database);

  return getEmployeeGoals(employeeId);
};

export const getManagerGoals = async (): Promise<{ goals: GoalRecord[]; summary: ManagerGoalSummary; auditLog: AuditEntry[] }> => {
  const database = await readDatabase();
  const goals = [...database.goals].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

  return {
    goals,
    summary: buildManagerSummary(goals),
    auditLog: database.auditLog,
  };
};

export const updateManagerGoal = async (
  goalId: string,
  patch: { target?: string; weightage?: number | string; reviewNotes?: string },
  actor: MutationActor,
): Promise<{ goals: GoalRecord[]; summary: ManagerGoalSummary; auditLog: AuditEntry[] }> => {
  const database = await readDatabase();
  const [goalIndex, currentGoal] = ensureGoalExists(database, goalId);

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

  database.goals[goalIndex] = updatedGoal;
  database.auditLog.unshift({
    id: randomUUID(),
    goalId,
    employeeId: currentGoal.employeeId,
    action: "updated",
    actorRole: actor.role,
    actorLabel: actor.label,
    timestamp: updatedGoal.updatedAt,
    changes: collectChanges(currentGoal, updatedGoal),
  });

  await writeDatabase(database);

  return getManagerGoals();
};

const approveGoalRecord = async (
  goalId: string,
  actor: MutationActor,
): Promise<{ goals: GoalRecord[]; summary: ManagerGoalSummary; auditLog: AuditEntry[] }> => {
  const database = await readDatabase();
  const [goalIndex, currentGoal] = ensureGoalExists(database, goalId);

  if (currentGoal.approvalStatus !== "pending") {
    throw new Error("Only pending goals can be approved.");
  }

  const employeeGoals = database.goals.filter((goal) => goal.employeeId === currentGoal.employeeId && goal.id !== goalId);
  const totalWeightage = employeeGoals.reduce((sum, goal) => sum + goal.weightage, 0) + currentGoal.weightage;

  if (totalWeightage !== 100) {
    throw new Error("Approve after the employee goal set totals 100%.");
  }

  const updatedGoal = updateGoalRecord(currentGoal, {
    approvalStatus: "approved",
    isLocked: true,
    reviewedBy: actor.label,
    reviewedAt: new Date().toISOString(),
    reviewNotes: currentGoal.reviewNotes,
  });

  database.goals[goalIndex] = updatedGoal;
  database.auditLog.unshift({
    id: randomUUID(),
    goalId,
    employeeId: currentGoal.employeeId,
    action: "updated",
    actorRole: actor.role,
    actorLabel: actor.label,
    timestamp: updatedGoal.updatedAt,
    changes: collectChanges(currentGoal, updatedGoal),
  });

  await writeDatabase(database);

  return getManagerGoals();
};

const rejectGoalRecord = async (
  goalId: string,
  actor: MutationActor,
  notes: string,
): Promise<{ goals: GoalRecord[]; summary: ManagerGoalSummary; auditLog: AuditEntry[] }> => {
  const database = await readDatabase();
  const [goalIndex, currentGoal] = ensureGoalExists(database, goalId);

  if (currentGoal.approvalStatus !== "pending") {
    throw new Error("Only pending goals can be rejected.");
  }

  const updatedGoal = updateGoalRecord(currentGoal, {
    status: "draft",
    approvalStatus: "rejected",
    isLocked: false,
    reviewedBy: actor.label,
    reviewedAt: new Date().toISOString(),
    reviewNotes: notes.trim() || "Rejected by manager",
    submittedAt: null,
  });

  database.goals[goalIndex] = updatedGoal;
  database.auditLog.unshift({
    id: randomUUID(),
    goalId,
    employeeId: currentGoal.employeeId,
    action: "updated",
    actorRole: actor.role,
    actorLabel: actor.label,
    timestamp: updatedGoal.updatedAt,
    changes: collectChanges(currentGoal, updatedGoal),
  });

  await writeDatabase(database);

  return getManagerGoals();
};

export const managerApproveGoal = approveGoalRecord;

export const managerRejectGoal = rejectGoalRecord;

export const getManagerGoalById = async (goalId: string): Promise<GoalRecord> => {
  const database = await readDatabase();
  const [, goal] = ensureGoalExists(database, goalId);
  return goal;
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

export const createActor = (role: GoalActorRole, label: string): MutationActor => ({
  role,
  label,
});

export const buildGoalErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Unable to complete the goal action.";
