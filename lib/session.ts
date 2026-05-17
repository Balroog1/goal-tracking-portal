import { type AuthSession } from "./goal-types";

export const SESSION_COOKIE = "gtp_session";

export const serializeSession = (session: AuthSession): string => encodeURIComponent(JSON.stringify(session));

export const parseSession = (value: string | undefined | null): AuthSession | null => {
  if (!value) {
    return null;
  }

  try {
    const decoded = JSON.parse(decodeURIComponent(value)) as AuthSession;

    if (
      decoded &&
      typeof decoded.email === "string" &&
      typeof decoded.label === "string" &&
      (decoded.role === "employee" || decoded.role === "manager" || decoded.role === "admin")
    ) {
      return decoded;
    }
  } catch {
    return null;
  }

  return null;
};
