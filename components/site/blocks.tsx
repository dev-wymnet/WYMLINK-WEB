import Image from "next/image";
import type { ComponentType, CSSProperties, ReactNode } from "react";
import { AppIcon } from "@/components/app/brand";
import { IcArrowRight, IcPlus } from "@/components/app/icons";
import { DevicePhone } from "@/components/site/device";
import { Ghost } from "@/components/site/ghost";
import { RevealGroup } from "@/components/site/reveal";
import { RevealWords } from "@/components/site/reveal_words";
import { SiteFooter } from "@/components/site/site_footer";
import { SiteHeader } from "@/components/site/site_header";
import { StayUpdated } from "@/components/site/stay_updated";
import { cx } from "@/lib/cx";
import Link from "next/link";

type HeaderTone = "light" | "dark" | "brand";
type IconType = ComponentType<{ className?: string }>;

// Page shell. The header floats over the page; pages that open with a hero panel pass
// `hero` so the panel runs underneath it (like the reference), others get a spacer.
export function SitePage({ children, headerTone = "light", hero = false }: { children: ReactNode; headerTone?: HeaderTone; hero?: boolean }) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-ink">
      <SiteHeader tone={headerTone} />
      <main className={cx("flex flex-1 flex-col gap-3 px-1.5 sm:gap-6 sm:px-6", !hero && "pt-[76px] sm:pt-[82px]")}>{children}</main>
      <SiteFooter />
    </div>
  );
}

// Content column: 986px, the reference's inner width.
export const Container = ({ className, children }: { className?: string; children: ReactNode }) => (
  <div className={cx("mx-auto w-full max-w-[986px]", className)}>{children}</div>
);

type PanelTone = "hero" | "dark" | "kit" | "trust" | "foot" | "white" | "outline" | "tint" | "tint-2" | "canvas";
const PANEL: Record<PanelTone, string> = {
  hero: "panel-hero",
  dark: "panel-dark text-white",
  kit: "panel-kit",
  trust: "panel-trust",
  foot: "panel-foot",
  white: "bg-white",
  outline: "bg-white shadow-[0_0_0_1px_rgb(11_18_32/0.05)]",
  tint: "bg-tint",
  "tint-2": "bg-tint-2",
  canvas: "bg-canvas",
};

// A full-width rounded panel; every section sits on one. `ghost` adds the faint pixel
// texture at the top.
export function Panel({ tone = "hero", id, className, style, ghost, children }: { tone?: PanelTone; id?: string; className?: string; style?: CSSProperties; ghost?: boolean; children: ReactNode }) {
  return (
    <section id={id} style={style} className={cx("relative overflow-hidden rounded-[24px] px-5 sm:rounded-[32px] sm:px-12", PANEL[tone], className)}>
      {ghost && <Ghost className={tone === "dark" ? "invert" : undefined} />}
      <div className="relative">{children}</div>
    </section>
  );
}

// The label over a big heading: the app icon (default), the app icon on dark, a line icon, or text only.
export function Eyebrow({ children, icon, light }: { children: ReactNode; icon?: IconType | "app" | "app-dark" | null; light?: boolean }) {
  const Icon = icon && icon !== "app" && icon !== "app-dark" ? icon : null;
  return (
    <p className={cx("inline-flex items-center gap-3 text-[17px] font-[450] tracking-[-0.2px] sm:text-xl", light ? "text-white/80" : "text-ink/75")}>
      {(icon === undefined || icon === "app") && <AppIcon size={32} className="rounded-[9px]" />}
      {icon === "app-dark" && <AppIcon size={32} className="rounded-[9px] ring-1 ring-white/15 brightness-90" />}
      {Icon && <Icon className={cx("text-[28px]", light ? "text-brand-300" : "text-brand-400")} />}
      {children}
    </p>
  );
}

// The 72px display heading (48px on phones).
export function Display({ as: Tag = "h2", light, className, children }: { as?: "h1" | "h2" | "h3"; light?: boolean; className?: string; children: ReactNode }) {
  return (
    <Tag className={cx("text-balance text-[44px] font-[550] leading-[1.1] tracking-[-1.44px] sm:text-[60px] sm:tracking-[-2.6px] lg:text-[72px] lg:tracking-[-3.6px]", light ? "text-[#f6f7f4]" : "text-ink/90", className)}>
      {children}
    </Tag>
  );
}

// The italic serif word inside a display heading.
export const Accent = ({ children, light }: { children: ReactNode; light?: boolean }) => (
  <span className={cx("font-serif text-[1.08em] font-normal italic leading-none tracking-[-0.02em]", light ? "text-glow pr-[0.06em]" : "text-brand-400")}>{children}</span>
);

export const Lead = ({ children, light, className }: { children: ReactNode; light?: boolean; className?: string }) => (
  <p className={cx("text-pretty text-[17px] leading-[1.36] tracking-[-0.2px] sm:text-xl", light ? "text-white/70" : "text-ink/65", className)}>{children}</p>
);

// Kept for older pages: a smaller section heading.
export function Heading({ as: Tag = "h2", light, className, children }: { as?: "h1" | "h2" | "h3"; light?: boolean; className?: string; children: ReactNode }) {
  return (
    <Tag className={cx("text-balance text-[28px] font-medium leading-[1.2] tracking-[-0.56px] sm:text-[40px] sm:tracking-[-1.2px]", light ? "text-white" : "text-ink/90", className)}>
      {children}
    </Tag>
  );
}

// Centred product intro: label, display heading, a line of copy and the actions.
export function Intro({
  eyebrow,
  icon,
  title,
  body,
  actions,
  light,
  as = "h2",
  className,
  immediate,
}: {
  eyebrow?: ReactNode;
  icon?: IconType | "app" | "app-dark" | null;
  title: ReactNode;
  body?: ReactNode;
  actions?: ReactNode;
  light?: boolean;
  as?: "h1" | "h2" | "h3";
  className?: string;
  align?: "center" | "left";
  // Plays on load (the page's hero) rather than when scrolled into view.
  immediate?: boolean;
}) {
  return (
    <RevealGroup immediate={immediate} className={cx("mx-auto flex max-w-[986px] flex-col items-center text-center", className)}>
      {eyebrow && (
        <div className="rv" style={rv(500)}>
          <Eyebrow icon={icon} light={light}>
            {eyebrow}
          </Eyebrow>
        </div>
      )}
      <Display as={as} light={light} className={eyebrow ? "mt-4" : undefined}>
        <RevealWords>{title}</RevealWords>
      </Display>
      {body && (
        <div className="rv mt-3 max-w-[620px]" style={rv(1000, 16)}>
          <Lead light={light}>{body}</Lead>
        </div>
      )}
      {actions && (
        <div className="rv mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4" style={rv(1250, 8, 200)}>
          {actions}
        </div>
      )}
    </RevealGroup>
  );
}

// Timing for a piece of a RevealGroup: when it starts, how far it rises, how long it takes.
export const rv = (delay: number, y = 8, duration = 350) => ({ "--rv-delay": `${delay}ms`, "--rv-y": `${y}px`, "--rv-dur": `${duration}ms` }) as CSSProperties;

// Left-aligned section heading (40px) with an optional action on the right.
export function SectionHeading({ title, body, action, light, className }: { title: ReactNode; body?: ReactNode; action?: ReactNode; light?: boolean; className?: string }) {
  return (
    <RevealGroup className={cx("flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div className="flex max-w-[46rem] flex-col gap-4">
        <Heading light={light}>
          <RevealWords>{title}</RevealWords>
        </Heading>
        {body && (
          <div className="rv" style={rv(1000, 16)}>
            <Lead light={light}>{body}</Lead>
          </div>
        )}
      </div>
      {action && (
        <div className="rv shrink-0" style={rv(1250, 8, 200)}>
          {action}
        </div>
      )}
    </RevealGroup>
  );
}

type CtaVariant = "primary" | "soft" | "muted" | "dark" | "light" | "ghost-light" | "secondary";
const CTA: Record<CtaVariant, string> = {
  primary: "bg-brand-500 text-white hover:bg-brand-600",
  soft: "bg-brand-500/10 text-brand-600 hover:bg-brand-500/[0.16]",
  muted: "bg-ink/5 text-ink hover:bg-ink/10",
  dark: "bg-ink text-white hover:bg-ink/85",
  light: "bg-white text-ink hover:bg-[#ebebeb]",
  "ghost-light": "bg-white/10 text-white hover:bg-white/15",
  secondary: "bg-white text-ink shadow-[0_0_0_1px_rgb(11_18_32/0.08)] hover:bg-canvas",
};

// Pill buttons: large (48px, the reference's default) and small (32px).
export function CtaLink({ href, children, variant = "primary", size = "lg", className }: { href: string; children: ReactNode; variant?: CtaVariant; size?: "lg" | "md" | "sm"; className?: string }) {
  return (
    <Link
      href={href}
      className={cx(
        "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full transition-[transform,background-color,color] active:scale-[0.99]",
        size === "lg" && "h-12 px-6 text-[17px] font-medium tracking-[-0.17px]",
        size === "md" && "h-11 px-5 text-[15px] font-medium tracking-[-0.15px]",
        size === "sm" && "h-8 px-4 text-sm font-[450] tracking-[-0.14px]",
        CTA[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}

// Older name for the realistic phone.
export function Phone({ src, alt, className, priority }: { src: string; alt: string; size?: "sm" | "md" | "lg"; className?: string; priority?: boolean }) {
  return <DevicePhone src={src} alt={alt} className={className} priority={priority} />;
}

// The top of a phone rising out of the bottom of the panel it sits in (put it last in a Panel).
export function PhoneRise({ src, alt, priority, className }: { src: string; alt: string; priority?: boolean; className?: string }) {
  return (
    <div className={cx("relative mt-[72px] flex h-[380px] justify-center sm:h-[500px]", className)}>
      <DevicePhone src={src} alt={alt} priority={priority} className="w-[260px] sm:w-[323px]" />
    </div>
  );
}

// A notification card floating beside a phone (decorative; hidden on small screens).
export function Note({ icon, title, sub, className }: { icon: ReactNode; title: string; sub: string; className?: string }) {
  return (
    <div className={cx("absolute z-30 hidden items-center gap-3 rounded-2xl bg-white/95 p-3 pr-5 text-left shadow-[0_0_0_1px_rgb(11_18_32/0.05),0_16px_40px_-16px_rgb(11_18_32/0.3)] backdrop-blur sm:flex", className)} aria-hidden>
      {icon}
      <div>
        <p className="text-sm font-medium text-ink">{title}</p>
        <p className="text-[13px] text-ink/55">{sub}</p>
      </div>
    </div>
  );
}

// Generic section: centred heading on top, content below. Non-white tones sit on a panel.
export function Section({
  title,
  body,
  children,
  tone = "white",
  className,
}: {
  title?: ReactNode;
  body?: ReactNode;
  children?: ReactNode;
  tone?: PanelTone;
  align?: "center" | "left";
  className?: string;
}) {
  const inner = (
    <Container>
      {title && (
        <RevealGroup className="mx-auto mb-12 flex max-w-[720px] flex-col items-center gap-4 text-center sm:mb-14">
          <Heading>
            <RevealWords>{title}</RevealWords>
          </Heading>
          {body && (
            <div className="rv" style={rv(1000, 16)}>
              <Lead>{body}</Lead>
            </div>
          )}
        </RevealGroup>
      )}
      {children}
    </Container>
  );
  if (tone === "white") return <section className={cx("px-5 py-16 sm:px-12 sm:py-24", className)}>{inner}</section>;
  return (
    <Panel tone={tone} className={cx("py-16 sm:py-24", className)}>
      {inner}
    </Panel>
  );
}

// Inner-page hero: the hero panel with a centred intro and an optional visual underneath.
export function PageHero({ eyebrow, icon, title, body, actions, aside }: { eyebrow?: string; icon?: IconType | "app" | null; title: ReactNode; body: ReactNode; actions?: ReactNode; aside?: ReactNode }) {
  return (
    <Panel tone="hero" ghost className={cx("pt-[136px] sm:pt-[170px]", !aside && "pb-20 sm:pb-28")}>
      <Intro as="h1" immediate eyebrow={eyebrow} icon={icon} title={title} body={body} actions={actions} />
      {aside}
    </Panel>
  );
}

// White cards: icon, a short heading and a line of text (the reference's "trusted" cards).
export function FeatureGrid({ items, columns = 3 }: { items: Array<{ icon: IconType; title: string; body: string }>; columns?: 3 | 4 }) {
  return (
    <ul className={cx("grid gap-4 sm:grid-cols-2 sm:gap-6", columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3")}>
      {items.map(({ icon: Icon, title, body }) => (
        <li key={title} className="flex min-h-[193px] flex-col rounded-[24px] border border-ink/5 bg-white p-8">
          <Icon className="text-[32px] text-brand-400" />
          <h3 className="mt-8 text-2xl font-[450] leading-[1.35] tracking-[-0.72px] text-ink">{title}</h3>
          <p className="mt-2 text-base leading-[1.4] tracking-[-0.16px] text-ink/60">{body}</p>
        </li>
      ))}
    </ul>
  );
}

export function Steps({ items }: { items: Array<{ title: string; body: string }> }) {
  return (
    <ol className="grid gap-4 sm:gap-6 md:grid-cols-3">
      {items.map((s) => (
        <li key={s.title} className="flex flex-col rounded-[24px] border border-ink/5 bg-white p-8">
          <h3 className="text-2xl font-[450] leading-[1.35] tracking-[-0.72px] text-ink">{s.title}</h3>
          <p className="mt-2 text-base leading-[1.4] tracking-[-0.16px] text-ink/60">{s.body}</p>
        </li>
      ))}
    </ol>
  );
}

// Accessible accordion without client JS, in the reference's style.
export function FaqList({ items }: { items: Array<{ q: string; a: ReactNode }> }) {
  return (
    <div>
      {items.map((f) => (
        <details key={f.q} className="group border-b border-ink/[0.06]">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-0 pb-[14px] pt-6 text-[17px] font-[450] tracking-[-0.17px] text-ink marker:content-none sm:px-4 sm:text-lg [&::-webkit-details-marker]:hidden">
            {f.q}
            <IcPlus className="shrink-0 text-[22px] text-brand-400 transition-transform duration-200 group-open:rotate-45" aria-hidden />
          </summary>
          <div className="pb-6 pr-10 text-base leading-6 tracking-[-0.18px] text-ink/60 sm:px-4">{f.a}</div>
        </details>
      ))}
    </div>
  );
}

// "FAQs" on the left, the list on the right, and a link under it.
export function FaqSection({ items, more = { href: "/faq", label: "More questions answered" } }: { items: Array<{ q: string; a: ReactNode }>; more?: { href: string; label: string } }) {
  return (
    <section className="relative overflow-hidden px-5 py-20 sm:px-12 sm:py-[120px]">
      <Ghost height={380} />
      <Container className="relative grid gap-8 lg:grid-cols-[340px_1fr] lg:gap-0">
        <h2 className="text-[32px] font-medium leading-[1.35] tracking-[-0.8px] text-ink sm:text-[40px]">FAQs</h2>
        <div>
          <FaqList items={items} />
          <Link href={more.href} className="group mt-8 inline-flex items-center gap-2.5 text-base font-[450] text-brand-500 sm:ml-4">
            {more.label}
            <span className="grid size-5 place-items-center rounded-full bg-brand-500/10 text-xs transition-transform group-hover:translate-x-0.5">
              <IcArrowRight />
            </span>
          </Link>
        </div>
      </Container>
    </section>
  );
}

// Closing card (the reference's "credit line" card): copy and the two ways in on the left,
// a photo on the right.
export function CtaBand({
  title,
  body = "Sign up in about two minutes with your name, phone number and email. Verify your BVN and NIN to get your own account number.",
  photo = { src: "/assets/people/woman-call.webp", alt: "A woman laughing on a phone call" },
}: {
  title?: ReactNode;
  body?: string;
  photo?: { src: string; alt: string };
}) {
  return (
    <section className="px-5 pb-10 pt-6 sm:px-12 sm:pb-[72px]">
      <Container>
        <div className="panel-kit grid overflow-hidden rounded-[32px] shadow-[0_0_0_1px_rgb(11_18_32/0.05)] md:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col items-start gap-5 px-7 py-12 sm:px-12 sm:py-14">
            <AppIcon size={48} className="rounded-[13px]" />
            <h2 className="text-balance text-[32px] font-[550] leading-[1.1] tracking-[-1px] text-ink/90 sm:text-[44px] sm:tracking-[-1.6px]">
              {title ?? (
                <>
                  Open your free <Accent>account</Accent>
                </>
              )}
            </h2>
            <Lead className="max-w-md">{body}</Lead>
            <div className="mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <CtaLink href="/auth/signup">Create free account</CtaLink>
              <CtaLink href="/auth/login" variant="soft">
                Sign in
              </CtaLink>
            </div>
          </div>
          <div className="relative min-h-[280px] md:min-h-full">
            <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 768px) 470px, 100vw" className="object-cover" />
          </div>
        </div>
      </Container>
    </section>
  );
}

// The reference's newsletter block, on its own.
export function StayUpdatedSection() {
  return (
    <section className="px-5 pb-10 pt-4 sm:px-12 sm:pb-[72px] sm:pt-[24px]">
      <Container>
        <StayUpdated />
      </Container>
    </section>
  );
}
