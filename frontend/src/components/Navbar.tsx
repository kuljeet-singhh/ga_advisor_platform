"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="border-b border-zinc-200 bg-white">
      <nav className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3 text-sm">
        <Link href="/" className="font-semibold text-zinc-900">
          GA Advisor
        </Link>
        {session ? (
          <>
            <Link href="/dashboard" className="text-zinc-600 hover:text-zinc-900">
              Dashboard
            </Link>
            <Link href="/select-property" className="text-zinc-600 hover:text-zinc-900">
              Select property
            </Link>
            <Link href="/history" className="text-zinc-600 hover:text-zinc-900">
              History
            </Link>
            <Link href="/settings" className="text-zinc-600 hover:text-zinc-900">
              Settings
            </Link>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="ml-auto rounded-md bg-zinc-900 px-3 py-1.5 text-white hover:bg-zinc-800"
            >
              Sign out
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => signIn("google")}
            className="ml-auto rounded-md bg-zinc-900 px-3 py-1.5 text-white hover:bg-zinc-800"
          >
            Connect Google Analytics
          </button>
        )}
      </nav>
    </header>
  );
}
