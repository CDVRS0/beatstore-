import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import StatCard from "@/components/admin/StatCard";

export default async function AdminOverviewPage() {
  const [revenueAgg, orderCount, beatCount, customerCount, recentOrders] = await Promise.all([
    prisma.order.aggregate({ where: { status: "PAID" }, _sum: { total: true } }),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.beat.count(),
    prisma.customer.count(),
    prisma.order.findMany({
      where: { status: "PAID" },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { items: true },
    }),
  ]);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const revenue30d = await prisma.order.aggregate({
    where: { status: "PAID", createdAt: { gte: thirtyDaysAgo } },
    _sum: { total: true },
  });

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-hi">Overview</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total revenue" value={formatPrice(Number(revenueAgg._sum.total || 0))} />
        <StatCard label="Last 30 days" value={formatPrice(Number(revenue30d._sum.total || 0))} />
        <StatCard label="Orders" value={String(orderCount)} />
        <StatCard label="Beats live" value={String(beatCount)} sub={`${customerCount} customer accounts`} />
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-hi">Recent sales</h2>
        <Link href="/admin/orders" className="text-xs text-blue hover:underline">View all →</Link>
      </div>

      <div className="mt-4 divide-y divide-line rounded-xs border border-line bg-panel">
        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-sm text-lo">No sales yet.</div>
        ) : (
          recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4">
              <div>
                <div className="text-sm font-bold text-hi">#{order.orderNumber}</div>
                <div className="text-xs text-lo">
                  {order.customerEmail} · {order.items.map((i) => i.beatTitle).join(", ")}
                </div>
              </div>
              <div className="text-sm font-bold text-hi">{formatPrice(Number(order.total))}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
