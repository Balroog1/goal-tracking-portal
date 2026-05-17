import { getAuditReport } from "@/lib/goals";
import ReportsClient from "./reports-client";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const report = await getAuditReport(200);

  return <ReportsClient report={report} />;
}