"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IcLifeBuoy } from "@/components/app/icons";
import { Alert, Badge, Button, Card, Empty, PageHeader, Skeleton, cx } from "@/components/app/ui";
import { adminApi, type TicketDetail, type TicketRow, type TicketStatus } from "@/lib/api/admin";
import { ApiError, errorMessage } from "@/lib/api/client";
import { useAdmin } from "@/features/admin/admin_context";

// Support inbox for several staff at once: the open conversation updates by itself every few
// seconds, everyone sees who has a ticket and who else is looking at it, and a reply is
// held back if a colleague answered first.

type Tab = { key: string; label: string; query: { status?: TicketStatus; assigned?: "me" | "unassigned" } };
const TABS: Tab[] = [
  { key: "open", label: "Needs a reply", query: { status: "open" } },
  { key: "mine", label: "Mine", query: { assigned: "me" } },
  { key: "unassigned", label: "Unassigned", query: { assigned: "unassigned" } },
  { key: "awaiting_customer", label: "Waiting on customer", query: { status: "awaiting_customer" } },
  { key: "resolved", label: "Resolved", query: { status: "resolved" } },
  { key: "closed", label: "Closed", query: { status: "closed" } },
  { key: "all", label: "All", query: {} },
];
const STATUS_LABEL: Record<TicketStatus, string> = { open: "Needs a reply", awaiting_customer: "Waiting on customer", resolved: "Resolved", closed: "Closed" };
const TONE: Record<TicketStatus, "warn" | "info" | "ok" | "neutral"> = { open: "warn", awaiting_customer: "info", resolved: "ok", closed: "neutral" };
const RELATED: Record<string, string> = { vtu_order: "Purchase", payout: "Bank transfer", transfer: "Wymlink transfer", deposit: "Deposit", ledger: "Transaction" };

const THREAD_POLL_MS = 4000;
const LIST_POLL_MS = 10_000;

const when = (iso: string) => new Date(iso).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

// Runs `fn` now and every `ms` while the tab is visible, and straight away when it's shown again.
function usePoll(fn: () => void, ms: number) {
  const latest = useRef(fn);
  useEffect(() => {
    latest.current = fn;
  });
  useEffect(() => {
    latest.current();
    const t = setInterval(() => document.visibilityState === "visible" && latest.current(), ms);
    const onShow = () => document.visibilityState === "visible" && latest.current();
    document.addEventListener("visibilitychange", onShow);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", onShow);
    };
  }, [ms]);
}

type Pending = { key: string; body: string };

function Thread({ id, canReply, onChanged }: { id: string; canReply: boolean; onChanged: () => void }) {
  const { admin } = useAdmin();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [pending, setPending] = useState<Pending[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const list = useRef<HTMLOListElement>(null);
  const nearBottom = useRef(true);
  const lastCount = useRef(0);

  usePoll(() => {
    adminApi
      .ticket(id)
      .then((r) => {
        setTicket(r.ticket);
        setError(null);
      })
      .catch((e) => setError(errorMessage(e)));
  }, THREAD_POLL_MS);

  // Keep the newest message in view, unless the reader has scrolled up to read history.
  const count = (ticket?.messages.length ?? 0) + pending.length;
  useLayoutEffect(() => {
    const el = list.current;
    if (!el) return;
    if (count > lastCount.current && nearBottom.current) el.scrollTop = el.scrollHeight;
    lastCount.current = count;
  }, [count]);

  if (error && !ticket) return <Alert tone="bad">{error}</Alert>;
  if (!ticket) return <Skeleton className="h-96" />;

  const act = async (label: string, fn: () => Promise<{ ticket: TicketDetail }>) => {
    setBusy(label);
    setError(null);
    try {
      setTicket((await fn()).ticket);
      onChanged();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  const send = async (resolve: boolean) => {
    const body = reply.trim();
    if (!body || busy) return;
    const key = `p${Date.now()}`;
    const after = ticket.messages.at(-1)?.id;
    setPending((p) => [...p, { key, body }]);
    setReply("");
    setBusy(resolve ? "resolve" : "send");
    setError(null);
    setNotice(null);
    nearBottom.current = true;
    try {
      setTicket((await adminApi.replyTicket(ticket.id, body, resolve, after)).ticket);
      onChanged();
    } catch (e) {
      // Not sent: put the text back so nothing is lost.
      setReply(body);
      if (e instanceof ApiError && e.code === "REPLY_CONFLICT") {
        setNotice(e.message);
        adminApi
          .ticket(ticket.id)
          .then((r) => setTicket(r.ticket))
          .catch(() => undefined);
      } else setError(errorMessage(e));
    } finally {
      setPending((p) => p.filter((x) => x.key !== key));
      setBusy(null);
    }
  };

  const mine = ticket.assignee?.id === admin?.id;
  const handledBy = ticket.assignee ? (mine ? "You're handling this" : `${ticket.assignee.name} is handling this`) : "Nobody has taken this yet";

  return (
    <Card flush className="flex h-[calc(100vh-220px)] min-h-[560px] flex-col">
      <div className="border-b border-line p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold tracking-tight text-ink">{ticket.subject}</h2>
            <p className="mt-1 text-sm text-ink-soft">
              <Link href={`/admin/customers/${ticket.customer.id}`} className="font-medium text-brand-600 hover:underline">
                {ticket.customer.name}
              </Link>
              {ticket.customer.email && ` · ${ticket.customer.email}`}
              {ticket.customer.phone && ` · ${ticket.customer.phone}`}
            </p>
            {ticket.relatedType && (
              <p className="mt-1 text-xs text-ink-faint">
                About: {RELATED[ticket.relatedType] ?? ticket.relatedType}
                {ticket.relatedId && ` · ${ticket.relatedId}`}
              </p>
            )}
          </div>
          <Badge tone={TONE[ticket.status]}>{STATUS_LABEL[ticket.status]}</Badge>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className={cx("font-medium", mine ? "text-brand-600" : "text-ink-soft")}>{handledBy}</span>
          {canReply && (
            <Button size="sm" variant="ghost" loading={busy === "assign"} onClick={() => act("assign", () => adminApi.assignTicket(ticket.id, mine ? "none" : "me"))}>
              {mine ? "Let someone else take it" : ticket.assignee ? "Take it over" : "Take this ticket"}
            </Button>
          )}
        </div>
        {ticket.otherViewers.length > 0 && (
          <p className="mt-2 text-sm text-warn">
            {ticket.otherViewers.map((v) => v.name).join(", ")} {ticket.otherViewers.length === 1 ? "is" : "are"} also looking at this ticket.
          </p>
        )}
      </div>

      <ol
        ref={list}
        onScroll={(e) => {
          const el = e.currentTarget;
          nearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
        }}
        className="flex flex-1 flex-col gap-4 overflow-y-auto p-5 sm:p-6"
      >
        {ticket.messages.map((m) => (
          <li key={m.id} className={cx("max-w-[85%]", m.fromCustomer ? "self-start" : "self-end")}>
            <div className={cx("whitespace-pre-wrap rounded-2xl px-4 py-3 text-[15px] leading-relaxed", m.fromCustomer ? "bg-canvas text-ink" : "bg-brand-600 text-white")}>{m.body}</div>
            <p className={cx("mt-1 text-xs text-ink-faint", !m.fromCustomer && "text-right")}>
              {m.fromCustomer ? ticket.customer.name : (m.authorName ?? "Wymlink support")} · {when(m.createdAt)}
            </p>
          </li>
        ))}
        {pending.map((p) => (
          <li key={p.key} className="max-w-[85%] self-end opacity-60">
            <div className="whitespace-pre-wrap rounded-2xl bg-brand-600 px-4 py-3 text-[15px] leading-relaxed text-white">{p.body}</div>
            <p className="mt-1 text-right text-xs text-ink-faint">Sending…</p>
          </li>
        ))}
      </ol>

      <div className="border-t border-line p-5 sm:p-6">
        {notice && (
          <div className="mb-3">
            <Alert tone="warn" onClose={() => setNotice(null)}>
              {notice}
            </Alert>
          </div>
        )}
        {error && (
          <div className="mb-3">
            <Alert tone="bad">{error}</Alert>
          </div>
        )}
        {canReply ? (
          <>
            <label htmlFor="reply" className="sr-only">
              Reply
            </label>
            <textarea
              id="reply"
              rows={3}
              maxLength={5000}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  void send(false);
                }
              }}
              placeholder="Write a reply. Enter sends, Shift+Enter starts a new line."
              className="w-full resize-y rounded-2xl border border-transparent bg-canvas px-4 py-3 text-[15px] text-ink outline-none transition placeholder:text-ink-faint focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {ticket.status !== "closed" && (
                  <Button size="sm" variant="ghost" loading={busy === "close"} onClick={() => act("close", () => adminApi.setTicketStatus(ticket.id, "closed"))}>
                    Close ticket
                  </Button>
                )}
                {(ticket.status === "resolved" || ticket.status === "closed") && (
                  <Button size="sm" variant="ghost" loading={busy === "reopen"} onClick={() => act("reopen", () => adminApi.setTicketStatus(ticket.id, "open"))}>
                    Reopen
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" disabled={!reply.trim() || !!busy} loading={busy === "resolve"} onClick={() => send(true)}>
                  Reply &amp; resolve
                </Button>
                <Button disabled={!reply.trim() || !!busy} loading={busy === "send"} onClick={() => send(false)}>
                  Send reply
                </Button>
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-ink-soft">Your role can read tickets but not reply. Ask a super admin for access.</p>
        )}
      </div>
    </Card>
  );
}

function Support() {
  const router = useRouter();
  const params = useSearchParams();
  const { can } = useAdmin();
  const tab = TABS.find((t) => t.key === params.get("tab")) ?? TABS[0]!;
  const selected = params.get("id");
  const [tickets, setTickets] = useState<TicketRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    adminApi
      .tickets(tab.query)
      .then((r) => {
        setTickets(r.tickets);
        setError(null);
      })
      .catch((e) => setError(errorMessage(e)));
  }, [tab]);
  usePoll(load, LIST_POLL_MS);
  // Switching lists loads the new one at once.
  useEffect(load, [load]);

  const go = (q: { tab?: string; id?: string | null }) => {
    const next = new URLSearchParams(params.toString());
    if (q.tab) {
      next.set("tab", q.tab);
      next.delete("id");
    }
    if (q.id !== undefined) {
      if (q.id) next.set("id", q.id);
      else next.delete("id");
    }
    router.replace(`/admin/support?${next.toString()}`);
  };

  return (
    <div>
      <PageHeader title="Support" subtitle="Customer messages from the app. Replies show in the customer's support chat straight away." />
      <div className="mb-5 flex flex-wrap gap-x-6 gap-y-1 border-b border-line" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab.key === t.key}
            onClick={() => go({ tab: t.key })}
            className={cx("-mb-px border-b-2 py-2.5 text-sm font-medium transition-colors", tab.key === t.key ? "border-ink text-ink" : "border-transparent text-ink-soft hover:text-ink")}
          >
            {t.label}
          </button>
        ))}
      </div>
      {error && (
        <div className="mb-4">
          <Alert tone="bad">{error}</Alert>
        </div>
      )}
      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <Card flush className="max-h-[calc(100vh-220px)] overflow-y-auto">
          {!tickets ? (
            <div className="flex flex-col gap-3 p-4">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <Empty icon={<IcLifeBuoy />} title="Nothing here" body="No tickets in this list." />
          ) : (
            <ul className="divide-y divide-line">
              {tickets.map((t) => (
                <li key={t.id}>
                  <button type="button" onClick={() => go({ id: t.id })} className={cx("block w-full px-4 py-3.5 text-left transition-colors hover:bg-canvas", selected === t.id && "bg-brand-50")}>
                    <span className="flex items-center justify-between gap-2">
                      <span className={cx("truncate text-ink", t.status === "open" ? "font-semibold" : "font-medium")}>{t.subject}</span>
                      <span className="shrink-0 text-xs text-ink-faint">{when(t.updatedAt)}</span>
                    </span>
                    <span className="mt-0.5 flex items-center justify-between gap-2">
                      <span className="truncate text-sm text-ink-soft">{t.customer.name}</span>
                      {(tab.key === "all" || tab.key === "mine" || tab.key === "unassigned") && <Badge tone={TONE[t.status]}>{STATUS_LABEL[t.status]}</Badge>}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-ink-faint">{t.assignee ? `With ${t.assignee.name}` : "Unassigned"}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
        {selected ? (
          <Thread key={selected} id={selected} canReply={can("ADMIN_MANAGE_USERS")} onChanged={load} />
        ) : (
          <Card className="grid min-h-[320px] place-items-center">
            <Empty icon={<IcLifeBuoy />} title="Pick a ticket" body="Choose a ticket on the left to read it and reply." />
          </Card>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Support />
    </Suspense>
  );
}
