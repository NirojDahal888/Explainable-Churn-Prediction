import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "../../../../lib/mongodb";
import User from "../../../../models/User";
import { AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS, createToken } from "../../../../lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const name = body?.name?.trim();
    const email = body?.email?.trim()?.toLowerCase();
    const password = body?.password;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "Email is already registered." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    const token = createToken({
      userId: user._id.toString(), 
      name: user.name,
      email: user.email,
    });

    const response = NextResponse.json(
      {
        message: "Signup successful.",
        user: { id: user._id.toString(), name: user.name, email: user.email },
      },
      { status: 201 }
    );

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      ...AUTH_COOKIE_OPTIONS,
    });

    return response;
  } catch (error) {
    if (error?.code === 11000) {
      return NextResponse.json({ error: "Email is already registered." }, { status: 409 });
    }

    return NextResponse.json({ error: "Failed to signup user." }, { status: 500 });
  }
}
