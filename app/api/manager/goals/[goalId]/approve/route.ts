import { NextResponse } from "next/server";
import { buildGoalErrorMessage, createActor, managerApproveGoal } from "@/lib/goals";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: { goalId: string } | Promise<{ goalId: string }> },
) {
  try {
    const { goalId } = await Promise.resolve(context.params);
    const body = (await request.json().catch(() => ({}))) as { actorLabel?: string };

    const payload = await managerApproveGoal(
      goalId,
      createActor("manager", body.actorLabel?.trim() || "Manager"),
    );

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json({ error: buildGoalErrorMessage(error) }, { status: 400 });
  }
}
