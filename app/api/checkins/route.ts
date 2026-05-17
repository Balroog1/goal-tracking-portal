import { NextResponse } from "next/server";
import {
  buildGoalErrorMessage,
  createActor,
  getCurrentGoalQuarter,
  getEmployeeCheckIns,
  submitEmployeeCheckIn,
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
    const quarter = (url.searchParams.get("quarter")?.trim() || getCurrentGoalQuarter()) as Parameters<typeof getEmployeeCheckIns>[1];

    const payload = await getEmployeeCheckIns(DEFAULT_EMPLOYEE_ID, quarter);
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json({ error: buildGoalErrorMessage(error) }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();

    if (!session || !isRoleAllowed(session.role, ["employee"])) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const body = (await request.json()) as {
      goalId?: string;
      quarter?: string;
      actualAchievement?: string;
      notes?: string;
    };

    if (!body.goalId?.trim() || !body.actualAchievement?.trim()) {
      return NextResponse.json(
        { error: "goalId and actualAchievement are required." },
        { status: 400 },
      );
    }

    const payload = await submitEmployeeCheckIn(
      {
        goalId: body.goalId.trim(),
        employeeId: DEFAULT_EMPLOYEE_ID,
        quarter: (body.quarter?.trim() || getCurrentGoalQuarter()) as Parameters<typeof submitEmployeeCheckIn>[0]["quarter"],
        actualAchievement: body.actualAchievement.trim(),
        notes: body.notes,
      },
      createActor(session.role, session.label),
    );

    return NextResponse.json(payload, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: buildGoalErrorMessage(error) }, { status: 400 });
  }
}
