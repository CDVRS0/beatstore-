import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { formatPrice } from "@/lib/utils";
import SignOutButton from "@/components/SignOutButton";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  const isCustomer = session && (session.user as any)?.role === "customer";

  if (!isCustomer) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center md:px-8">
        <h1 className="font-display text-2xl font-bold text-hi">My account</h1>
        <p className="mt-2 text-sm text-lo">Log in to view your orders and wishlist.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/account/login" className="rounded-xs bg-blue px-5 py-3 text-sm font-bold text-hi">Log in</Link>
          <Link href="/account/register" className="rounded-xs border border-line px-5 py-3 text-sm font-bold text-hi">Sign up</Link>
        </div>
      </div>
    );
  }

  const orders = await prisma.order.findMany({
    where: { customerId: (session!.user as any).id, status: "PAID" },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-hi">My account</h1>
          <p className="text-sm text-lo">{session!.user?.email}</p>
        </div>
        <SignOutButton />
      </div>

      <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-lo">Order history</h2>
      {orders.length === 0 ? (
        <div className="rounded-xs border border-dashed border-line p-8 text-center text-lo">
          No orders yet. <Link href="/shop" className="text-blue hover:underline">Browse beats</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xs border border-line bg-panel p-4">
              <div className="mb-2 flex items-center justify-between text-xs text-lo">
                <span>#{order.orderNumber}</span>
                <span>{order.createdAt.toDateString()}</span>
              </div>
              <div className="divide-y divide-line">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2">
                    <div>
                      <div className="text-sm font-bold text-hi">{item.beatTitle}</div>
                      <div className="text-xs text-lo">{item.licenseName} — {formatPrice(Number(item.price))}</div>
                    </div>
                    <a href={`/api/downloads/${item.downloadToken}`} className="text-xs font-bold text-blue hover:underline">
                      Download
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
