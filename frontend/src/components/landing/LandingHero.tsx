"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import SignInButton from "@/components/SignInButton";

export default function LandingHero() {
  const { data: session } = useSession();
  const signedIn = !!session;

  return (
    <section className="px-4 pb-12 pt-4 text-center sm:pb-16 sm:pt-8">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        Powered by AI
      </span>

      <h1 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
        Turn your GA data into <span className="text-blue-600">actions</span>
      </h1>

      <p className="mx-auto mt-5 max-w-2xl text-balance text-lg leading-relaxed text-slate-600">
        GA Advisor reads your Google Analytics data and tells you exactly what to fix — no guessing,
        no expertise needed.
      </p>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {signedIn ? (
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 focus-visible:outline focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
          >
            Go to dashboard
          </Link>
        ) : (
          <SignInButton variant="outline">Connect Google Analytics</SignInButton>
        )}
        <a
          href="#how-it-works"
          className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
        >
          See how it works
        </a>
      </div>
    </section>
  );
}
