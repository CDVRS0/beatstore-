import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const isAdmin = session && (session.user as any)?.role === "admin";

  if (!isAdmin) redirect("/admin/login");

  return (
    <div className="mx-auto flex max-w-7xl flex-col md:flex-row">
      <AdminSidebar />
      <div className="flex-1 p-5 md:p-8">{children}</div>
    </div>
  );
}
