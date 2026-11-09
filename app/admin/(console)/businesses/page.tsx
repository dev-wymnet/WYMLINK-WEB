"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import { IcBuilding2, IcPlus } from "@/components/app/icons";
import { Alert, Badge, Button, Card, CopyButton, Field, Modal, PageHeader, Skeleton } from "@/components/app/ui";
import { errorMessage } from "@/lib/api/client";
import { adminApi, type BusinessPayment, type BusinessRow } from "@/lib/api/admin";
import { useAdmin } from "@/features/admin/admin_context";
import { dateTime, naira } from "@/lib/format";

// WymNet Data Solutions' own businesses. Each has its own Wymlink account number and a fixed
// QR code. A customer scans it (phone camera or the Wymlink app), enters an amount and their
// PIN, and the money moves into that business's account.

// The QR opens the website's pay page. NEXT_PUBLIC_SITE_URL pins the domain printed on
// posters; otherwise the console's own address is used.
const siteOrigin = () => (process.env.NEXT_PUBLIC_SITE_URL || (typeof window === "undefined" ? "" : window.location.origin)).replace(/\/$/, "");
export const payUrl = (code: string) => `${siteOrigin()}/pay/${code}`;

function svgToPng(svg: SVGSVGElement, business: BusinessRow): Promise<string> {
  const xml = new XMLSerializer().serializeToString(svg);
  const img = new Image();
  return new Promise((resolve, reject) => {
    img.onload = () => {
      const W = 1200;
      const H = 1560;
      const c = document.createElement("canvas");
      c.width = W;
      c.height = H;
      const g = c.getContext("2d");
      if (!g) return reject(new Error("Canvas unavailable"));
      g.fillStyle = "#ffffff";
      g.fillRect(0, 0, W, H);
      g.fillStyle = "#127a66";
      g.fillRect(0, 0, W, 190);
      g.fillStyle = "#ffffff";
      g.textAlign = "center";
      g.font = "600 64px Outfit, Inter, Arial, sans-serif";
      g.fillText("Scan to pay", W / 2, 120);
      g.drawImage(img, 150, 270, 900, 900);
      g.fillStyle = "#1d2422";
      g.font = "600 72px Outfit, Inter, Arial, sans-serif";
      g.fillText(business.name, W / 2, 1300, W - 120);
      g.fillStyle = "#5b6b67";
      g.font = "400 40px Inter, Arial, sans-serif";
      g.fillText(`Code ${business.code} · Pay with Wymlink`, W / 2, 1380);
      g.fillText("Open your phone camera and point it here", W / 2, 1450);
      resolve(c.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("Couldn't draw the QR code"));
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;
  });
}

function QrModal({ business, onClose }: { business: BusinessRow; onClose: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const url = payUrl(business.code);
  const svg = () => box.current?.querySelector("svg") ?? null;

  return (
    <Modal open onClose={onClose} title={business.name}>
      <div className="flex flex-col items-center gap-4">
        <div ref={box} className="rounded-2xl border border-line bg-white p-4">
          <QRCode value={url} size={240} level="M" fgColor="#0f1a17" />
        </div>
        <p className="text-center text-sm text-ink-soft">
          Code <span className="font-semibold tracking-wider text-ink">{business.code}</span>. Scanning opens
          <br />
          <span className="break-all font-medium text-ink">{url}</span>
        </p>
        {error && <Alert tone="bad">{error}</Alert>}
        <div className="grid w-full grid-cols-2 gap-2">
          <Button
            loading={busy}
            onClick={async () => {
              const s = svg();
              if (!s) return;
              setBusy(true);
              setError(null);
              try {
                const png = await svgToPng(s, business);
                const a = document.createElement("a");
                a.href = png;
                a.download = `wymlink-qr-${business.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
                a.click();
              } catch (e) {
                setError(errorMessage(e));
              } finally {
                setBusy(false);
              }
            }}
          >
            Download poster
          </Button>
          <Button
            variant="secondary"
            onClick={async () => {
              const s = svg();
              if (!s) return;
              try {
                const png = await svgToPng(s, business);
                const w = window.open("", "_blank", "width=820,height=1000");
                if (!w) return setError("Allow pop-ups to print.");
                w.document.write(
                  `<!doctype html><title>${business.name.replace(/[<>&]/g, "")}</title><style>@page{margin:12mm}body{margin:0;display:grid;place-items:center;min-height:100vh}img{width:100%;max-width:180mm}</style><img src="${png}" onload="setTimeout(()=>{print()},200)">`,
                );
                w.document.close();
              } catch (e) {
                setError(errorMessage(e));
              }
            }}
          >
            Print
          </Button>
        </div>
        <div className="w-full">
          <CopyButton value={url} label="Copy pay link" />
        </div>
      </div>
    </Modal>
  );
}

function Payments({ business, onClose }: { business: BusinessRow; onClose: () => void }) {
  const [rows, setRows] = useState<BusinessPayment[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    adminApi
      .businessPayments(business.id)
      .then((r) => setRows(r.payments))
      .catch((e) => setError(errorMessage(e)));
  }, [business.id]);
  return (
    <Modal open onClose={onClose} title={`Payments to ${business.name}`}>
      {error ? (
        <Alert tone="bad">{error}</Alert>
      ) : !rows ? (
        <Skeleton className="h-40 w-full" />
      ) : rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-soft">No payments yet.</p>
      ) : (
        <ul className="divide-y divide-line">
          {rows.map((p) => (
            <li key={p.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{p.payer}</p>
                <p className="text-xs text-ink-soft">
                  {p.payerCode} · {dateTime(p.createdAt)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold tabular-nums">{naira(p.amount)}</p>
                <Badge tone={p.status === "success" ? "ok" : p.status === "pending" ? "warn" : "bad"}>{p.status === "success" ? "Received" : p.status === "pending" ? "Confirming" : "Failed"}</Badge>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

export default function BusinessesPage() {
  const { admin } = useAdmin();
  const superAdmin = admin?.role === "super_admin";
  const [rows, setRows] = useState<BusinessRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [qr, setQr] = useState<BusinessRow | null>(null);
  const [paymentsOf, setPaymentsOf] = useState<BusinessRow | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setRows((await adminApi.businesses()).businesses);
      setError(null);
    } catch (e) {
      setError(errorMessage(e));
    }
  }, []);
  useEffect(() => {
    let alive = true;
    const tick = () => alive && void load();
    tick();
    const t = setInterval(tick, 15_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [load]);

  const act = async (id: string, fn: () => Promise<unknown>, done: string) => {
    setBusyId(id);
    setError(null);
    try {
      await fn();
      setNotice(done);
      await load();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Businesses" subtitle="WymNet's businesses: each has its own account number and a QR code customers scan to pay." />
      {error && <Alert tone="bad">{error}</Alert>}
      {notice && (
        <Alert tone="ok" onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      )}

      {superAdmin && (
        <Card>
          <form
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
            onSubmit={async (e) => {
              e.preventDefault();
              if (name.trim().length < 2) return setError("Enter the business name.");
              setCreating(true);
              setError(null);
              try {
                const { business } = await adminApi.createBusiness(name.trim());
                setName("");
                setNotice(business.account ? `${business.name} is ready: account ${business.account.accountNumber}.` : `${business.name} was added. Its account number didn't open yet: press "Open account number".`);
                await load();
                if (business.account) setQr(business);
              } catch (err) {
                setError(errorMessage(err));
              } finally {
                setCreating(false);
              }
            }}
          >
            <div className="flex-1">
              <Field label="New business" placeholder="e.g. Wymnet Cafe" value={name} onChange={(e) => setName(e.target.value)} hint="The account number is named after it (first 8 letters)." />
            </div>
            <Button type="submit" loading={creating}>
              <IcPlus /> Add business
            </Button>
          </form>
        </Card>
      )}

      {!rows ? (
        <Skeleton className="h-48 w-full" />
      ) : rows.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <IcBuilding2 className="text-4xl text-ink-faint" aria-hidden />
            <p className="font-medium text-ink">No businesses yet</p>
            <p className="text-sm text-ink-soft">{superAdmin ? "Add one above to get its QR code." : "A super admin adds businesses."}</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((b) => (
            <Card key={b.id}>
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold text-ink">{b.name}</h2>
                    <p className="text-sm text-ink-soft">
                      Code <span className="font-semibold tracking-wider text-ink">{b.code}</span>
                    </p>
                  </div>
                  <Badge tone={b.active ? "ok" : "neutral"}>{b.active ? "Taking payments" : "Paused"}</Badge>
                </div>
                {b.account ? (
                  <div className="rounded-2xl bg-canvas p-4">
                    <p className="text-xs text-ink-soft">{b.account.bankName}</p>
                    <p className="text-lg font-semibold tracking-wider tabular-nums">{b.account.accountNumber}</p>
                    <p className="text-xs text-ink-soft">{b.account.accountName}</p>
                  </div>
                ) : (
                  <Alert tone="warn">No account number yet: payments can&apos;t be taken.</Alert>
                )}
                <dl className="grid grid-cols-2 gap-3">
                  <div>
                    <dt className="text-xs text-ink-soft">Received</dt>
                    <dd className="text-lg font-semibold tabular-nums">{naira(b.payments.total)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-soft">Payments</dt>
                    <dd className="text-lg font-semibold tabular-nums">{b.payments.count}</dd>
                  </div>
                </dl>
                <div className="flex flex-wrap gap-2">
                  {b.account && <Button onClick={() => setQr(b)}>Show QR code</Button>}
                  <Button variant="secondary" onClick={() => setPaymentsOf(b)}>
                    Payments
                  </Button>
                  {superAdmin && !b.account && (
                    <Button variant="secondary" loading={busyId === b.id} onClick={() => act(b.id, () => adminApi.openBusinessAccount(b.id), `${b.name}'s account number is open.`)}>
                      Open account number
                    </Button>
                  )}
                  {superAdmin && (
                    <Button variant="ghost" loading={busyId === b.id} onClick={() => act(b.id, () => adminApi.setBusinessActive(b.id, !b.active), b.active ? `${b.name} is paused.` : `${b.name} takes payments again.`)}>
                      {b.active ? "Pause" : "Resume"}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {qr && <QrModal business={qr} onClose={() => setQr(null)} />}
      {paymentsOf && <Payments business={paymentsOf} onClose={() => setPaymentsOf(null)} />}
    </div>
  );
}
