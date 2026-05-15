"use client";

import type { ReactNode } from "react";
import { signIn } from "next-auth/react";

export default function SignInButton({ children }: { children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => signIn("google")}
      className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 focus-visible:outline focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
    >
      {children}
    </button>
  );
}
