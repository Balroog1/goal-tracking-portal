import { NextResponse } from "next/server";
import {
  buildGoalErrorMessage,
  createActor,
  getCurrentGoalQuarter,
  getEmployeeCheckIns,
  submitEmployeeCheckIn,
} from "@/lib/goals";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const employeeId = url.searchParams.get("employeeId")?.trim() || undefined;
    const quarter = (url.searchParams.get("quarter")?.trim() || getCurrentGoalQuarter()) as Parameters<typeof getEmployeeCheckIns>[1];

    if (!employeeId) {
      return NextResponse.json({ error: "employeeId is required." }, { status: 400 });
    }

    const payload = await getEmployeeCheckIns(employeeId, quarter);
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json({ error: buildGoalErrorMessage(error) }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      goalId?: string;
      employeeId?: string;
      quarter?: string;
      actualAchievement?: string;
      notes?: string;
      actorLabel?: string;
    };

    if (!body.goalId?.trim() || !body.employeeId?.trim() || !body.actualAchievement?.trim()) {
      return NextResponse.json(
        { error: "goalId, employeeId, and actualAchievement are required." },
        { status: 400 },
      );
    }

    const payload = await submitEmployeeCheckIn(
      {
        goalId: body.goalId.trim(),
        employeeId: body.employeeId.trim(),
        quarter: (body.quarter?.trim() || getCurrentGoalQuarter()) as Parameters<typeof submitEmployeeCheckIn>[0]["quarter"],
        actualAchievement: body.actualAchievement.trim(),
        notes: body.notes,
      },
      createActor("employee", body.actorLabel?.trim() || "Employee"),
    );

    return NextResponse.json(payload, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: buildGoalErrorMessage(error) }, { status: 400 });
  }
}
