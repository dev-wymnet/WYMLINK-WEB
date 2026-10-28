import Link from "next/link";
import { IcMail, IcMonitor, IcPhone } from "@/components/app/icons";
import { AppIcon } from "@/components/app/brand";
import { CONTACT, FOOTER } from "@/components/site/content";
import { FluidBackground } from "@/components/site/fluid";

// The mark as one colour (takes the text colour), with the wordmark.
export function Wordmark({ className }: { className?: string }) {
  const mask = { maskImage: "url(/assets/brand/mark-mono.png)", WebkitMaskImage: "url(/assets/brand/mark-mono.png)", maskSize: "contain", WebkitMaskSize: "contain", maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat" };
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`} aria-label="Wymlink">
      <span className="block h-[26px] w-6 bg-current" style={mask} aria-hidden />
      <span className="text-[26px] font-[550] leading-none tracking-[calc(0.05em_-_0.9px)]">Wymlink</span>
    </span>
  );
}

// The footer panel: link columns, the wordmark with contact links, and the small print.
export function SiteFooter() {
  return (
    <footer className="panel-foot relative mx-1.5 mb-1.5 mt-3 overflow-hidden rounded-[24px] sm:mx-6 sm:mb-12 sm:mt-6 sm:rounded-[40px]">
      <FluidBackground palette="foot" />
      <div className="relative mx-auto max-w-[1082px] px-6 pb-10 pt-14 sm:p-12 sm:pt-16">
        <nav className="grid grid-cols-2 gap-x-8 gap-y-12 sm:flex sm:flex-wrap sm:justify-between sm:gap-x-12 lg:flex-nowrap lg:gap-x-8" aria-label="Footer">
          {FOOTER.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-[450] leading-[1.1] tracking-[0.01em] text-brand-400">{col.title}</p>
              <ul className="mt-5 flex flex-col gap-4">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className="inline-flex items-center gap-2 text-[15px] leading-[1.1] tracking-[calc(0.05em_-_0.15px)] text-ink/70 transition-colors hover:text-ink">
                      {l.icon === "app" && <AppIcon size={20} className="rounded-[6px]" />}
                      {l.icon === "web" && <IcMonitor className="text-xl text-ink/50" aria-hidden />}
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="mt-[72px] flex flex-wrap items-center justify-between gap-8">
          <Link href="/" className="text-brand-400" aria-label="Wymlink home">
            <Wordmark />
          </Link>
          <div className="flex items-center gap-6 text-ink/45">
            <a href={`mailto:${CONTACT.email}`} aria-label={`Email ${CONTACT.email}`} className="transition-colors hover:text-ink">
              <IcMail className="text-[22px]" />
            </a>
            <a href={CONTACT.phoneHref} aria-label={`Call ${CONTACT.phone}`} className="transition-colors hover:text-ink">
              <IcPhone className="text-[22px]" />
            </a>
            <a href={`mailto:${CONTACT.email}`} className="text-[15px] tracking-[calc(0.05em_-_0.15px)] transition-colors hover:text-ink">
              {CONTACT.email}
            </a>
          </div>
        </div>

        <p className="mt-16 max-w-[986px] text-[13px] leading-[18px] text-ink/35">
          © {new Date().getFullYear()} WymNet Global. Wymlink is a product of WymNet Global. Airtime, data, cable TV and electricity are delivered by their providers, and your Wymlink account
          number is a Providus Bank account number. Every payment is approved with your own transaction PIN.
        </p>
      </div>
    </footer>
  );
}
