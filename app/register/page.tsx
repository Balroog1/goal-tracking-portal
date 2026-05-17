import RegisterClient from "./register-client";
import { type AppRole } from "@/lib/goal-types";

type SearchParams = Record<string, string | string[] | undefined>;

const getQueryValue = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
};

export default async function RegisterPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const role = getQueryValue(params.role) as AppRole | "employee";

  return <RegisterClient initialRole={role === "employee" || role === "manager" || role === "admin" ? role : "employee"} />;
}