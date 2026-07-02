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

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid checkout payload" }, { status: 400 });
  }
  const { email, items } = parsed.data;

  // Re-fetch authoritative price/terms server-side — never trust client-supplied prices.
  const licenses = await prisma.license.findMany({
    where: { id: { in: items.map((i) => i.licenseId) } },
    include: { beat: true },
  });

  if (licenses.length !== items.length) {
    return NextResponse.json({ error: "One or more items are no longer available" }, { status: 400 });
  }

  const soldExclusive = licenses.find((l) => l.beat.exclusiveSold);
  if (soldExclusive) {
    return NextResponse.json(
      { error: `"${soldExclusive.beat.title}" is no longer available (exclusive rights sold).` },
      { status: 409 }
    );
  }

  const session = await getServerSession(authOptions);
  const customerId =
    session && (session.user as any)?.role === "customer" ? (session.user as any).id : undefined;

  const subtotal = licenses.reduce((sum, l) => sum + Number(l.price), 0);
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
        create: licenses.map((l) => ({
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

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    line_items: licenses.map((l) => ({
      price_data: {
        currency: "gbp",
        unit_amount: Math.round(Number(l.price) * 100),
        product_data: {
          name: `${l.beat.title} — ${l.name}`,
          ...(l.beat.artworkKey && { images: [publicUrl(l.beat.artworkKey)] }),
        },
      },
      quantity: 1,
    })),
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
