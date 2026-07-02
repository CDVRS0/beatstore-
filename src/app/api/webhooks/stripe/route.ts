import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { formatPrice, getSiteUrl } from "@/lib/utils";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const orderId = session.metadata?.orderId;
    if (!orderId) return NextResponse.json({ received: true });

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: "PAID", stripePaymentIntent: session.payment_intent as string },
      include: { items: true },
    });

    // Mark any exclusive-rights licenses as sold and pull the beat from sale
    const exclusiveItems = await prisma.orderItem.findMany({
      where: { orderId: order.id, license: { isExclusive: true } },
      select: { beatId: true },
    });
    if (exclusiveItems.length) {
      await prisma.beat.updateMany({
        where: { id: { in: exclusiveItems.map((i) => i.beatId) } },
        data: { exclusiveSold: true },
      });
    }

    const siteUrl = getSiteUrl();
    const items = order.items.map((item) => ({
      beatTitle: item.beatTitle,
      licenseName: item.licenseName,
      price: formatPrice(Number(item.price)).replace("£", ""),
      downloadUrl: `${siteUrl}/api/downloads/${item.downloadToken}`,
    }));

    try {
      await sendOrderConfirmationEmail({
        to: order.customerEmail,
        orderNumber: order.orderNumber,
        total: formatPrice(Number(order.total)).replace("£", ""),
        items,
      });
    } catch (err) {
      console.error("Failed to send order confirmation email:", err);
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as any;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      await prisma.order.update({ where: { id: orderId }, data: { status: "FAILED" } }).catch(() => {});
    }
  }

  return NextResponse.json({ received: true });
}
