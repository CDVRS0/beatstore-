import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { publicUrl } from "@/lib/r2";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") return null;
  return session;
}

export async function GET(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || undefined;

  const beats = await prisma.beat.findMany({
    where: q ? { title: { contains: q, mode: "insensitive" } } : undefined,
    orderBy: { createdAt: "desc" },
    include: { licenses: true, _count: { select: { orderItems: true } } },
  });

  const shaped = beats.map((b) => ({ ...b, artworkUrl: b.artworkKey ? publicUrl(b.artworkKey) : null }));

  return NextResponse.json({ beats: shaped });
}

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  bpm: z.number().int().positive(),
  key: z.string().min(1),
  genre: z.string().min(1),
  mood: z.string().min(1),
  tags: z.array(z.string()).default([]),
  artworkKey: z.string().optional(),
  previewKey: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  featured: z.boolean().default(false),
  licenseTemplateIds: z.array(z.string()).min(1),
  priceOverrides: z.record(z.string(), z.number()).optional(),
});

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const templates = await prisma.licenseTemplate.findMany({ where: { id: { in: data.licenseTemplateIds } } });

  const baseSlug = slugify(data.title);
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.beat.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++counter}`;
  }

  const beat = await prisma.beat.create({
    data: {
      slug,
      title: data.title,
      description: data.description,
      bpm: data.bpm,
      key: data.key,
      genre: data.genre,
      mood: data.mood,
      tags: data.tags,
      artworkKey: data.artworkKey,
      previewKey: data.previewKey,
      status: data.status,
      featured: data.featured,
      licenses: {
        create: templates.map((t, i) => ({
          templateId: t.id,
          name: t.name,
          price: data.priceOverrides?.[t.id] ?? t.defaultPrice,
          fileFormats: t.fileFormats,
          streamLimit: t.streamLimit,
          distributionLimit: t.distributionLimit,
          musicVideos: t.musicVideos,
          performanceRights: t.performanceRights,
          commercialUse: t.commercialUse,
          isExclusive: t.isExclusive,
          agreementText: t.agreementText,
          sortOrder: i,
        })),
      },
    },
    include: { licenses: true },
  });

  return NextResponse.json({ beat });
}
