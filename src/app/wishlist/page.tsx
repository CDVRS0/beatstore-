import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { toBeatCard } from "@/lib/beat-helpers";
import BeatCard from "@/components/BeatCard";

export default async function WishlistPage() {
  const session = await getServerSession(authOptions);
  const isCustomer = session && (session.user as any)?.role === "customer";

  if (!isCustomer) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center md:px-8">
        <h1 className="font-display text-2xl font-bold text-hi">Log in to see your wishlist</h1>
        <p className="mt-2 text-sm text-lo">Save beats while you browse and come back to them anytime.</p>
        <Link href="/account/login" className="mt-6 inline-block rounded-xs bg-blue px-5 py-3 text-sm font-bold text-hi">
          Log in
        </Link>
      </div>
    );
  }

  const items = await prisma.wishlistItem.findMany({
    where: { customerId: (session!.user as any).id },
    include: { beat: { include: { licenses: { select: { price: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-hi">Your wishlist</h1>
      {items.length === 0 ? (
        <div className="rounded-xs border border-dashed border-line p-12 text-center text-lo">
          Nothing saved yet. <Link href="/shop" className="text-blue hover:underline">Browse beats</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {items.map((i) => (
            <BeatCard key={i.id} beat={toBeatCard(i.beat)} />
          ))}
        </div>
      )}
    </div>
  );
}
