import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") return null;
  return session;
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const template = await prisma.licenseTemplate.update({
    where: { id: params.id },
    data: {
      name: body.name,
      description: body.description,
      defaultPrice: body.defaultPrice,
      fileFormats: body.fileFormats,
      streamLimit: body.streamLimit ?? null,
      distributionLimit: body.distributionLimit ?? null,
      musicVideos: !!body.musicVideos,
      performanceRights: !!body.performanceRights,
      commercialUse: !!body.commercialUse,
      isExclusive: !!body.isExclusive,
      agreementText: body.agreementText,
      sortOrder: body.sortOrder,
    },
  });

  return NextResponse.json({ template });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.licenseTemplate.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
