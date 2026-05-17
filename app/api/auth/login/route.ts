import { NextResponse } from "next/server";
import { getSessionFromEmail } from "@/lib/auth";
import { ROLE_HOME } from "@/lib/goal-types";
import { SESSION_COOKIE, serializeSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase() || "";

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const session = await getSessionFromEmail(email);

    if (!session) {
      return NextResponse.json({ error: "Invalid demo account." }, { status: 401 });
    }

    const response = NextResponse.json({ session, redirectTo: ROLE_HOME[session.role] });
    // Use NextResponse cookie helper to reliably set the session cookie
    response.cookies.set(SESSION_COOKIE, serializeSession(session), {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to login.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
