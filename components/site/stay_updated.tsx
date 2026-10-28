"use client";

import { useState } from "react";
import { IcCircleCheck } from "@/components/app/icons";
import { api, errorMessage } from "@/lib/api/client";
import { cx } from "@/lib/cx";

// "Stay updated": saves the email with the backend (POST /updates/subscribe).
export function StayUpdated({ className }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className={cx("flex min-h-[250px] flex-col items-center justify-center gap-8 rounded-[32px] bg-white px-5 py-10 text-center shadow-[0_0_0_1px_rgb(11_18_32/0.05)] sm:p-12", className)}>
      <div className="flex flex-col gap-3">
        <h2 className="text-2xl font-[450] leading-[1.35] tracking-[-0.72px] text-ink">Stay updated</h2>
        <p className="text-[17px] font-[450] leading-[1.36] tracking-[-0.2px] text-ink/65 sm:text-xl">Be the first to hear about new services from Wymlink.</p>
      </div>
      {state === "done" ? (
        <p className="flex items-center gap-2 text-[17px] text-ink" role="status">
          <IcCircleCheck className="text-xl text-ok" aria-hidden /> Thanks. We&apos;ll keep you posted.
        </p>
      ) : (
        <form
          className="flex w-full max-w-[540px] flex-col items-center gap-3 sm:flex-row sm:justify-center"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setState("busy");
            try {
              await api("/updates/subscribe", { method: "POST", body: { email: email.trim() } });
              setState("done");
            } catch (err) {
              setError(errorMessage(err));
              setState("idle");
            }
          }}
        >
          <label htmlFor="stay-updated-email" className="sr-only">
            Email
          </label>
          <input
            id="stay-updated-email"
            type="email"
            required
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-[43px] w-full rounded-[36px] bg-ink/[0.03] px-4 text-base tracking-[-0.16px] text-ink outline-none placeholder:text-ink/30 focus:ring-2 focus:ring-brand-200 sm:w-[420px]"
          />
          <button
            type="submit"
            disabled={!email.trim() || state === "busy"}
            className="h-[42px] w-full shrink-0 rounded-full bg-ink px-4 text-base font-[450] tracking-[-0.16px] text-white transition hover:bg-ink/85 disabled:opacity-45 sm:w-auto"
          >
            {state === "busy" ? "Saving…" : "Notify me"}
          </button>
        </form>
      )}
      {error && (
        <p className="-mt-4 text-sm text-bad" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
