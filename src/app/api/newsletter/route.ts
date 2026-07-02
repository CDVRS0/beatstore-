import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNewsletterWelcome } from "@/lib/email";

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  await prisma.newsletterSubscriber.upsert({
    where: { email },
    create: { email },
    update: {},
  });

  sendNewsletterWelcome(email).catch(() => {});

  return NextResponse.json({ ok: true });
}
