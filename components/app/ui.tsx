"use client";

import Link from "next/link";
import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { IcCheck, IcCircleAlert, IcCopy, IcEye, IcEyeOff, IcInfo, IcLoaderCircle, IcX } from "@/components/app/icons";

import { cx } from "@/lib/cx";
export { cx };

// ---------- Button ----------
type Variant = "primary" | "secondary" | "ghost" | "danger" | "lime" | "light";
const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-200",
  secondary: "bg-white text-ink ring-1 ring-inset ring-line hover:bg-canvas disabled:text-ink-faint",
  ghost: "bg-transparent text-ink-soft hover:bg-canvas hover:text-ink",
  danger: "bg-bad text-white hover:brightness-95 disabled:opacity-50",
  lime: "bg-lime-accent text-lime-ink hover:brightness-95 disabled:opacity-60",
  // White on brand-coloured surfaces (the balance card).
  light: "bg-white text-ink hover:bg-white/90 disabled:opacity-60",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  block?: boolean;
  href?: string;
};

export const Button = ({ variant = "primary", size = "md", loading, block, className, children, disabled, href, ...rest }: ButtonProps) => {
  const cls = cx(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-[-0.01em] transition outline-none focus-visible:ring-4 focus-visible:ring-brand-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:active:scale-100",
    size === "sm" && "h-9 px-4 text-sm",
    size === "md" && "h-11 px-5 text-[15px]",
    size === "lg" && "h-13 px-6 text-base",
    block && "w-full",
    VARIANTS[variant],
    className,
  );
  if (href && !disabled) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading && <IcLoaderCircle className="animate-spin" aria-hidden />}
      {children}
    </button>
  );
};

// ---------- Field ----------
type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: ReactNode;
  error?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
};

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, hint, error, prefix, suffix, className, id, type, ...rest },
  ref,
) {
  const auto = useId();
  const fid = id ?? auto;
  const [reveal, setReveal] = useState(false);
  const isPassword = type === "password";
  return (
    <div className={cx("flex flex-col gap-1.5", className)}>
      <label htmlFor={fid} className="text-sm font-medium text-ink">
        {label}
      </label>
      <div
        className={cx(
          "flex h-12 items-center gap-2 rounded-2xl border px-4 transition focus-within:bg-white focus-within:ring-4",
          error ? "border-bad bg-white focus-within:ring-bad-soft" : "border-transparent bg-canvas hover:border-line focus-within:border-brand-500 focus-within:ring-brand-100",
        )}
      >
        {prefix && <span className="text-ink-soft">{prefix}</span>}
        <input
          ref={ref}
          id={fid}
          type={isPassword && reveal ? "text" : type}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? `${fid}-err` : hint ? `${fid}-hint` : undefined}
          className="h-full w-full min-w-0 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-faint"
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal((r) => !r)}
            className="text-ink-faint hover:text-ink"
            aria-label={reveal ? "Hide password" : "Show password"}
          >
            {reveal ? <IcEyeOff /> : <IcEye />}
          </button>
        )}
        {suffix}
      </div>
      {error ? (
        <p id={`${fid}-err`} className="flex items-center gap-1 text-sm text-bad">
          <IcCircleAlert aria-hidden /> {error}
        </p>
      ) : hint ? (
        <p id={`${fid}-hint`} className="text-sm text-ink-soft">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

// ---------- Select ----------
export const SelectField = ({
  label,
  error,
  children,
  className,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string }) => {
  const id = useId();
  return (
    <div className={cx("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <select
        id={id}
        className={cx(
          "h-12 rounded-2xl border px-3.5 text-[15px] text-ink outline-none transition focus:bg-white focus:ring-4",
          error ? "border-bad bg-white focus:ring-bad-soft" : "border-transparent bg-canvas hover:border-line focus:border-brand-500 focus:ring-brand-100",
        )}
        {...rest}
      >
        {children}
      </select>
      {error && <p className="text-sm text-bad">{error}</p>}
    </div>
  );
};

// ---------- Surfaces ----------
export const Card = ({ className, children, flush }: { className?: string; children: ReactNode; flush?: boolean }) => (
  <section className={cx("rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-card)]", !flush && "p-5 sm:p-7", className)}>
    {children}
  </section>
);

export const PageHeader = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 className="text-[28px] font-semibold tracking-[-0.035em] text-ink sm:text-[34px]">{title}</h1>
      {subtitle && <p className="mt-1 text-[15px] text-ink-soft">{subtitle}</p>}
    </div>
    {action}
  </div>
);

type Tone = "ok" | "warn" | "bad" | "info" | "neutral";
const TONES: Record<Tone, string> = {
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-warn",
  bad: "bg-bad-soft text-bad",
  info: "bg-brand-50 text-brand-700",
  neutral: "bg-canvas text-ink-soft",
};
const BADGE_TEXT: Record<Tone, string> = { ok: "text-ok", warn: "text-warn", bad: "text-bad", info: "text-brand-700", neutral: "text-ink-soft" };
export const Badge = ({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) => (
  <span className={cx("inline-flex items-center gap-1 text-xs font-semibold", BADGE_TEXT[tone])}>{children}</span>
);

export const statusTone = (status: string): Tone => {
  const s = status.toLowerCase();
  if (["success", "successful", "completed", "verified", "paid", "active"].includes(s)) return "ok";
  if (["pending", "processing", "queued"].includes(s)) return "warn";
  if (["failed", "reversed", "declined", "rejected", "disabled", "suspended"].includes(s)) return "bad";
  return "neutral";
};

export const Alert = ({ tone = "info", title, children, onClose }: { tone?: Tone; title?: string; children?: ReactNode; onClose?: () => void }) => (
  <div role={tone === "bad" ? "alert" : "status"} className={cx("flex gap-3 rounded-2xl p-4 text-sm", TONES[tone])}>
    {tone === "ok" ? <IcCheck className="mt-0.5 shrink-0" /> : tone === "bad" ? <IcCircleAlert className="mt-0.5 shrink-0" /> : <IcInfo className="mt-0.5 shrink-0" />}
    <div className="flex-1 text-ink">
      {title && <p className="font-semibold">{title}</p>}
      {children && <div className="text-ink-soft">{children}</div>}
    </div>
    {onClose && (
      <button onClick={onClose} aria-label="Dismiss" className="text-ink-faint hover:text-ink">
        <IcX />
      </button>
    )}
  </div>
);

export const Skeleton = ({ className }: { className?: string }) => <div className={cx("animate-pulse rounded-lg bg-line/70", className)} />;

export const Empty = ({ icon, title, body, action }: { icon?: ReactNode; title: string; body?: string; action?: ReactNode }) => (
  <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
    {icon && <div className="mb-1 grid size-12 place-items-center text-3xl text-ink-soft">{icon}</div>}
    <p className="font-medium text-ink">{title}</p>
    {body && <p className="max-w-sm text-sm text-ink-soft">{body}</p>}
    {action && <div className="mt-3">{action}</div>}
  </div>
);

export const CopyButton = ({ value, label = "Copy" }: { value: string; label?: string }) => {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        } catch {
          /* clipboard blocked */
        }
      }}
      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-brand-600 hover:bg-brand-50"
    >
      {done ? <IcCheck /> : <IcCopy />} {done ? "Copied" : label}
    </button>
  );
};

// ---------- Modal (sheet on mobile) ----------
export const Modal = ({ open, onClose, title, children, dismissible = true }: { open: boolean; onClose: () => void; title: string; children: ReactNode; dismissible?: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && dismissible && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prev?.focus();
    };
  }, [open, onClose, dismissible]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 backdrop-blur-[2px] sm:items-center" onMouseDown={(e) => e.target === e.currentTarget && dismissible && onClose()}>
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 shadow-[var(--shadow-pop)] outline-none sm:max-w-md sm:rounded-3xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          {dismissible && (
            <button onClick={onClose} aria-label="Close" className="grid size-9 place-items-center rounded-full text-ink-soft hover:bg-canvas">
              <IcX />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
};

// ---------- PIN input ----------
// Four masked boxes; digits only; paste-friendly; never shows the digits.
export const PinInput = ({
  value,
  onChange,
  length = 4,
  autoFocus,
  disabled,
  invalid,
  label = "PIN",
  onComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  length?: number;
  autoFocus?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  label?: string;
  onComplete?: (v: string) => void;
}) => {
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  useEffect(() => {
    if (autoFocus) inputs.current[0]?.focus();
  }, [autoFocus]);

  const setAt = (i: number, digit: string) => {
    const chars = value.padEnd(length, " ").split("");
    chars[i] = digit;
    const next = chars.join("").replace(/\s+$/, "").replace(/\s/g, "");
    onChange(next);
    if (next.length === length) onComplete?.(next);
  };

  return (
    <div className="flex justify-center gap-3" role="group" aria-label={label}>
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputs.current[i] = el;
          }}
          type="password"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          disabled={disabled}
          aria-label={`${label} digit ${i + 1}`}
          value={value[i] ?? ""}
          onChange={(e) => {
            const d = e.target.value.replace(/\D/g, "").slice(-1);
            if (!d) return;
            setAt(i, d);
            inputs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace") {
              e.preventDefault();
              if (value[i]) setAt(i, "");
              else if (i > 0) {
                inputs.current[i - 1]?.focus();
                onChange(value.slice(0, i - 1));
              }
            } else if (e.key === "ArrowLeft") inputs.current[i - 1]?.focus();
            else if (e.key === "ArrowRight") inputs.current[i + 1]?.focus();
          }}
          onPaste={(e) => {
            e.preventDefault();
            const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
            if (!digits) return;
            onChange(digits);
            inputs.current[Math.min(digits.length, length - 1)]?.focus();
            if (digits.length === length) onComplete?.(digits);
          }}
          className={cx(
            "size-14 rounded-2xl border-2 bg-white text-center text-2xl font-semibold text-ink outline-none transition focus:ring-4",
            invalid ? "border-bad focus:ring-bad-soft" : "border-line focus:border-brand-500 focus:ring-brand-100",
          )}
        />
      ))}
    </div>
  );
};

// Six-digit email code input (OTP), visible digits.
export const CodeInput = (props: { value: string; onChange: (v: string) => void; autoFocus?: boolean; label?: string }) => (
  <Field
    label={props.label ?? "Verification code"}
    inputMode="numeric"
    autoComplete="one-time-code"
    maxLength={6}
    placeholder="6-digit code"
    autoFocus={props.autoFocus}
    value={props.value}
    onChange={(e) => props.onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
    className="[&_input]:tracking-[0.4em]"
  />
);
