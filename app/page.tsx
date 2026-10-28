import Image from "next/image";
import {
  IcFingerprint,
  IcIdCard,
  IcKeyRound,
  IcReceipt,
  IcRefreshCw,
  IcShieldCheck,
  IcSmartphone,
} from "@/components/app/icons";
import { Accent, Container, CtaBand, CtaLink, FaqSection, FeatureGrid, Intro, Lead, Panel, SectionHeading, SitePage, StayUpdatedSection, rv } from "@/components/site/blocks";
import { RevealGroup } from "@/components/site/reveal";
import { Carousel } from "@/components/site/carousel";
import { BrowserWindow, DevicePhone } from "@/components/site/device";
import { IsoStacks } from "@/components/site/iso_stacks";
import { PhotoCollage, Statement, StoryCards } from "@/components/site/people";
import { Wordmark } from "@/components/site/site_footer";
import { cx } from "@/lib/cx";

const service = (name: string) => `/assets/logos/services/${name}.png`;
const bank = (slug: string) => `/assets/logos/banks/${slug}.png`;

const BILLS = [
  {
    title: "Airtime & data",
    body: "Any amount of airtime, or a daily, weekly or monthly bundle, for your line or anyone else's.",
    chips: [
      { src: service("mtn"), label: "MTN" },
      { src: service("airtel"), label: "Airtel" },
      { src: service("glo"), label: "Glo" },
      { src: service("9mobile"), label: "9mobile" },
    ],
  },
  {
    title: "Cable TV",
    body: "Renew DStv, GOtv or StarTimes in seconds. We show the name on the smartcard before you pay.",
    chips: [
      { src: service("dstv"), label: "DStv" },
      { src: service("gotv"), label: "GOtv" },
      { src: service("startimes"), label: "StarTimes" },
    ],
  },
  {
    title: "Electricity",
    body: "Prepaid tokens and postpaid bills for 12 distribution companies, with the token on your receipt.",
    chips: [
      { src: service("ikeja-electric"), label: "Ikeja" },
      { src: service("eko-electric"), label: "Eko" },
      { src: service("abuja-electric"), label: "Abuja" },
      { src: service("ibadan-electric"), label: "Ibadan" },
    ],
    more: "+8 More",
  },
];

const PAY = [
  { logo: service("mtn"), name: "MTN", stat: "Airtime & data", caption: "Top up any line in seconds." },
  { logo: service("dstv"), name: "DStv", stat: "TV renewals", caption: "DStv, GOtv and StarTimes." },
  { logo: service("ikeja-electric"), name: "Ikeja Electric", stat: "Power tokens", caption: "Your token on the receipt." },
  { logo: bank("zenith-bank"), name: "Zenith Bank", stat: "Bank transfers", caption: "To any Nigerian account." },
  { logo: bank("kuda-bank"), name: "Kuda", stat: "Fintechs too", caption: "Kuda, OPay, PalmPay, Moniepoint." },
  { logo: bank("providus-bank"), name: "Providus Bank", stat: "Your account", caption: "Add money from any bank app." },
];

const SAFETY = [
  { icon: IcKeyRound, title: "4-digit PIN", body: "Approves every payment you make." },
  { icon: IcIdCard, title: "BVN + NIN", body: "Every account is verified." },
  { icon: IcFingerprint, title: "App lock", body: "Passcode or fingerprint to open." },
  { icon: IcRefreshCw, title: "Auto refunds", body: "When a provider can't deliver." },
  { icon: IcReceipt, title: "Every receipt", body: "With a reference you can share." },
  { icon: IcShieldCheck, title: "Safe sign-in", body: "A reset signs out other devices." },
];

// Example activity for the illustration card (not real customer data).
const ACTIVITY = [
  { logo: bank("guaranty-trust-bank"), title: "Money in from GTBank", when: "Today, 9:41 AM", amount: "+₦25,000.00", credit: true },
  { logo: service("mtn"), title: "MTN airtime", when: "Today, 9:45 AM", amount: "−₦1,000.00" },
  { logo: service("ikeja-electric"), title: "Ikeja Electric token", when: "Yesterday, 7:12 PM", amount: "−₦5,000.00" },
  { logo: service("dstv"), title: "DStv Compact", when: "Yesterday, 6:30 PM", amount: "−₦12,500.00" },
  { logo: bank("zenith-bank"), title: "Transfer to Zenith Bank", when: "Monday, 2:05 PM", amount: "−₦10,030.00" },
];

const COLLAGE = [
  { src: "/assets/people/friends-couch.webp", alt: "Two friends on a sofa with the TV remote" },
  { src: "/assets/people/woman-call.webp", alt: "A woman laughing on a phone call" },
  { src: "/assets/people/trader.webp", alt: "A trader checking his phone in his shop", focus: "78% 50%" },
  { src: "/assets/people/young-man.webp", alt: "A young man looking at his phone" },
  { src: "/assets/people/family.webp", alt: "A family of six sitting together on steps" },
];

const STORIES = [
  {
    src: "/assets/people/woman-market.webp",
    alt: "A woman on her phone at a craft market",
    title: "Pay your suppliers",
    body: "Send money to any bank from your stall, and keep the receipt to show for it.",
    href: "/services/bank-transfer",
  },
  {
    src: "/assets/people/tv-remote.webp",
    alt: "A hand pointing a remote at the TV",
    title: "Renew before kickoff",
    body: "DStv, GOtv or StarTimes in seconds, so the match never cuts out.",
    href: "/services/cable",
  },
  {
    src: "/assets/people/student.webp",
    alt: "A student smiling at her laptop",
    title: "Data for the week",
    body: "Daily, weekly or monthly bundles on MTN, Airtel, Glo and 9mobile.",
    href: "/services/telecom",
  },
];

const FAQ = [
  { q: "What is Wymlink?", a: "A wallet by WymNet Global for airtime, data, cable TV, electricity and transfers to any Nigerian bank, with its own account number for adding money." },
  { q: "How do I add money to my wallet?", a: "Once your identity is verified you get a personal bank account number. Transfer to it from any Nigerian bank app and your Wymlink balance updates automatically." },
  { q: "What if a purchase fails?", a: "If a provider can't complete your airtime, data, TV or electricity purchase, the money goes back to your Wymlink wallet." },
  { q: "Is it free to open an account?", a: "Yes. Opening a Wymlink account costs nothing. You need your name, phone number and email, then your BVN and NIN to get your own account number." },
];

export default function HomePage() {
  return (
    <SitePage hero>
      {/* Hero */}
      <Panel tone="hero" ghost className="pt-[124px] sm:pt-[184px]">
        <Intro
          as="h1"
          immediate
          eyebrow="Wymlink App"
          title={
            <>
              Linked to <Accent>everything</Accent>
            </>
          }
          body="Airtime, data, TV, electricity and transfers to any bank, from one wallet with its own account number."
          actions={
            <>
              <CtaLink href="/auth/signup">
                <IcSmartphone className="text-lg" aria-hidden /> Create free account
              </CtaLink>
              <CtaLink href="#services" variant="soft">
                Learn More
              </CtaLink>
            </>
          }
        />
        <RevealGroup immediate className="relative mx-auto mt-14 h-[400px] max-w-[986px] sm:mt-[72px] sm:h-[553px]">
          <DevicePhone src="/assets/app/discos.webp" alt="Choosing an electricity company in Wymlink" className="rv-phone-side absolute left-1/2 top-10 z-10 hidden -translate-x-[calc(50%+256px)] lg:block" style={rv(1600)} />
          <DevicePhone src="/assets/app/airtime.webp" alt="Buying airtime: pick the network and amount" className="rv-phone-side absolute left-1/2 top-10 z-10 hidden translate-x-[calc(-50%+256px)] lg:block" style={rv(1600)} />
          <div className="rv-phone absolute left-1/2 top-0 z-20 w-[270px] -translate-x-1/2 sm:w-[323px]" style={rv(1500)}>
            <DevicePhone src="/assets/app/home.webp" alt="The Wymlink home screen" priority sizes="(min-width: 640px) 323px, 270px" className="w-full" />
          </div>
        </RevealGroup>
      </Panel>

      {/* Web dashboard + bills */}
      <Panel tone="dark" id="services" className="scroll-mt-20 pb-6 pt-20 sm:pb-[56px] sm:pt-[120px]">
        <Intro
          light
          eyebrow="Wymlink Web"
          icon="app-dark"
          title={
            <>
              Your <Accent light>whole wallet</Accent> online
            </>
          }
          body="Pay bills, send money and check every receipt from any computer."
          actions={
            <>
              <CtaLink href="/dashboard" variant="light">
                Open dashboard
              </CtaLink>
              <CtaLink href="/faq" variant="ghost-light">
                Learn More
              </CtaLink>
            </>
          }
        />
        <Container>
          <BrowserWindow src="/assets/app/web-dashboard.webp" alt="The Wymlink web dashboard" title="Wymlink dashboard" className="mt-16 sm:mt-[100px]" />
          <SectionHeading
            light
            className="mt-6 sm:mt-10"
            title="Bills for every household."
            body="Every network, every TV provider and 12 electricity companies, approved with your own PIN."
            action={
              <CtaLink href="/dashboard/bills" variant="ghost-light">
                All services
              </CtaLink>
            }
          />
          <RevealGroup>
          <ul className="mt-12 grid gap-4 sm:mt-[76px] sm:gap-6 md:grid-cols-3">
            {BILLS.map((c) => (
              <li key={c.title} className="flex min-h-[340px] flex-col justify-between gap-8 rounded-[24px] bg-white/[0.03] px-6 py-8">
                <div className="flex flex-col gap-3">
                  <h3 className="text-xl font-[450] leading-[1.35] tracking-[-0.2px] text-white">{c.title}</h3>
                  <p className="text-base leading-[1.45] tracking-[-0.16px] text-white/70">{c.body}</p>
                </div>
                <ul className="flex flex-wrap content-start gap-2 border-t border-white/10 pt-8">
                  {c.chips.map((chip, i) => (
                    <li key={chip.label} className="rv-chip inline-flex h-7 items-center gap-1.5 rounded-full bg-white/[0.07] pl-1 pr-2.5 text-sm text-white/90" style={rv(100 + 50 * i)}>
                      <Image src={chip.src} alt="" width={20} height={20} className="size-5 rounded-full bg-white object-contain" />
                      {chip.label}
                    </li>
                  ))}
                  {c.more && (
                    <li className="rv-chip inline-flex h-7 items-center rounded-full bg-white/[0.07] px-2.5 text-sm text-white/90" style={rv(100 + 50 * c.chips.length)}>
                      {c.more}
                    </li>
                  )}
                </ul>
              </li>
            ))}
          </ul>
          </RevealGroup>
        </Container>
      </Panel>

      {/* People */}
      <section className="px-5 py-16 sm:px-12 sm:py-24">
        <Container className="flex flex-col gap-12 sm:gap-16">
          <PhotoCollage photos={COLLAGE} />
          <Statement title="Made for everyone who pays.">
            <p>
              Traders settling suppliers between customers, students topping up data before class, families keeping the lights and the TV on. Wymlink puts the payments Nigerians make every
              week in one place, with a receipt for every naira and a PIN only you know.
            </p>
          </Statement>
        </Container>
      </section>

      {/* Transfers */}
      <Panel tone="kit" ghost className="pb-6 pt-20 sm:pb-[56px] sm:pt-[108px]">
        <Intro
          title={
            <>
              Send to <Accent>any bank</Accent>
            </>
          }
          body="Add money from any bank app with your own account number, and send to any Nigerian bank or fintech in seconds."
          actions={
            <>
              <CtaLink href="/dashboard/transfer">Send money</CtaLink>
              <CtaLink href="/services/bank-transfer" variant="soft">
                How it works
              </CtaLink>
            </>
          }
        />
        <IsoStacks className="mt-10 sm:mt-14" />
        <Container className="mt-6 sm:mt-10">
          <SectionHeading
            title="Every payment, one app."
            body="From MTN airtime to a Zenith transfer, it all happens in seconds."
            action={
              <CtaLink href="/about" variant="muted">
                Learn More
              </CtaLink>
            }
          />
          <div className="mt-2">
            <Carousel label="What you can pay with Wymlink">
              {PAY.map((p) => (
                <article key={p.name} className="relative flex min-h-[201px] w-[300px] shrink-0 snap-start flex-col gap-6 overflow-hidden rounded-[24px] bg-white/[0.23] p-8 shadow-[0_0_0_1px_rgb(11_18_32/0.05),0_1px_2px_rgb(0_0_0/0.03)] sm:w-[365px]">
                  <span className="pointer-events-none absolute inset-0 bg-white/20" aria-hidden />
                  <div className="relative flex items-center gap-3">
                    <Image src={p.logo} alt="" width={48} height={48} className="size-12 rounded-[12px] bg-white object-contain" />
                    <span className="text-base tracking-[-0.16px] text-ink/60">{p.name}</span>
                  </div>
                  <div className="relative">
                    <p className="text-[28px] font-medium leading-[1.35] tracking-[-0.64px] text-ink sm:text-[32px]">{p.stat}</p>
                    <p className="text-base leading-[1.45] tracking-[-0.16px] text-ink/45">{p.caption}</p>
                  </div>
                </article>
              ))}
            </Carousel>
          </div>
        </Container>
      </Panel>

      {/* Everyday life */}
      <section className="px-5 py-16 sm:px-12 sm:py-24">
        <Container>
          <SectionHeading
            title="Wymlink in everyday life."
            body="Small payments, sorted in seconds, wherever the day takes you."
            action={
              <CtaLink href="/auth/signup" variant="muted">
                Get started
              </CtaLink>
            }
          />
          <div className="mt-12">
            <StoryCards items={STORIES} />
          </div>
        </Container>
      </section>

      {/* Safety */}
      <Panel tone="trust" ghost className="pb-6 pt-24 sm:pb-[56px] sm:pt-[184px]">
        <div className="flex flex-col items-center text-center">
          <span className="text-brand-400">
            <Wordmark />
          </span>
          <Intro
            className="mt-5"
            title={
              <>
                <Accent>Safe</Accent> by default
              </>
            }
            body="Your PIN on every payment, verified identities and a receipt for every naira."
            actions={
              <>
                <CtaLink href="/faq#security" variant="soft">
                  Learn More
                </CtaLink>
                <CtaLink href="/contact" variant="muted">
                  Contact us
                </CtaLink>
              </>
            }
          />
        </div>
        <Container className="mt-14 sm:mt-[100px]">
          <FeatureGrid items={SAFETY} />
          <div className="mx-auto mt-16 h-px max-w-[890px] bg-ink/[0.07] sm:mt-[72px]" />
          <div className="mt-16 flex flex-col items-center gap-4 text-center sm:mt-[72px]">
            <h2 className="text-[28px] font-medium leading-[1.2] tracking-[-0.56px] text-ink/90 sm:text-[40px] sm:tracking-[-1.2px]">Know where every naira goes.</h2>
            <Lead>Money in and money out, each with a receipt and a reference.</Lead>
          </div>
          <div className="mt-12 rounded-[24px] bg-white p-6 shadow-[0_0_0_1px_rgb(11_18_32/0.05),0_1px_2px_rgb(0_0_0/0.03)] sm:mt-[72px] sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xl font-[450] tracking-[-0.2px] text-ink">Your activity</p>
                <p className="mt-1 text-base tracking-[-0.16px] text-ink/65">Every transaction, with a receipt you can share.</p>
              </div>
              <p className="flex items-center gap-5 text-[15px] text-ink/65">
                <span className="inline-flex items-center gap-2">
                  <span className="size-2 rounded-full bg-ok" /> Money in
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="size-2 rounded-full bg-ink/70" /> Money out
                </span>
              </p>
            </div>
            <ul className="mt-6 divide-y divide-ink/[0.06]">
              {ACTIVITY.map((a) => (
                <li key={a.title} className="flex items-center gap-4 py-4">
                  <Image src={a.logo} alt="" width={40} height={40} className="size-10 rounded-full bg-white object-contain ring-1 ring-ink/5" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-[450] tracking-[-0.16px] text-ink">{a.title}</p>
                    <p className="text-sm text-ink/45">{a.when}</p>
                  </div>
                  <div className="text-right">
                    <p className={cx("text-base font-medium tabular-nums tracking-[-0.16px]", a.credit ? "text-ok" : "text-ink")}>{a.amount}</p>
                    <p className="text-sm text-ink/45">Successful</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-center text-[13px] text-ink/35">Example activity, for illustration.</p>
          </div>
        </Container>
      </Panel>

      <FaqSection items={FAQ} more={{ href: "/faq", label: "Learn More About Wymlink" }} />
      <CtaBand photo={{ src: "/assets/people/laughing.webp", alt: "A woman laughing outdoors" }} />
      <StayUpdatedSection />
    </SitePage>
  );
}
