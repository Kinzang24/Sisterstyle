import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { queryOne, run } from "@/lib/db";

export async function POST(req) {
  const { name, email, password } = await req.json();

  if (!name?.trim() || !email?.trim() || !password) {
    return NextResponse.json({ error: "Please fill in every field" }, { status: 400 });
  }
  if (password.length < 4) {
    return NextResponse.json({ error: "Password must be at least 4 characters" }, { status: 400 });
  }

  const cleanEmail = email.toLowerCase().trim();
  const existing = await queryOne("SELECT id FROM users WHERE email = $1", [cleanEmail]);
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists" }, { status: 409 });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const { rows } = await run(
    "INSERT INTO users (name, email, password_hash) VALUES ($1,$2,$3) RETURNING id",
    [name.trim(), cleanEmail, passwordHash]
  );

  return NextResponse.json({ id: rows[0].id }, { status: 201 });
}
