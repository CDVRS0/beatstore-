import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendContactNotification } from "@/lib/email";

export async function POST(req: Request) {
  const { name, email, message, subject } = await req.json();
  if (!name || !email || !message) {
    return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
  }

  await prisma.contactMessage.create({ data: { name, email, message, subject } });
  sendContactNotification({ name, email, message }).catch(() => {});

  return NextResponse.json({ ok: true });
}
