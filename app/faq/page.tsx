import type { Metadata } from "next";
import Link from "next/link";
import { Container, FaqList, PageHero, SitePage } from "@/components/site/blocks";
import { CONTACT } from "@/components/site/content";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about Wymlink accounts, adding money, airtime, data, bills, transfers and security.",
};

const GROUPS: Array<{ id: string; title: string; items: Array<{ q: string; a: React.ReactNode }> }> = [
  {
    id: "getting-started",
    title: "Getting started",
    items: [
      { q: "What is Wymlink?", a: "A wallet by WymNet Global for paying airtime, data, cable TV and electricity, and sending money to Nigerian banks." },
      { q: "What do I need to sign up?", a: "Your name (as it appears on your BVN or NIN), email address, phone number and a password. You'll then create a 4-digit transaction PIN and verify your identity." },
      { q: "Does it cost anything to open an account?", a: "No. Opening a Wymlink account is free." },
    ],
  },
  {
    id: "adding-money",
    title: "Adding money",
    items: [
      { q: "How do I add money?", a: "After you verify your identity you get your own bank account number. Transfer to it from any Nigerian bank app and your balance updates automatically." },
      { q: "Why don't I have an account number yet?", a: "Account numbers are issued once your BVN or NIN is verified. Go to Security & KYC in your dashboard to verify." },
      { q: "My deposit hasn't arrived.", a: <>Transfers usually arrive within minutes. If it&apos;s been more than 30 minutes, email <a className="font-medium text-brand-600" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> with your bank&apos;s receipt.</> },
    ],
  },
  {
    id: "airtime-data",
    title: "Airtime & data",
    items: [
      { q: "Which networks are supported?", a: "MTN, Airtel, Glo and 9mobile." },
      { q: "Can I top up someone else's line?", a: "Yes, any Nigerian number. Double-check the number before confirming, because airtime sent to a valid line can't be reversed." },
      { q: "What happens if a top-up fails?", a: "If the network can't deliver, the money is returned to your Wymlink wallet." },
    ],
  },
  {
    id: "bills",
    title: "Cable TV & electricity",
    items: [
      { q: "Which providers can I pay?", a: "DStv, GOtv and StarTimes for cable TV, and all major electricity distribution companies for prepaid and postpaid meters." },
      { q: "How do I know I'm paying the right meter or decoder?", a: "We look up and show the customer name on the meter or smartcard before you pay." },
      { q: "Where's my electricity token?", a: "It's shown on screen as soon as your purchase succeeds, with a copy button." },
    ],
  },
  {
    id: "transfers",
    title: "Bank transfers",
    items: [
      { q: "Can I send money to any bank?", a: "Yes, to commercial banks, microfinance banks and most fintechs in Nigeria." },
      { q: "How do I know the account is right?", a: "We show the account name returned by the recipient's bank before you confirm." },
      { q: "What if a transfer fails?", a: "If the receiving bank rejects it, the full amount returns to your wallet." },
    ],
  },
  {
    id: "security",
    title: "Security, PIN & limits",
    items: [
      { q: "What is the transaction PIN?", a: "A 4-digit code that approves every payment and transfer. Never share it. Wymlink staff will never ask for it." },
      { q: "I forgot my PIN.", a: "Go to Security & KYC → Forgot PIN. We email a 6-digit code to reset it." },
      { q: "Why is my PIN locked?", a: "After several wrong attempts the PIN locks for a short time to protect you. Wait and try again, or reset it." },
      { q: "Why are there limits on my account?", a: "Daily limits depend on your verification level. Verify your BVN and NIN to raise them." },
    ],
  },
];

export default function FaqPage() {
  return (
    <SitePage hero>
      <PageHero title="Frequently asked questions" body="Quick answers about your account, payments and security." />
      <Container className="grid gap-10 py-16 sm:py-24 lg:grid-cols-[220px_1fr] lg:gap-16">
        <nav aria-label="FAQ topics" className="lg:sticky lg:top-28 lg:self-start">
          <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
            {GROUPS.map((g) => (
              <li key={g.id}>
                <a href={`#${g.id}`} className="block rounded-full px-3 py-2 text-[15px] font-[450] text-ink/60 transition-colors hover:bg-ink/[0.03] hover:text-ink">
                  {g.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-col gap-14">
          {GROUPS.map((g) => (
            <section key={g.id} id={g.id} className="scroll-mt-28">
              <h2 className="mb-2 text-[28px] font-medium tracking-[-0.8px] text-ink sm:text-[32px]">{g.title}</h2>
              <FaqList items={g.items} />
            </section>
          ))}
          <p className="text-ink-soft">
            Still stuck?{" "}
            <Link href="/contact" className="font-semibold text-brand-600 hover:underline">
              Contact us
            </Link>
            .
          </p>
        </div>
      </Container>
    </SitePage>
  );
}
