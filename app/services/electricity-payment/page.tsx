import type { Metadata } from "next";
import { IcBadgeCheck, IcBuilding2, IcClock, IcReceipt, IcRefreshCw, IcZap } from "@/components/app/icons";
import { PhoneRise } from "@/components/site/blocks";
import { ServicePage } from "@/components/site/service_page";

export const metadata: Metadata = {
  title: "Pay for electricity",
  description: "Buy prepaid electricity tokens and pay postpaid bills for every Nigerian DisCo from your Wymlink wallet.",
};

export default function ElectricityPage() {
  return (
    <ServicePage
      photo={{ src: "/assets/people/family.webp", alt: "A family of six sitting together on steps" }}
      eyebrow="Electricity"
      icon={IcZap}
      title="Keep the lights on"
      body="Buy prepaid tokens or settle postpaid bills for every major distribution company (DisCo). We confirm the meter owner before you pay."
      buyHref="/dashboard/bills/electricity"
      buyLabel="Buy electricity"
      aside={<PhoneRise src="/assets/app/electricity.webp" alt="Buying electricity in Wymlink: DisCo, meter number and amount" priority />}
      steps={[
        { title: "Choose your DisCo and meter type", body: "Prepaid or postpaid, for all major distribution companies." },
        { title: "Enter your meter number", body: "We show the name on the meter so you know it's the right one." },
        { title: "Enter an amount and confirm", body: "Approve with your PIN. Your prepaid token appears on screen straight away." },
      ]}
      features={[
        { icon: IcBuilding2, title: "Every major DisCo", body: "Ikeja, Eko, Abuja, Ibadan, Port Harcourt, Kano, Enugu and more." },
        { icon: IcBadgeCheck, title: "Meter check first", body: "See the meter owner's name before you pay." },
        { icon: IcZap, title: "Prepaid and postpaid", body: "Buy tokens or pay your monthly bill." },
        { icon: IcReceipt, title: "Token on screen", body: "Your token is shown the moment you pay, ready to copy with one tap." },
        { icon: IcClock, title: "Day or night", body: "Buy power at 2 a.m. when the units run out." },
        { icon: IcRefreshCw, title: "Refund if it fails", body: "If the DisCo can't complete the purchase, the money returns to your wallet." },
      ]}
      faq={[
        { q: "How do I load my token?", a: "Type the 20-digit token into your meter's keypad and press Enter (or #). Each token works once, on the meter it was bought for." },
        { q: "What's the minimum purchase?", a: "It depends on your DisCo, usually ₦1,000. The minimum is shown on the payment screen." },
        { q: "I bought for the wrong meter.", a: "Tokens are tied to the meter number entered, so check the name we show before confirming. Contact us with your reference and we'll help where the DisCo allows." },
      ]}
    />
  );
}
