import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteObject } from "@/lib/r2";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") return null;
  return session;
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { storageKey, fileName, kind, sizeBytes } = await req.json();
  if (!storageKey || !fileName || !kind) {
    return NextResponse.json({ error: "storageKey, fileName, and kind are required" }, { status: 400 });
  }

  const file = await prisma.beatFile.create({
    data: { beatId: params.id, storageKey, fileName, kind, sizeBytes },
  });

  return NextResponse.json({ file });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { fileId } = await req.json();
  const file = await prisma.beatFile.findUnique({ where: { id: fileId } });
  if (!file || file.beatId !== params.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteObject(file.storageKey).catch(() => {});
  await prisma.beatFile.delete({ where: { id: fileId } });

  return NextResponse.json({ ok: true });
}
