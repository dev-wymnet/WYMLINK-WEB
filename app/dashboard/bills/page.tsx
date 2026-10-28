import Link from "next/link";
import { IcChevronRight, IcSmartphone, IcTv, IcWifi, IcZap } from "@/components/app/icons";
import { PageHeader } from "@/components/app/ui";

const SERVICES = [
  { href: "/dashboard/bills/electricity", title: "Electricity", body: "Prepaid tokens and postpaid bills for every DisCo.", icon: IcZap },
  { href: "/dashboard/bills/cable", title: "Cable TV", body: "DStv, GOtv and StarTimes subscriptions.", icon: IcTv },
  { href: "/dashboard/airtime", title: "Airtime", body: "MTN, Airtel, Glo and 9mobile.", icon: IcSmartphone },
  { href: "/dashboard/airtime?tab=data", title: "Data", body: "Daily, weekly and monthly bundles.", icon: IcWifi },
];

export default function BillsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Pay bills" subtitle="Everything paid straight from your Wymlink balance." />
      <ul className="grid gap-3 sm:grid-cols-2">
        {SERVICES.map(({ href, title, body, icon: Icon }) => (
          <li key={title}>
            <Link href={href} className="flex items-center gap-4 rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)] transition hover:border-brand-200 hover:shadow-[var(--shadow-pop)]">
              <span className="grid size-12 shrink-0 place-items-center text-4xl text-brand-600">
                <Icon aria-hidden />
              </span>
              <span className="flex-1">
                <span className="block font-semibold text-ink">{title}</span>
                <span className="block text-sm text-ink-soft">{body}</span>
              </span>
              <IcChevronRight className="text-ink-faint" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
