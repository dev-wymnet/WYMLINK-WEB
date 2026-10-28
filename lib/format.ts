const ngn = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 2 });
const ngnShort = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });

export const toNumber = (v: unknown) => {
  const n = typeof v === "number" ? v : Number.parseFloat(String(v ?? "0"));
  return Number.isFinite(n) ? n : 0;
};

export const naira = (v: unknown, opts: { whole?: boolean } = {}) =>
  (opts.whole ? ngnShort : ngn).format(toNumber(v));

export const dateTime = (iso: string | null | undefined) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
};

export const relativeDay = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const diff = Math.floor((new Date(today.toDateString()).getTime() - new Date(d.toDateString()).getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: diff > 300 ? "numeric" : undefined });
};

export const titleCase = (s: string) =>
  s.replace(/[_-]+/g, " ").replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());

// Nigerian phone: accepts 080..., 234..., +234...; returns 11-digit local form or null.
export const normalizeNgPhone = (raw: string) => {
  const d = raw.replace(/\D/g, "");
  if (/^0[789][01]\d{8}$/.test(d)) return d;
  if (/^234[789][01]\d{8}$/.test(d)) return `0${d.slice(3)}`;
  return null;
};

// Best-effort network from a Nigerian number prefix (user can always override).
const PREFIXES: Record<string, string[]> = {
  mtn: ["0703", "0706", "0803", "0806", "0810", "0813", "0814", "0816", "0903", "0906", "0913", "0916", "07025", "07026", "0704"],
  airtel: ["0701", "0708", "0802", "0808", "0812", "0901", "0902", "0904", "0907", "0912", "0911"],
  glo: ["0705", "0805", "0807", "0811", "0815", "0905", "0915"],
  "9mobile": ["0809", "0817", "0818", "0908", "0909"],
};
export const guessNetwork = (phone: string) => {
  const local = normalizeNgPhone(phone);
  if (!local) return null;
  for (const [net, list] of Object.entries(PREFIXES)) if (list.some((p) => local.startsWith(p))) return net;
  return null;
};
