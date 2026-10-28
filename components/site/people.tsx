import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { IcArrowRight } from "@/components/app/icons";
import { Container, Heading } from "@/components/site/blocks";
import { cx } from "@/lib/cx";

// Photos of people (CC0, nappy.co; sources in public/assets/people/photos.json).
// `focus` is a CSS object-position, for photos whose subject is off-centre.
type Photo = { src: string; alt: string; focus?: string };

// Tilted, overlapping photo cards on a white card (the reference's careers collage).
const SPOTS = [
  "left-[2%] top-[14%] w-[27%] -rotate-[8deg] z-10",
  "left-[19%] top-[34%] w-[23%] rotate-[5deg] z-20",
  "left-[37%] top-[6%] w-[25%] -rotate-[2deg] z-30",
  "left-[56%] top-[30%] w-[23%] rotate-[7deg] z-20",
  "left-[71%] top-[10%] w-[27%] -rotate-[6deg] z-10",
];

export function PhotoCollage({ photos, className }: { photos: Photo[]; className?: string }) {
  return (
    <div className={cx("relative overflow-hidden rounded-[32px] bg-white shadow-[0_0_0_1px_rgb(11_18_32/0.05)]", className)}>
      <div className="relative mx-auto aspect-[986/420] max-w-[986px]">
        {photos.slice(0, 5).map((p, i) => (
          <div key={p.src} className={cx("absolute aspect-[4/3] overflow-hidden rounded-[14px] shadow-[0_18px_40px_-18px_rgb(11_18_32/0.45)] ring-4 ring-white sm:rounded-[18px] sm:ring-[6px]", SPOTS[i])}>
            <Image src={p.src} alt={p.alt} fill sizes="(min-width: 1080px) 270px, 28vw" className="object-cover" style={{ objectPosition: p.focus }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// A short statement on the left, a paragraph on the right.
export function Statement({ title, children, className }: { title: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cx("grid gap-6 md:grid-cols-[0.9fr_1.1fr] md:gap-12", className)}>
      <Heading>{title}</Heading>
      <div className="text-[17px] leading-[1.55] tracking-[-0.17px] text-ink/70 sm:text-lg">{children}</div>
    </div>
  );
}

// Photo cards with a title and a line of text (the reference's news cards).
export function StoryCards({ items }: { items: Array<Photo & { title: string; body: string; href: string }> }) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((s) => (
        <li key={s.title}>
          <Link href={s.href} className="group flex flex-col">
            <span className="relative aspect-[16/11] overflow-hidden rounded-[20px] shadow-[0_0_0_1px_rgb(11_18_32/0.05)]">
              <Image src={s.src} alt={s.alt} fill sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
            </span>
            <span className="mt-5 text-xl font-[450] leading-[1.35] tracking-[-0.2px] text-ink">{s.title}</span>
            <span className="mt-2 text-base leading-[1.45] tracking-[-0.16px] text-ink/60">{s.body}</span>
            <span className="mt-4 inline-flex items-center gap-2 text-[15px] font-[450] text-brand-500">
              Learn more
              <span className="grid size-5 place-items-center rounded-full bg-brand-500/10 text-xs transition-transform group-hover:translate-x-0.5">
                <IcArrowRight />
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

// A wide rounded photo under a left-aligned heading (the reference's about page).
export function WidePhoto({ title, photo, priority }: { title?: ReactNode; photo: Photo; priority?: boolean }) {
  return (
    <section className="px-5 py-16 sm:px-12 sm:py-24">
      <Container className="flex flex-col gap-10">
        {title && (
          <h2 className="max-w-[560px] text-balance text-[32px] font-medium leading-[1.2] tracking-[-0.8px] text-ink sm:text-[40px] sm:tracking-[-1.2px]">{title}</h2>
        )}
        <div className="relative aspect-[16/8] overflow-hidden rounded-[24px] shadow-[0_0_0_1px_rgb(11_18_32/0.05)] sm:rounded-[32px]">
          <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1080px) 986px, 100vw" className="object-cover" priority={priority} />
        </div>
      </Container>
    </section>
  );
}
