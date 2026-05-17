import { NextResponse } from "next/server";
import {
  buildGoalErrorMessage,
  getCompanyProgress,
  getCurrentGoalQuarter,
  getEmployeeProgress,
} from "@/lib/goals";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const employeeId = url.searchParams.get("employeeId")?.trim() || "";
    const quarter = (url.searchParams.get("quarter")?.trim() || getCurrentGoalQuarter()) as Parameters<
      typeof getEmployeeProgress
    >[1];

    const payload = employeeId
      ? await getEmployeeProgress(employeeId, quarter)
      : await getCompanyProgress(quarter);

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json({ error: buildGoalErrorMessage(error) }, { status: 400 });
  }
}
