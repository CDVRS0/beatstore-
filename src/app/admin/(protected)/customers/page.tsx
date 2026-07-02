import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export default async function AdminCustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: { orders: { where: { status: "PAID" }, select: { total: true } } },
  });

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-hi">Customers</h1>

      <div className="overflow-x-auto rounded-xs border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-panel text-xs uppercase tracking-wider text-lo">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Orders</th>
              <th className="p-3">Lifetime spend</th>
              <th className="p-3">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-panel/50">
            {customers.map((c) => (
              <tr key={c.id}>
                <td className="p-3 text-hi">{c.name || "—"}</td>
                <td className="p-3 text-lo">{c.email}</td>
                <td className="p-3 text-lo">{c.orders.length}</td>
                <td className="p-3 text-hi">{formatPrice(c.orders.reduce((s, o) => s + Number(o.total), 0))}</td>
                <td className="p-3 text-lo">{c.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && <div className="p-8 text-center text-sm text-lo">No customer accounts yet.</div>}
      </div>
    </div>
  );
}
