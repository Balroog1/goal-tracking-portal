import { NextResponse } from "next/server";
import { buildGoalErrorMessage, getAuditReport } from "@/lib/goals";
import { getCurrentSession, isRoleAllowed } from "@/lib/auth";
import { filterAuditEntries, parseAuditFilters, toCsv } from "@/lib/audit-reports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getCurrentSession();

    if (!session || !isRoleAllowed(session.role, ["employee", "manager", "admin"])) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const url = new URL(request.url);
    const filters = parseAuditFilters(url.searchParams);
    const limit = Number(url.searchParams.get("limit") ?? "1000");
    const payload = await getAuditReport(Number.isFinite(limit) && limit > 0 ? Math.min(limit, 2000) : 1000);
    const entries = filterAuditEntries(payload.entries, filters);

    return new NextResponse(toCsv(entries), {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="audit-report.csv"',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: buildGoalErrorMessage(error) }, { status: 400 });
  }
}