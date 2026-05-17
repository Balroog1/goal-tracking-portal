import { NextResponse } from "next/server";
import { buildGoalErrorMessage, createActor, updateManagerGoal } from "@/lib/goals";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: { goalId: string } | Promise<{ goalId: string }> },
) {
  try {
    const { goalId } = await Promise.resolve(context.params);
    const body = (await request.json()) as {
      target?: string;
      weightage?: number | string;
      reviewNotes?: string;
      actorLabel?: string;
    };

    const payload = await updateManagerGoal(
      goalId,
      {
        target: body.target,
        weightage: body.weightage,
        reviewNotes: body.reviewNotes,
      },
      createActor("manager", body.actorLabel?.trim() || "Manager"),
    );

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json({ error: buildGoalErrorMessage(error) }, { status: 400 });
  }
}
