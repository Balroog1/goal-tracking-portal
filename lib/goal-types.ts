export const DEFAULT_EMPLOYEE_ID = "employee-demo";
export const GOAL_LIMIT = 8;
export const MIN_WEIGHTAGE = 10;

export const QUARTERS = ["Q1", "Q2", "Q3", "Q4"] as const;
export type GoalQuarter = (typeof QUARTERS)[number];

export const MEASUREMENT_TYPES = ["MIN", "MAX", "ZERO", "TIMELINE"] as const;
export type MeasurementType = (typeof MEASUREMENT_TYPES)[number];

export const GOAL_STATUSES = ["draft", "submitted"] as const;
export type GoalStatus = (typeof GOAL_STATUSES)[number];

export const APPROVAL_STATUSES = [
  "not_submitted",
  "pending",
  "approved",
  "rejected",
] as const;
export type GoalApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export type GoalActorRole = "employee" | "manager" | "admin";

export interface GoalRecord {
  id: string;
  employeeId: string;
  title: string;
  description: string;
  thrustArea: string;
  uom: string;
  target: string;
  weightage: number;
  status: GoalStatus;
  approvalStatus: GoalApprovalStatus;
  isLocked: boolean;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  quarter: GoalQuarter;
  measurementType: MeasurementType;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
}

export interface GoalInput {
  title: string;
  description: string;
  thrustArea: string;
  uom: string;
  target: string;
  weightage: number | string;
  quarter: GoalQuarter;
  measurementType: MeasurementType;
}

export interface GoalSummary {
  totalGoals: number;
  draftGoals: number;
  submittedGoals: number;
  totalWeightage: number;
  isReadyForSubmission: boolean;
}

export interface ManagerGoalSummary {
  totalGoals: number;
  pendingApprovals: number;
  approvedGoals: number;
  rejectedGoals: number;
  lockedGoals: number;
  totalEmployees: number;
}

export interface GoalChange {
  field: keyof GoalRecord;
  before: string | number | null;
  after: string | number | null;
}

export interface AuditEntry {
  id: string;
  goalId: string;
  employeeId: string;
  action: "created" | "updated" | "deleted" | "submitted";
  actorRole: GoalActorRole;
  actorLabel: string;
  timestamp: string;
  changes: GoalChange[];
}
