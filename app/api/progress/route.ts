import { NextResponse } from "next/server";
import {
  buildGoalErrorMessage,
  getCompanyProgress,
  getCurrentGoalQuarter,
  getEmployeeProgress,
} from "@/lib/goals";
import { getCurrentSession, isRoleAllowed } from "@/lib/auth";
import { DEFAULT_EMPLOYEE_ID } from "@/lib/goal-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getCurrentSession();

    if (!session || !isRoleAllowed(session.role, ["employee", "admin"])) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const url = new URL(request.url);
    const quarter = (url.searchParams.get("quarter")?.trim() || getCurrentGoalQuarter()) as Parameters<
      typeof getEmployeeProgress
    >[1];

    const payload = session.role === "admin"
      ? await getCompanyProgress(quarter)
      : await getEmployeeProgress(DEFAULT_EMPLOYEE_ID, quarter);

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json({ error: buildGoalErrorMessage(error) }, { status: 400 });
  }
}
