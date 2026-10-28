import { Container, CtaLink, Panel, SitePage } from "@/components/site/blocks";

export default function NotFound() {
  return (
    <SitePage>
      <Panel tone="tint" className="py-24 sm:py-32">
        <Container className="flex flex-col items-center gap-4 text-center">
          <p className="text-8xl font-semibold tracking-[-0.05em] text-brand-600">404</p>
          <h1 className="text-3xl font-semibold tracking-[-0.035em] text-ink sm:text-4xl">We can&apos;t find that page.</h1>
          <p className="text-lg text-ink-soft">It may have moved, or the link might be mistyped.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <CtaLink href="/">Go to home</CtaLink>
            <CtaLink href="/dashboard" variant="soft">
              Open dashboard
            </CtaLink>
          </div>
        </Container>
      </Panel>
    </SitePage>
  );
}
