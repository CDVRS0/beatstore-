import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const templates = await prisma.licenseTemplate.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ templates });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const template = await prisma.licenseTemplate.create({
    data: {
      name: body.name,
      description: body.description,
      defaultPrice: body.defaultPrice,
      fileFormats: body.fileFormats || [],
      streamLimit: body.streamLimit ?? null,
      distributionLimit: body.distributionLimit ?? null,
      musicVideos: !!body.musicVideos,
      performanceRights: !!body.performanceRights,
      commercialUse: body.commercialUse ?? true,
      isExclusive: !!body.isExclusive,
      agreementText: body.agreementText || "",
      sortOrder: body.sortOrder ?? 0,
    },
  });

  return NextResponse.json({ template });
}
