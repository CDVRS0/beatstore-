import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireCustomer() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "customer") return null;
  return (session.user as any).id as string;
}

export async function GET(req: Request) {
  const customerId = await requireCustomer();
  if (!customerId) return NextResponse.json({ wishlisted: false });

  const { searchParams } = new URL(req.url);
  const beatId = searchParams.get("beatId");
  if (!beatId) return NextResponse.json({ error: "beatId required" }, { status: 400 });

  const item = await prisma.wishlistItem.findUnique({
    where: { customerId_beatId: { customerId, beatId } },
  });
  return NextResponse.json({ wishlisted: !!item });
}

export async function POST(req: Request) {
  const customerId = await requireCustomer();
  if (!customerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { beatId } = await req.json();
  await prisma.wishlistItem.upsert({
    where: { customerId_beatId: { customerId, beatId } },
    create: { customerId, beatId },
    update: {},
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const customerId = await requireCustomer();
  if (!customerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { beatId } = await req.json();
  await prisma.wishlistItem
    .delete({ where: { customerId_beatId: { customerId, beatId } } })
    .catch(() => {});
  return NextResponse.json({ ok: true });
}
