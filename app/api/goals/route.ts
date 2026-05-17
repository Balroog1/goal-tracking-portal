import { NextResponse } from "next/server";
import {
  buildGoalErrorMessage,
  createActor,
  createEmployeeGoal,
  getDefaultEmployeeId,
  getEmployeeGoals,
  parseGoalInput,
} from "@/lib/goals";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const employeeId = url.searchParams.get("employeeId") ?? getDefaultEmployeeId();
  const payload = await getEmployeeGoals(employeeId);

  return NextResponse.json(payload);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const employeeId = typeof body.employeeId === "string" && body.employeeId.trim()
      ? body.employeeId.trim()
      : getDefaultEmployeeId();

    const result = await createEmployeeGoal(
      employeeId,
      parseGoalInput(body),
      createActor("employee", typeof body.actorLabel === "string" && body.actorLabel.trim() ? body.actorLabel.trim() : "Employee"),
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: buildGoalErrorMessage(error) }, { status: 400 });
  }
}
