import type { Metadata } from "next";
import { IcEye, IcHandshake, IcShieldCheck, IcSparkles, IcTarget, IcUsers } from "@/components/app/icons";
import { Container, CtaBand, CtaLink, FeatureGrid, PageHero, Panel, Section, SitePage } from "@/components/site/blocks";
import { WidePhoto } from "@/components/site/people";

export const metadata: Metadata = {
  title: "About us",
  description: "Wymlink is WymNet Global's wallet for paying bills and moving money in Nigeria.",
};

const PURPOSE = [
  {
    icon: IcTarget,
    title: "Our mission",
    body: "To make paying for the essentials quick, safe and predictable, so a failed top-up or a missing token never ruins anyone's day.",
  },
  {
    icon: IcEye,
    title: "Our vision",
    body: "A single trusted wallet for every household bill in Nigeria, simple enough for anyone to use and secure enough for everyone to trust.",
  },
];

export default function AboutPage() {
  return (
    <SitePage hero>
      <PageHero
        title="Everyday payments, made simple."
        body="Wymlink is a wallet by WymNet Global for the payments Nigerians make every week: airtime, data, TV, electricity and bank transfers, in one place and protected by your own PIN."
        actions={<CtaLink href="/auth/signup">Open an account</CtaLink>}
      />

      <WidePhoto title="Bringing easy payments to everyone." photo={{ src: "/assets/people/street-market.webp", alt: "A busy street market in Nigeria" }} />

      <Panel tone="outline" className="py-14 sm:py-20">
        <Container>
          <div className="grid gap-12 md:grid-cols-2 md:gap-16">
            {PURPOSE.map(({ icon: Icon, title, body }) => (
              <div key={title}>
                <Icon className="text-[32px] text-brand-600" />
                <h2 className="mt-6 text-3xl font-semibold tracking-[-0.035em] text-ink">{title}</h2>
                <p className="mt-3 text-lg leading-relaxed text-ink-soft">{body}</p>
              </div>
            ))}
          </div>
        </Container>
      </Panel>

      <Section tone="trust" title="How we build Wymlink">
        <FeatureGrid
          columns={4}
          items={[
            { icon: IcShieldCheck, title: "Security first", body: "Every payment needs your PIN, every account is verified, and every naira is recorded." },
            { icon: IcSparkles, title: "Simple by default", body: "Fewer steps, plain language, and clear confirmations before money moves." },
            { icon: IcHandshake, title: "Honest with customers", body: "Clear prices, real-time status and refunds when a provider fails." },
            { icon: IcUsers, title: "Built for Nigeria", body: "Local networks, DisCos, cable providers and banks, done properly." },
          ]}
        />
      </Section>

      <CtaBand photo={{ src: "/assets/people/trader-smile.webp", alt: "A smiling trader in his shop" }} />
    </SitePage>
  );
}
