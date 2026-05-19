"use client";

import type { ReactNode } from "react";
import { signIn } from "next-auth/react";

type SignInButtonProps = {
  children: ReactNode;
  variant?: "solid" | "outline" | "dark";
  className?: string;
};

const variantClasses: Record<NonNullable<SignInButtonProps["variant"]>, string> = {
  solid:
    "rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 focus-visible:outline focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2",
  outline:
    "rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
  dark: "rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 focus-visible:outline focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900",
};

export default function SignInButton({
  children,
  variant = "solid",
  className = "",
}: SignInButtonProps) {
  return (
    <button
      type="button"
      onClick={() => signIn("google")}
      className={`${variantClasses[variant]} ${className}`.trim()}
    >
      {children}
    </button>
  );
}
