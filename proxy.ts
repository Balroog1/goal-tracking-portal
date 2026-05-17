import { NextRequest, NextResponse } from "next/server";
import { ROLE_HOME, type AppRole } from "@/lib/goal-types";
import { parseSession, SESSION_COOKIE } from "@/lib/session";

const PUBLIC_PATHS = ["/", "/login", "/getting-started", "/register", "/api/auth/login", "/api/auth/logout", "/api/auth/session"];
const ROLE_PATHS: Record<AppRole, string[]> = {
  employee: ["/employee", "/goals", "/checkins"],
  manager: ["/manager"],
  admin: ["/admin", "/goals", "/checkins", "/analytics", "/reports", "/employee", "/manager"],
};
const SHARED_PATHS = ["/analytics", "/reports", "/api"];

const isPublicPath = (pathname: string): boolean =>
  PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

const getRequiredRole = (pathname: string): AppRole | null => {
  for (const [role, paths] of Object.entries(ROLE_PATHS) as Array<[AppRole, string[]]>) {
    if (paths.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
      return role;
    }
  }

  if (SHARED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return null;
  }

  return null;
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const session = parseSession(request.cookies.get(SESSION_COOKIE)?.value);

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  const requiredRole = getRequiredRole(pathname);

  if (requiredRole && session.role !== requiredRole) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = ROLE_HOME[session.role];
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};