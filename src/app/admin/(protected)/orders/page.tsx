import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { items: true },
  });

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-hi">Orders</h1>

      <div className="overflow-x-auto rounded-xs border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-panel text-xs uppercase tracking-wider text-lo">
            <tr>
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Items</th>
              <th className="p-3">Status</th>
              <th className="p-3">Total</th>
              <th className="p-3">Downloads</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-panel/50">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="p-3 font-bold text-hi">{order.orderNumber}</td>
                <td className="p-3 text-lo">{order.customerEmail}</td>
                <td className="p-3 text-lo">{order.items.map((i) => `${i.beatTitle} (${i.licenseName})`).join(", ")}</td>
                <td className="p-3">
                  <span
                    className={`rounded-xs px-2 py-1 text-xs font-bold ${
                      order.status === "PAID"
                        ? "bg-blue/10 text-blue"
                        : order.status === "PENDING"
                        ? "bg-line text-lo"
                        : "bg-red/10 text-red"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="p-3 text-hi">{formatPrice(Number(order.total))}</td>
                <td className="p-3 text-lo">{order.items.reduce((s, i) => s + i.downloadCount, 0)}</td>
                <td className="p-3 text-lo">{order.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <div className="p-8 text-center text-sm text-lo">No orders yet.</div>}
      </div>
    </div>
  );
}
