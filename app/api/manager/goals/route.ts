import { NextResponse } from "next/server";
import { buildGoalErrorMessage, getManagerGoals } from "@/lib/goals";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payload = await getManagerGoals();
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json({ error: buildGoalErrorMessage(error) }, { status: 500 });
  }
}
