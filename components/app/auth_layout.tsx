import Image from "next/image";
import type { ReactNode } from "react";
import { AppIcon, Brand } from "@/components/app/brand";
import { Accent } from "@/components/site/blocks";

type Photo = { src: string; alt: string; focus?: string };
const DEFAULT_PHOTO: Photo = { src: "/assets/people/woman-call.webp", alt: "A woman laughing on a phone call", focus: "35% 50%" };

// Sign in, sign up and password reset: the form on the left; on large screens a full-height
// photo of people with the Wymlink message on a frosted card.
export function AuthLayout({ title, subtitle, children, footer, photo = DEFAULT_PHOTO }: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode; photo?: Photo }) {
  return (
    <div className="grid min-h-screen gap-6 bg-white p-1.5 sm:p-6 lg:grid-cols-2">
      <main className="flex flex-col px-4 pb-4 pt-4 sm:px-8">
        <Brand />
        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-12">
          <h1 className="text-balance text-[40px] font-[550] leading-[1.1] tracking-[calc(0.05em_-_1.6px)] text-ink/90 sm:text-[48px] sm:tracking-[calc(0.05em_-_2px)]">{title}</h1>
          {subtitle && <p className="mt-3 text-[17px] leading-[1.36] tracking-[calc(0.05em_-_0.2px)] text-ink/65 sm:text-xl">{subtitle}</p>}
          <div className="mt-10">{children}</div>
          {footer && <div className="mt-10 text-center text-[15px] text-ink/65">{footer}</div>}
        </div>
        <p className="text-center text-xs text-ink/35 lg:text-left">© {new Date().getFullYear()} WymNet Global</p>
      </main>

      <aside className="relative hidden overflow-hidden rounded-[32px] lg:block">
        <Image src={photo.src} alt={photo.alt} fill priority sizes="50vw" className="object-cover" style={{ objectPosition: photo.focus }} />
        <div className="absolute inset-x-6 bottom-6 rounded-[24px] bg-white/85 p-7 shadow-[0_20px_50px_-20px_rgb(11_18_32/0.45)] backdrop-blur-xl">
          <p className="inline-flex items-center gap-2.5 text-[15px] font-[450] text-ink/70">
            <AppIcon size={26} className="rounded-[8px]" /> Wymlink App
          </p>
          <h2 className="mt-3 text-balance text-[40px] font-[550] leading-[1.08] tracking-[calc(0.05em_-_1.6px)] text-ink/90">
            Linked to <Accent>everything</Accent>
          </h2>
          <p className="mt-2 max-w-md text-[17px] leading-[1.4] tracking-[calc(0.05em_-_0.17px)] text-ink/65">Airtime, data, TV, electricity and transfers to any bank, approved with your own PIN.</p>
        </div>
      </aside>
    </div>
  );
}
