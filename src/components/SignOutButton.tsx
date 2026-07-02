"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton({ redirectTo = "/" }: { redirectTo?: string }) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: redirectTo })}
      className="rounded-xs border border-line px-3 py-1.5 text-xs text-lo hover:border-blue hover:text-hi"
    >
      Sign out
    </button>
  );
}
