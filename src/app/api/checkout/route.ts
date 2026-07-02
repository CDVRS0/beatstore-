import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { generateOrderNumber } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { publicUrl } from "@/lib/r2";
import { getSiteUrl } from "@/lib/utils";

const schema = z.object({
  email: z.string().email(),
  items: z.array(z.object({ beatId: z.string(), licenseId: z.string() })).min(1),
});

const PREVIEW_PREFIX = "free-preview:";

async function ensurePreviewLicense(beatId: string) {
  const beat = await prisma.beat.findUnique({ where: { id: beatId }, include: { licenses: true } });
  if (!beat || !beat.previewKey) return null;

  const existing = await prisma.license.findFirst({
    where: {
      beatId,
      name: "Tagged preview",
      price: 0,
    },
    include: { beat: true },
  });
  if (existing) return existing;

  const template = await prisma.licenseTemplate.findFirst({ where: { name: "MP3 Lease" } });
  const templateId = template ? template.id : (await prisma.licenseTemplate.findFirst())?.id;
  if (!templateId) return null;

  return prisma.license.create({
    data: {
      beatId,
      templateId,
      name: "Tagged preview",
      price: 0,
      fileFormats: ["MP3"],
      streamLimit: 100000,
      distributionLimit: 2000,
      musicVideos: false,
      performanceRights: false,
      commercialUse: false,
      isExclusive: false,
      agreementText:
        "This tagged preview is provided free for nonprofit and demo use only. Commercial use requires a paid license.",
    },
    include: { beat: true },
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid checkout payload" }, { status: 400 });
  }
  const { email, items } = parsed.data;

  const paidLicenseIds = items.filter((item) => !item.licenseId.startsWith(PREVIEW_PREFIX)).map((item) => item.licenseId);
  const paidLicenses = paidLicenseIds.length
    ? await prisma.license.findMany({ where: { id: { in: paidLicenseIds } }, include: { beat: true } })
    : [];

  const previewRequests = items
    .filter((item) => item.licenseId.startsWith(PREVIEW_PREFIX))
    .map((item) => ({ beatId: item.beatId }));

  const previewLicenses = await Promise.all(
    previewRequests.map(async ({ beatId }) => {
      const license = await ensurePreviewLicense(beatId);
      if (!license) throw new Error("Tagged preview is not available for one of the selected beats.");
      return license;
    })
  );

  if (paidLicenses.length !== paidLicenseIds.length) {
    return NextResponse.json({ error: "One or more items are no longer available" }, { status: 400 });
  }

  const allLicenses = [...paidLicenses, ...previewLicenses];

  const soldExclusive = allLicenses.find((l) => l.beat.exclusiveSold);
  if (soldExclusive) {
    return NextResponse.json(
      { error: `"${soldExclusive.beat.title}" is no longer available (exclusive rights sold).` },
      { status: 409 }
    );
  }

  const session = await getServerSession(authOptions);
  const customerId =
    session && (session.user as any)?.role === "customer" ? (session.user as any).id : undefined;

  const subtotal = allLicenses.reduce((sum, l) => sum + Number(l.price), 0);
  const orderNumber = generateOrderNumber();
  const downloadExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const siteUrl = getSiteUrl();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerId,
      customerEmail: email,
      status: "PENDING",
      subtotal,
      total: subtotal,
      items: {
        create: allLicenses.map((l) => ({
          beatId: l.beatId,
          licenseId: l.id,
          beatTitle: l.beat.title,
          licenseName: l.name,
          price: l.price,
          downloadExpiresAt,
        })),
      },
    },
  });

  const paidLineItems = allLicenses
    .filter((l) => Number(l.price) > 0)
    .map((l) => ({
      price_data: {
        currency: "gbp",
        unit_amount: Math.round(Number(l.price) * 100),
        product_data: {
          name: `${l.beat.title} — ${l.name}`,
          ...(l.beat.artworkKey && { images: [publicUrl(l.beat.artworkKey)] }),
        },
      },
      quantity: 1,
    }));

  if (paidLineItems.length === 0) {
    await prisma.order.update({ where: { id: order.id }, data: { status: "PAID" } });
    return NextResponse.json({ url: `${siteUrl}/order/success?order=${orderNumber}` });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    line_items: paidLineItems,
    metadata: { orderId: order.id, orderNumber },
    success_url: `${siteUrl}/order/success?order=${orderNumber}`,
    cancel_url: `${siteUrl}/cart`,
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { stripeSessionId: checkoutSession.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
