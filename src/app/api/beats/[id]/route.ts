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

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const beat = await prisma.beat.findUnique({
    where: { id: params.id },
    include: { licenses: { orderBy: { sortOrder: "asc" } }, files: true },
  });
  if (!beat) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ beat });
}

// Public: increments play count. Called by the player once a preview has played for a few seconds.
export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  await prisma.beat
    .update({ where: { id: params.id }, data: { playCount: { increment: 1 } } })
    .catch(() => {});
  return NextResponse.json({ ok: true });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    title,
    description,
    bpm,
    key,
    genre,
    mood,
    tags,
    artworkKey,
    previewKey,
    status,
    featured,
    exclusiveSold,
    licenses, // array of { id, price, name, ... } to update existing license instances
  } = body;

  const beat = await prisma.beat.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(bpm !== undefined && { bpm }),
      ...(key !== undefined && { key }),
      ...(genre !== undefined && { genre }),
      ...(mood !== undefined && { mood }),
      ...(tags !== undefined && { tags }),
      ...(artworkKey !== undefined && { artworkKey }),
      ...(previewKey !== undefined && { previewKey }),
      ...(status !== undefined && { status }),
      ...(featured !== undefined && { featured }),
      ...(exclusiveSold !== undefined && { exclusiveSold }),
    },
  });

  if (Array.isArray(licenses)) {
    for (const l of licenses) {
      await prisma.license.update({
        where: { id: l.id },
        data: { price: l.price },
      });
    }
  }

  return NextResponse.json({ beat });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const beat = await prisma.beat.findUnique({ where: { id: params.id }, include: { files: true } });
  if (!beat) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // best-effort cleanup of stored files; ignore individual failures
  await Promise.all([
    ...(beat.artworkKey ? [deleteObject(beat.artworkKey).catch(() => {})] : []),
    ...(beat.previewKey ? [deleteObject(beat.previewKey).catch(() => {})] : []),
    ...beat.files.map((f) => deleteObject(f.storageKey).catch(() => {})),
  ]);

  await prisma.beat.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
