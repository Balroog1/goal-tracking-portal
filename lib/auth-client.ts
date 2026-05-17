import { type AppRole, type AuthSession } from "./goal-types";

export interface LoginResult {
  session: AuthSession;
  redirectTo: string;
}

export const fetchSession = async (): Promise<AuthSession | null> => {
  const response = await fetch("/api/auth/session", { cache: "no-store" });
  const payload = (await response.json()) as { session?: AuthSession | null };
  return payload.session ?? null;
};

export const loginWithDemoAccount = async (email: string, password: string): Promise<LoginResult> => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const payload = (await response.json()) as { session?: AuthSession; redirectTo?: string; error?: string };

  if (!response.ok || !payload.session || !payload.redirectTo) {
    throw new Error(payload.error || "Unable to login.");
  }

  return { session: payload.session, redirectTo: payload.redirectTo };
};

export const logout = async (): Promise<void> => {
  await fetch("/api/auth/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
};

export const hasRole = (session: AuthSession | null, allowed: AppRole[]): boolean =>
  Boolean(session && allowed.includes(session.role));
