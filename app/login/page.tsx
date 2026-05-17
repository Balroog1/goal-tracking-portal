import LoginClient from "./login-client";
import { type AppRole } from "@/lib/goal-types";

type SearchParams = Record<string, string | string[] | undefined>;

const ROLE_EMAILS: Record<AppRole, string> = {
  employee: "employee@demo.com",
  manager: "manager@demo.com",
  admin: "admin@demo.com",
};

const getQueryValue = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const role = getQueryValue(params.role) as AppRole | "";
  const email = getQueryValue(params.email) || (role ? ROLE_EMAILS[role] : "");

  return <LoginClient initialEmail={email} />;
}
