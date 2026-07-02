import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();
  if (!email || !password || password.length < 8) {
    return NextResponse.json({ error: "Email and a password of at least 8 characters are required" }, { status: 400 });
  }

  const existing = await prisma.customer.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists. Try logging in instead." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.customer.create({ data: { name, email, passwordHash } });

  return NextResponse.json({ ok: true });
}
