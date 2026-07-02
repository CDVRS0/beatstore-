"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import "@/lib/auth-url";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "#131519",
            color: "#F3F4F1",
            border: "1px solid #23262C",
            fontFamily: "var(--font-body)",
          },
          success: { iconTheme: { primary: "#2E5CFF", secondary: "#F3F4F1" } },
        }}
      />
    </SessionProvider>
  );
}
