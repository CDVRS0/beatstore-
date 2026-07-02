import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import ClearCartOnLoad from "@/components/ClearCartOnLoad";

export default async function OrderSuccessPage({ searchParams }: { searchParams: { order?: string } }) {
  const orderNumber = searchParams.order;
  const order = orderNumber
    ? await prisma.order.findUnique({ where: { orderNumber }, include: { items: true } })
    : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center md:px-8">
      <ClearCartOnLoad />
      <div className="led-dot mx-auto animate-blink" />
      <h1 className="mt-4 font-display text-3xl font-bold text-hi">
        {order?.status === "PAID" ? "Payment confirmed" : "Processing your order…"}
      </h1>
      <p className="mt-2 text-sm text-lo">
        {order
          ? `Order #${order.orderNumber} — a receipt is on its way to ${order.customerEmail}.`
          : "We couldn't find that order. Check your email for a receipt, or contact support."}
      </p>

      {order?.status === "PAID" && (
        <div className="mt-8 divide-y divide-line rounded-xs border border-line bg-panel text-left">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4">
              <div>
                <div className="font-bold text-hi">{item.beatTitle}</div>
                <div className="text-xs text-lo">{item.licenseName} — {formatPrice(Number(item.price))}</div>
              </div>
              <a href={`/api/downloads/${item.downloadToken}`} className="rounded-xs bg-blue px-3 py-2 text-xs font-bold text-hi">
                Download
              </a>
            </div>
          ))}
        </div>
      )}

      {order?.status === "PENDING" && (
        <p className="mt-4 text-xs text-lo">
          Payment is still confirming. Refresh this page in a moment, or check your email — download links will
          arrive there as soon as payment clears.
        </p>
      )}

      <Link href="/shop" className="mt-8 inline-block text-sm text-blue hover:underline">
        ← Keep browsing beats
      </Link>
    </div>
  );
}
