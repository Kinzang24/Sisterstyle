import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";
import bcrypt from "bcryptjs";

const SELECT_COLS = `
  id, name, email, role, phone, avatar,
  address_line as addressLine, address_city as addressCity, address_zip as addressZip,
  email_updates as emailUpdates, newsletter, sms_alerts as smsAlerts, created_at as createdAt
`;

function getUser(id) {
  const u = db.prepare(`SELECT ${SELECT_COLS} FROM users WHERE id = ?`).get(id);
  if (!u) return null;
  return { ...u, emailUpdates: !!u.emailUpdates, newsletter: !!u.newsletter, smsAlerts: !!u.smsAlerts };
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json(null);
  return NextResponse.json(getUser(session.user.id));
}

export async function PATCH(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Please log in" }, { status: 401 });

  const body = await req.json();
  const fields = [];
  const values = [];

  const columnMap = {
    name: "name",
    phone: "phone",
    avatar: "avatar",
    addressLine: "address_line",
    addressCity: "address_city",
    addressZip: "address_zip",
    emailUpdates: "email_updates",
    newsletter: "newsletter",
    smsAlerts: "sms_alerts",
  };

  for (const [key, col] of Object.entries(columnMap)) {
    if (body[key] !== undefined) {
      fields.push(`${col} = ?`);
      values.push(typeof body[key] === "boolean" ? (body[key] ? 1 : 0) : body[key]);
    }
  }

  if (body.email !== undefined) {
    const email = String(body.email).toLowerCase().trim();
    if (!email) return NextResponse.json({ error: "Email cannot be empty" }, { status: 400 });
    const existing = db.prepare("SELECT id FROM users WHERE email = ? AND id != ?").get(email, session.user.id);
    if (existing) return NextResponse.json({ error: "That email is already in use" }, { status: 409 });
    fields.push("email = ?");
    values.push(email);
  }

  if (body.newPassword) {
    if (body.newPassword.length < 4) {
      return NextResponse.json({ error: "Password must be at least 4 characters" }, { status: 400 });
    }
    fields.push("password_hash = ?");
    values.push(bcrypt.hashSync(body.newPassword, 10));
  }

  if (fields.length) {
    values.push(session.user.id);
    db.prepare(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  }

  return NextResponse.json(getUser(session.user.id));
}

export async function DELETE() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Please log in" }, { status: 401 });
  db.prepare("DELETE FROM users WHERE id = ?").run(session.user.id);
  return NextResponse.json({ ok: true });
}
