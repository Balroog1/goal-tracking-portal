import { NextResponse } from "next/server";
import { buildGoalErrorMessage, createActor, updateManagerGoal } from "@/lib/goals";
import { getCurrentSession, isRoleAllowed } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: { goalId: string } | Promise<{ goalId: string }> },
) {
  try {
    const session = await getCurrentSession();

    if (!session || !isRoleAllowed(session.role, ["manager"])) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const { goalId } = await Promise.resolve(context.params);
    const body = (await request.json()) as {
      target?: string;
      weightage?: number | string;
      reviewNotes?: string;
    };

    const payload = await updateManagerGoal(
      goalId,
      {
        target: body.target,
        weightage: body.weightage,
        reviewNotes: body.reviewNotes,
      },
      createActor(session.role, session.label),
    );

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json({ error: buildGoalErrorMessage(error) }, { status: 400 });
  }
}
