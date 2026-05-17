import { NextResponse } from "next/server";
import {
  buildGoalErrorMessage,
  createActor,
  getDefaultEmployeeId,
  submitEmployeeGoals,
} from "@/lib/goals";
import { getCurrentSession, isRoleAllowed } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const session = await getCurrentSession();

    if (!session || !isRoleAllowed(session.role, ["employee"])) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const result = await submitEmployeeGoals(
      getDefaultEmployeeId(),
      createActor(session.role, session.label),
    );

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: buildGoalErrorMessage(error) }, { status: 400 });
  }
}
