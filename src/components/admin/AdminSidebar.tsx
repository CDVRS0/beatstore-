"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "@/components/SignOutButton";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/beats", label: "Beats" },
  { href: "/admin/licenses", label: "License types" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-col border-line md:h-screen md:w-56 md:border-r">
      <div className="flex items-center justify-between p-5">
        <Link href="/admin" className="font-display text-lg font-bold text-hi">
          CDVRS<span className="text-blue">/admin</span>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-xs px-3 py-2 text-sm transition ${
                active ? "bg-blue/10 text-blue" : "text-lo hover:text-hi"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center justify-between p-4">
        <Link href="/" className="text-xs text-lo hover:text-hi">← View site</Link>
        <SignOutButton redirectTo="/admin/login" />
      </div>
    </aside>
  );
}
