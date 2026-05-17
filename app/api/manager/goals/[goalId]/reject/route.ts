import { NextResponse } from "next/server";
import { buildGoalErrorMessage, createActor, managerRejectGoal } from "@/lib/goals";
import { getCurrentSession, isRoleAllowed } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: { goalId: string } | Promise<{ goalId: string }> },
) {
  try {
    const session = await getCurrentSession();

    if (!session || !isRoleAllowed(session.role, ["manager"])) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const { goalId } = await Promise.resolve(context.params);
    const body = (await request.json()) as { reviewNotes?: string };

    const payload = await managerRejectGoal(
      goalId,
      createActor(session.role, session.label),
      body.reviewNotes ?? "",
    );

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json({ error: buildGoalErrorMessage(error) }, { status: 400 });
  }
}
