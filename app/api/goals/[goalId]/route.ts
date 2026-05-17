import { NextResponse } from "next/server";
import {
  buildGoalErrorMessage,
  createActor,
  deleteEmployeeGoal,
  parseGoalInput,
  updateEmployeeGoal,
} from "@/lib/goals";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: { goalId: string } | Promise<{ goalId: string }> },
) {
  try {
    const { goalId } = await Promise.resolve(context.params);
    const body = (await request.json()) as Record<string, unknown>;
    const result = await updateEmployeeGoal(
      goalId,
      parseGoalInput(body),
      createActor("employee", typeof body.actorLabel === "string" && body.actorLabel.trim() ? body.actorLabel.trim() : "Employee"),
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
    const { goalId } = await Promise.resolve(context.params);
    const body = (await request.json().catch(() => ({}))) as { actorLabel?: string };
    const result = await deleteEmployeeGoal(
      goalId,
      createActor("employee", body.actorLabel?.trim() || "Employee"),
    );

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: buildGoalErrorMessage(error) }, { status: 400 });
  }
}
