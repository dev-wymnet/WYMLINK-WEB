import type { Metadata } from "next";
import { IcClock, IcRefreshCw, IcSignal, IcSmartphone, IcUsers, IcWifi } from "@/components/app/icons";
import { PhoneRise } from "@/components/site/blocks";
import { ServicePage } from "@/components/site/service_page";

export const metadata: Metadata = {
  title: "Buy airtime & data",
  description: "Top up MTN, Airtel, Glo and 9mobile airtime and data bundles instantly from your Wymlink wallet.",
};

export default function TelecomPage() {
  return (
    <ServicePage
      photo={{ src: "/assets/people/young-man.webp", alt: "A young man looking at his phone" }}
      eyebrow="Airtime & data"
      icon={IcSmartphone}
      title="Top up any line in seconds"
      body="Airtime and data bundles for MTN, Airtel, Glo and 9mobile, for you or anyone else, straight from your Wymlink wallet."
      buyHref="/dashboard/airtime"
      buyLabel="Buy airtime now"
      aside={<PhoneRise src="/assets/app/airtime.webp" alt="Buying airtime in Wymlink: pick the network and amount" priority />}
      steps={[
        { title: "Enter the phone number", body: "We detect the network from the number. You can always change it." },
        { title: "Choose an amount or bundle", body: "Pick any airtime amount, or a daily, weekly or monthly data plan." },
        { title: "Confirm with your PIN", body: "Airtime and data land on the line within seconds." },
      ]}
      features={[
        { icon: IcSignal, title: "All four networks", body: "MTN, Airtel, Glo and 9mobile in one place." },
        { icon: IcWifi, title: "Clear data plans", body: "See the bundle size, validity and price before you buy." },
        { icon: IcUsers, title: "For anyone", body: "Top up family and friends: any Nigerian number works." },
        { icon: IcClock, title: "Delivered instantly", body: "Most top-ups arrive in seconds, any time of day." },
        { icon: IcRefreshCw, title: "Refund if it fails", body: "If the network can't deliver, the money returns to your wallet." },
        { icon: IcSmartphone, title: "No USSD codes", body: "No dialling, no data-plan codes to remember." },
      ]}
      faq={[
        { q: "Which networks are supported?", a: "MTN, Airtel, Glo and 9mobile, for both airtime and data." },
        { q: "What's the minimum airtime purchase?", a: "₦50. The most you can buy in one go is ₦50,000, within your account's daily limit." },
        { q: "How fast does it arrive?", a: "Usually within seconds. During network outages it can take a little longer; your transaction history shows the live status." },
        { q: "What if I typed the wrong number?", a: "Airtime sent to a valid number can't be reversed, so check the number and network on the confirmation screen before entering your PIN." },
      ]}
    />
  );
}
