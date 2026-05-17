import { NextResponse } from "next/server";
import { createSessionCookie, getSessionFromEmail } from "@/lib/auth";
import { ROLE_HOME } from "@/lib/goal-types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase() || "";

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const session = getSessionFromEmail(email);

    if (!session) {
      return NextResponse.json({ error: "Invalid demo account." }, { status: 401 });
    }

    const response = NextResponse.json({ session, redirectTo: ROLE_HOME[session.role] });
    response.headers.append("Set-Cookie", createSessionCookie(session));
    return response;
  } catch {
    return NextResponse.json({ error: "Unable to login." }, { status: 400 });
  }
}
