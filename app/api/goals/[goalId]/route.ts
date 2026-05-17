import { NextResponse } from "next/server";
import {
  buildGoalErrorMessage,
  createActor,
  deleteEmployeeGoal,
  parseGoalInput,
  updateEmployeeGoal,
} from "@/lib/goals";
import { getCurrentSession, isRoleAllowed } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: { goalId: string } | Promise<{ goalId: string }> },
) {
  try {
    const session = await getCurrentSession();

    if (!session || !isRoleAllowed(session.role, ["employee"])) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const { goalId } = await Promise.resolve(context.params);
    const body = (await request.json()) as Record<string, unknown>;
    const result = await updateEmployeeGoal(
      goalId,
      parseGoalInput(body),
      createActor(session.role, session.label),
    );

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: buildGoalErrorMessage(error) }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: { goalId: string } | Promise<{ goalId: string }> },
) {
  try {
    const session = await getCurrentSession();

    if (!session || !isRoleAllowed(session.role, ["employee"])) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const { goalId } = await Promise.resolve(context.params);
    const result = await deleteEmployeeGoal(
      goalId,
      createActor(session.role, session.label),
    );

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: buildGoalErrorMessage(error) }, { status: 400 });
  }
}
