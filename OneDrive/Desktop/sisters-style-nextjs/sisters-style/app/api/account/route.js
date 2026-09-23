import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { queryOne, run } from "@/lib/db";
import bcrypt from "bcryptjs";

const SELECT_COLS = `
  id, name, email, role, phone, avatar,
  address_line as "addressLine", address_city as "addressCity", address_zip as "addressZip",
  email_updates as "emailUpdates", newsletter, sms_alerts as "smsAlerts", created_at as "createdAt"
`;

async function getUser(id) {
  const u = await queryOne(`SELECT ${SELECT_COLS} FROM users WHERE id = $1`, [id]);
  if (!u) return null;
  return { ...u, emailUpdates: !!u.emailUpdates, newsletter: !!u.newsletter, smsAlerts: !!u.smsAlerts };
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json(null);
  return NextResponse.json(await getUser(session.user.id));
}

export async function PATCH(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Please log in" }, { status: 401 });

  const body = await req.json();
  const fields = [];
  const values = [];
  let i = 1;

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
      fields.push(`${col} = $${i++}`);
      values.push(typeof body[key] === "boolean" ? (body[key] ? 1 : 0) : body[key]);
    }
  }

  if (body.email !== undefined) {
    const email = String(body.email).toLowerCase().trim();
    if (!email) return NextResponse.json({ error: "Email cannot be empty" }, { status: 400 });
    const existing = await queryOne("SELECT id FROM users WHERE email = $1 AND id != $2", [
      email,
      session.user.id,
    ]);
    if (existing) return NextResponse.json({ error: "That email is already in use" }, { status: 409 });
    fields.push(`email = $${i++}`);
    values.push(email);
  }

  if (body.newPassword) {
    if (body.newPassword.length < 4) {
      return NextResponse.json({ error: "Password must be at least 4 characters" }, { status: 400 });
    }
    fields.push(`password_hash = $${i++}`);
    values.push(bcrypt.hashSync(body.newPassword, 10));
  }

  if (fields.length) {
    values.push(session.user.id);
    await run(`UPDATE users SET ${fields.join(", ")} WHERE id = $${i}`, values);
  }

  return NextResponse.json(await getUser(session.user.id));
}

export async function DELETE() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Please log in" }, { status: 401 });
  await run("DELETE FROM users WHERE id = $1", [session.user.id]);
  return NextResponse.json({ ok: true });
}
