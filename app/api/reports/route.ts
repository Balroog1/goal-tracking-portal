import { NextResponse } from "next/server";
import { buildGoalErrorMessage, getAuditReport } from "@/lib/goals";
import { getCurrentSession, isRoleAllowed } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session || !isRoleAllowed(session.role, ["employee", "manager", "admin"])) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const payload = await getAuditReport(100);
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json({ error: buildGoalErrorMessage(error) }, { status: 400 });
  }
}