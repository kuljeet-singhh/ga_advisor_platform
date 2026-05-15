import Link from "next/link";
import SignInButton from "@/components/SignInButton";

export default function Home() {
  return (
    <div className="flex min-h-[min(70dvh,32rem)] flex-col items-center justify-center">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-200/80 bg-white p-8 text-center shadow-sm">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">GA Advisor</h1>
        <p className="mt-4 text-balance text-lg leading-relaxed text-zinc-600">
          Connect Google Analytics to get prioritized, AI-backed recommendations. Sign in to
          continue.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <SignInButton>Connect Google Analytics</SignInButton>
        </div>
        <p className="mt-8 text-sm leading-relaxed text-zinc-500">
          Or use <strong className="font-medium text-zinc-700">Connect Google Analytics</strong>{" "}
          in the header.{" "}
          <Link
            href="/dashboard"
            className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 transition hover:text-zinc-700 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
          >
            Go to dashboard
          </Link>{" "}
          if you are already signed in.
        </p>
      </div>
    </div>
  );
}
