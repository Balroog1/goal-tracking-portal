import { cookies } from "next/headers";
import { type AppRole, type AuthSession } from "./goal-types";
import { parseSession, serializeSession, SESSION_COOKIE } from "./session";

const DEMO_ACCOUNTS: Record<string, AuthSession> = {
  "employee@demo.com": { email: "employee@demo.com", role: "employee", label: "Employee" },
  "manager@demo.com": { email: "manager@demo.com", role: "manager", label: "Manager" },
  "admin@demo.com": { email: "admin@demo.com", role: "admin", label: "Admin" },
};

export const getSessionFromEmail = (email: string): AuthSession | null => {
  const normalized = email.trim().toLowerCase();
  return DEMO_ACCOUNTS[normalized] ?? null;
};

export const getCurrentSession = async (): Promise<AuthSession | null> => {
  const cookieStore = await cookies();
  const value = cookieStore.get(SESSION_COOKIE)?.value;
  return parseSession(value);
};

export const createSessionCookie = (session: AuthSession): string => `${SESSION_COOKIE}=${serializeSession(session)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`;

export const clearSessionCookie = (): string => `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;

export const isRoleAllowed = (role: AppRole | null | undefined, allowed: AppRole[]): boolean =>
  Boolean(role && allowed.includes(role));

