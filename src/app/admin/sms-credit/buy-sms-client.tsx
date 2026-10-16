"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

type Package = { id: string; amount: string; currency: string; sms: number };
type Checkout = { id: string; status: string; sms?: number; already_credited?: boolean };
type Billing = {
  configured: boolean;
  sms_left?: number;
  packages?: Package[];
  checkout?: Checkout | null;
};

const PENDING_KEY = "rwh_sms_checkout";

function cedis(amount: string): string {
  const value = Number(amount) || 0;
  return `GHS ${value.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function readPending(): string {
  try {
    return sessionStorage.getItem(PENDING_KEY) || "";
  } catch {
    return "";
  }
}

function writePending(id: string | null) {
  try {
    if (id) sessionStorage.setItem(PENDING_KEY, id);
    else sessionStorage.removeItem(PENDING_KEY);
  } catch {
    /* private mode */
  }
}

async function adminJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, credentials: "include", cache: "no-store" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || `Request failed (${res.status})`);
  return json as T;
}

export function BuySmsClient() {
  const [billing, setBilling] = useState<Billing | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [paying, setPaying] = useState(false);

  const load = useCallback(async (checkoutId = "") => {
    const data = await adminJson<Billing>(checkoutId ? `/api/admin/sms-credit?checkout=${checkoutId}` : "/api/admin/sms-credit");
    setBilling(data);
    return data;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pending = readPending();
        const data = await load(pending);
        if (cancelled || !pending || !data.checkout) return;
        if (data.checkout.status === "succeeded") {
          writePending(null);
          const added = Number(data.checkout.sms) || 0;
          setNotice(
            data.checkout.already_credited
              ? "This payment was already added."
              : `${added.toLocaleString("en-GH")} SMS added to this account.`,
          );
        } else if (data.checkout.status === "failed") {
          writePending(null);
          setError("The payment was not completed. Your balance is unchanged.");
        } else {
          setNotice("Payment is still confirming. Refresh this page in a moment.");
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load SMS packages.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  async function buy(packageId: string) {
    setPaying(true);
    setError("");
    try {
      const checkout = await adminJson<{ id: string; checkout_url: string }>("/api/admin/sms-credit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ package_id: packageId }),
      });
      writePending(checkout.id);
      window.location.href = checkout.checkout_url;
    } catch (err) {
      setPaying(false);
      setError(err instanceof Error ? err.message : "Could not start payment.");
    }
  }

  if (!billing && !error) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Buy SMS</h1>
        <p className="mt-2 text-sm text-slate-500">
          Student and marketing texts come out of this balance. Pay on checkout and the SMS land here—no separate SMS account.
        </p>
      </div>

      {notice ? (
        <div className="rounded-2xl border border-green-100 bg-green-50 p-4 text-sm font-medium text-green-800">{notice}</div>
      ) : null}
      {error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-800">{error}</div>
      ) : null}

      {billing && !billing.configured ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          SMS buying is not connected yet. Once the Taysend key is set, packages appear here.
        </div>
      ) : null}

      {billing?.configured ? (
        <>
          <div className="rounded-2xl bg-slate-900 p-6 text-white">
            <p className="text-sm text-slate-300">SMS left</p>
            <p className="mt-1 text-4xl font-bold tabular-nums">{(billing.sms_left || 0).toLocaleString("en-GH")}</p>
          </div>

          <p className="text-sm font-medium text-slate-600">Choose a package, then press Buy on it.</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="radiogroup" aria-label="SMS packages">
            {(billing.packages || []).map((pkg) => {
              const selected = pkg.id === selectedId;
              const price = cedis(pkg.amount);
              return (
                <div
                  key={pkg.id}
                  role="radio"
                  aria-checked={selected}
                  tabIndex={0}
                  onClick={() => setSelectedId(pkg.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedId(pkg.id);
                    }
                  }}
                  className={`flex cursor-pointer flex-col rounded-2xl border p-5 transition ${
                    selected ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-600" : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <p className="text-2xl font-bold tabular-nums text-slate-900">{price}</p>
                  <p className="mt-1 text-sm text-slate-600">{pkg.sms.toLocaleString("en-GH")} SMS</p>
                  <button
                    type="button"
                    disabled={paying}
                    onClick={(event) => {
                      event.stopPropagation();
                      if (!selected) {
                        setSelectedId(pkg.id);
                        return;
                      }
                      void buy(pkg.id);
                    }}
                    className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white disabled:opacity-60"
                  >
                    {paying && selected ? "Opening payment…" : selected ? `Buy ${price}` : "Buy"}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}
