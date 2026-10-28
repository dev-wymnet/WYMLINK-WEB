import type { ComponentType, ReactNode } from "react";
import { IcCircleCheck } from "@/components/app/icons";
import { CtaBand, CtaLink, FaqSection, FeatureGrid, PageHero, Section, SitePage, Steps } from "@/components/site/blocks";

// A confirmation card in the app's own style, for services without a screenshot yet.
export function ReceiptPreview({ title, lines, total, note }: { title: string; lines: Array<[string, string]>; total: string; note?: string }) {
  return (
    <div className="w-full max-w-sm rounded-[28px] bg-white p-7 text-ink shadow-[0_0_0_1px_rgb(11_18_32/0.05),0_40px_80px_-30px_rgb(15_20_40/0.35)]" aria-hidden>
      <div className="flex flex-col items-center gap-2 border-b border-dashed border-ink/10 pb-6 text-center">
        <IcCircleCheck className="text-5xl text-ok" />
        <p className="mt-1 font-medium">{title}</p>
        <p className="text-4xl font-medium tracking-[-0.03em] tabular-nums">{total}</p>
      </div>
      <dl className="mt-5 flex flex-col gap-2.5 text-sm">
        {lines.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4">
            <dt className="text-ink/55">{k}</dt>
            <dd className="text-right font-medium">{v}</dd>
          </div>
        ))}
      </dl>
      {note && <p className="mt-5 rounded-2xl bg-canvas p-3 text-center font-mono text-sm tracking-wider">{note}</p>}
    </div>
  );
}

export function ServicePage({
  eyebrow,
  icon,
  title,
  body,
  buyHref,
  buyLabel,
  aside,
  steps,
  features,
  faq,
  photo,
}: {
  eyebrow: string;
  icon?: ComponentType<{ className?: string }>;
  title: ReactNode;
  body: ReactNode;
  buyHref: string;
  buyLabel: string;
  aside: ReactNode;
  steps: Array<{ title: string; body: string }>;
  features: Array<{ icon: ComponentType<{ className?: string }>; title: string; body: string }>;
  faq: Array<{ q: string; a: ReactNode }>;
  photo?: { src: string; alt: string };
}) {
  return (
    <SitePage hero>
      <PageHero
        eyebrow={eyebrow}
        icon={icon}
        title={title}
        body={body}
        aside={aside}
        actions={
          <>
            <CtaLink href={buyHref}>{buyLabel}</CtaLink>
            <CtaLink href="/auth/signup" variant="soft">
              Create free account
            </CtaLink>
          </>
        }
      />
      <Section title="How it works">
        <Steps items={steps} />
      </Section>
      <Section tone="trust">
        <FeatureGrid items={features} />
      </Section>
      <FaqSection items={faq} />
      <CtaBand photo={photo} />
    </SitePage>
  );
}
