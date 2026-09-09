import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const expectedPassword = process.env.APP_ACCESS_PASSWORD;

    if (!expectedPassword) {
      return NextResponse.json({ success: true, message: "No password configured" });
    }

    if (password !== expectedPassword) {
      return NextResponse.json(
        { success: false, message: "Incorrect access passcode. Please try again." },
        { status: 401 }
      );
    }

    // Set secure auth cookie
    cookies().set("scb_auth_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
