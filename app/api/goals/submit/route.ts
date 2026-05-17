import { NextResponse } from "next/server";
import {
  buildGoalErrorMessage,
  createActor,
  getDefaultEmployeeId,
  submitEmployeeGoals,
} from "@/lib/goals";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { employeeId?: string; actorLabel?: string };
    const employeeId = body.employeeId?.trim() || getDefaultEmployeeId();

    const result = await submitEmployeeGoals(
      employeeId,
      createActor("employee", body.actorLabel?.trim() || "Employee"),
    );

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: buildGoalErrorMessage(error) }, { status: 400 });
  }
}
