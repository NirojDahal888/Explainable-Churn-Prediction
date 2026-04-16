import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, verifyToken } from "../../../../lib/auth";

export async function GET(request) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    const response = NextResponse.json({ user: null }, { status: 401 });
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: "",
      path: "/",
      maxAge: 0,
    });
    return response;
  }

  return NextResponse.json({
    user: {
      id: payload.userId,
      name: payload.name,
      email: payload.email,
    },
  });
}
