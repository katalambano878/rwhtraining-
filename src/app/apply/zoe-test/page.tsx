import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { startZoeTestCheckout } from "./actions";

export const metadata: Metadata = {
  title: "Zoe test checkout",
  robots: { index: false, follow: false },
};

export default async function ZoeTestPage({
  searchParams,
}: {
  searchParams: Promise<{ gate?: string; error?: string }>;
}) {
  const { gate = "", error } = await searchParams;
  const expected = process.env.ZOE_TEST_GATE?.trim();
  if (!expected || gate !== expected) notFound();

  const message =
    error === "details"
      ? "Enter your name, email, and a Ghana mobile number."
      : error === "live"
        ? "This page only starts test checkouts."
        : null;

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        Remote Work Hub
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
        Zoe test checkout
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        This starts a GH₵ 1 simulated payment. It does not charge a wallet and it does not reserve a seat.
      </p>
      {message ? (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {message}
        </p>
      ) : null}
      <form action={startZoeTestCheckout} className="mt-8 space-y-4">
        <input type="hidden" name="gate" value={gate} />
        <label className="block text-sm font-medium text-slate-800">
          Name
          <input
            name="name"
            required
            autoComplete="name"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium text-slate-800">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium text-slate-800">
          Mobile money number
          <input
            name="phone"
            required
            inputMode="tel"
            autoComplete="tel"
            placeholder="024 000 0000"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Start test checkout
        </button>
      </form>
    </main>
  );
}
