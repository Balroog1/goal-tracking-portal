import { cookies } from "next/headers";
import { type AppRole, type AuthSession } from "./goal-types";
import { parseSession, serializeSession, SESSION_COOKIE } from "./session";
import { getSupabaseAdmin } from "./supabase";

export const getSessionFromEmail = async (email: string): Promise<AuthSession | null> => {
  const normalized = email.trim().toLowerCase();
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("users")
    .select("email, name, role")
    .eq("email", normalized)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return {
    email: data.email,
    role: data.role as AppRole,
    label: data.name,
  };
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

