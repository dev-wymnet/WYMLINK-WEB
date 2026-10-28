import type { Metadata } from "next";
import { IcBadgeCheck, IcClock, IcRefreshCw, IcTv, IcUsers, IcListChecks } from "@/components/app/icons";
import { ReceiptPreview, ServicePage } from "@/components/site/service_page";

export const metadata: Metadata = {
  title: "Pay for cable TV",
  description: "Renew DStv, GOtv and StarTimes subscriptions instantly from your Wymlink wallet.",
};

export default function CablePage() {
  return (
    <ServicePage
      photo={{ src: "/assets/people/friends-couch.webp", alt: "Two friends on a sofa with the TV remote" }}
      eyebrow="Cable TV"
      icon={IcTv}
      title="Never miss the match again"
      body="Renew DStv, GOtv and StarTimes in seconds. We confirm the account name before you pay, so your money always reaches the right decoder."
      buyHref="/dashboard/bills/cable"
      buyLabel="Renew subscription"
      aside={
        <div className="mt-[72px] flex justify-center pb-16 sm:pb-24">
          <ReceiptPreview title="Subscription renewed" total="₦12,500.00" lines={[["Package", "DStv Compact"], ["Smartcard", "7034 •••• 21"], ["Customer", "ADEBAYO OLUWASEUN"]]} />
        </div>
      }
      steps={[
        { title: "Choose your provider", body: "DStv, GOtv or StarTimes." },
        { title: "Enter your smartcard number", body: "We look up the customer name so you can confirm it's the right decoder." },
        { title: "Pick a package and confirm", body: "Approve with your PIN and your subscription is renewed." },
      ]}
      features={[
        { icon: IcTv, title: "Three providers", body: "DStv, GOtv and StarTimes packages, with current prices." },
        { icon: IcBadgeCheck, title: "Name check first", body: "See the account name on the smartcard before any money moves." },
        { icon: IcListChecks, title: "Every package", body: "From the cheapest bouquet to Premium, listed with prices." },
        { icon: IcUsers, title: "Pay for family", body: "Renew a parent's or friend's decoder from anywhere." },
        { icon: IcClock, title: "Back on in minutes", body: "Most renewals reactivate your channels within minutes." },
        { icon: IcRefreshCw, title: "Refund if it fails", body: "If the provider rejects the payment, your money comes back to your wallet." },
      ]}
      faq={[
        { q: "Where do I find my smartcard / IUC number?", a: "It's on the sticker under or behind your decoder, and on your provider's account page." },
        { q: "My channels didn't come back on.", a: "Leave the decoder on for a few minutes on any channel. If it still doesn't work, use your provider's 'reset' or 'clear error' option, then contact us with the reference from your receipt." },
        { q: "Can I change my package here?", a: "Yes. Choose any package listed. When a change of package takes effect depends on your provider." },
      ]}
    />
  );
}
