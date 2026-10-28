import type { Metadata } from "next";
import { IcArrowRight, IcCircleHelp, IcLifeBuoy, IcMail, IcPhone } from "@/components/app/icons";
import { Container, CtaLink, PageHero, Panel, SitePage } from "@/components/site/blocks";
import { CONTACT } from "@/components/site/content";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Get help with your Wymlink account, payments and transfers.",
};

const CHANNELS = [
  { icon: IcMail, title: "Email", body: "For anything about your account or a transaction. Include your reference if you have one.", action: CONTACT.email, href: `mailto:${CONTACT.email}` },
  { icon: IcPhone, title: "Phone", body: "Speak to the team about urgent issues with a payment.", action: CONTACT.phone, href: CONTACT.phoneHref },
  { icon: IcLifeBuoy, title: "In-app support", body: "Signed in? Send us a message from your profile and we'll reply by email.", action: "Open support", href: "/dashboard/profile" },
];

export default function ContactPage() {
  return (
    <SitePage hero>
      <PageHero title="We're here to help." body="Questions about a payment, your account or verification? Reach us any of these ways." />
      <Panel tone="outline" className="py-14 sm:py-20">
        <Container>
          <ul className="grid gap-10 md:grid-cols-3 md:gap-12">
            {CHANNELS.map(({ icon: Icon, title, body, action, href }) => (
              <li key={title} className="flex flex-col">
                <Icon className="text-[32px] text-brand-600" />
                <h2 className="mt-6 text-2xl font-semibold tracking-[-0.03em] text-ink">{title}</h2>
                <p className="mt-2 flex-1 text-[15px] leading-relaxed text-ink-soft">{body}</p>
                <a href={href} className="mt-5 inline-flex items-center gap-1.5 font-semibold text-brand-600 hover:text-brand-700">
                  {action} <IcArrowRight aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </Panel>
      <Panel tone="tint" className="py-12 sm:py-14">
        <Container className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <IcCircleHelp className="shrink-0 text-[32px] text-brand-600" />
          <p className="flex-1 text-lg text-ink-soft">Many questions are already answered in our FAQ, from adding money to resetting your PIN.</p>
          <CtaLink href="/faq" variant="secondary">
            Read the FAQ
          </CtaLink>
        </Container>
      </Panel>
    </SitePage>
  );
}
