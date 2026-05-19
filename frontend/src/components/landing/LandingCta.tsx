"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import SignInButton from "@/components/SignInButton";

export default function LandingCta() {
  const { data: session } = useSession();

  return (
    <section className="px-4 pb-16">
      <div className="mx-auto max-w-4xl rounded-[2.5rem] bg-zinc-900 px-8 py-12 text-center sm:px-12 sm:py-16">
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Ready to improve your website?
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-zinc-400 sm:text-base">
          Connect your Google Analytics account and get your first recommendations in under a
          minute.
        </p>
        <div className="mt-8">
          {session ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-lg border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 focus-visible:outline focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
            >
              Go to dashboard
            </Link>
          ) : (
            <SignInButton variant="dark">Connect Google Analytics — it&apos;s free</SignInButton>
          )}
        </div>
      </div>
    </section>
  );
}
