import { NextResponse } from "next/server";
import {
  buildGoalErrorMessage,
  createActor,
  createEmployeeGoal,
  getDefaultEmployeeId,
  getEmployeeGoals,
  parseGoalInput,
} from "@/lib/goals";
import { getCurrentSession, isRoleAllowed } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getCurrentSession();

  if (!session || !isRoleAllowed(session.role, ["employee", "admin"])) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const payload = await getEmployeeGoals(getDefaultEmployeeId());

  return NextResponse.json(payload);
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();

    if (!session || !isRoleAllowed(session.role, ["employee"])) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const body = (await request.json()) as Record<string, unknown>;

    const result = await createEmployeeGoal(
      getDefaultEmployeeId(),
      parseGoalInput(body),
      createActor(session.role, session.label),
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: buildGoalErrorMessage(error) }, { status: 400 });
  }
}
