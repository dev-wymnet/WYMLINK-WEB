import type { Metadata } from "next";
import { IcBadgeCheck, IcBuilding2, IcClock, IcKeyRound, IcListChecks, IcReceipt } from "@/components/app/icons";
import { PhoneRise } from "@/components/site/blocks";
import { ServicePage } from "@/components/site/service_page";

export const metadata: Metadata = {
  title: "Bank transfers",
  description: "Send money from your Wymlink wallet to any Nigerian bank account.",
};

export default function TransferPage() {
  return (
    <ServicePage
      photo={{ src: "/assets/people/hands-phone.webp", alt: "Hands holding a phone" }}
      eyebrow="Bank transfers"
      icon={IcBuilding2}
      title="Send money to any Nigerian bank"
      body="Pay a friend, a supplier or yourself. We confirm the account name before you send, and track the transfer until it lands."
      buyHref="/dashboard/transfer"
      buyLabel="Send money"
      aside={<PhoneRise src="/assets/app/receipt-transfer.webp" alt="A completed Wymlink transfer to Zenith Bank" priority />}
      steps={[
        { title: "Choose the bank", body: "Search hundreds of Nigerian banks and microfinance banks." },
        { title: "Enter the account number", body: "We look up the account name so you can check it before sending." },
        { title: "Confirm with your PIN", body: "We track the transfer and show you when it's delivered." },
      ]}
      features={[
        { icon: IcBuilding2, title: "Every Nigerian bank", body: "Commercial banks, microfinance banks and fintechs." },
        { icon: IcBadgeCheck, title: "Name check first", body: "The recipient's name is confirmed by their bank before you pay." },
        { icon: IcKeyRound, title: "PIN-protected", body: "No transfer leaves your wallet without your transaction PIN." },
        { icon: IcClock, title: "Live status", body: "Follow the transfer from 'on its way' to 'delivered'." },
        { icon: IcListChecks, title: "Limits that protect you", body: "Daily limits grow as you verify your identity." },
        { icon: IcReceipt, title: "Receipts with references", body: "Share the reference if the recipient needs proof." },
      ]}
      faq={[
        { q: "How long does a transfer take?", a: "Most transfers land within a minute. Occasionally a bank delays it; the status on your receipt updates automatically." },
        { q: "What if the transfer fails?", a: "If the receiving bank rejects it, the full amount returns to your Wymlink wallet." },
        { q: "How much can I send?", a: "It depends on your verification level. Verify your BVN and NIN in Security & KYC to raise your daily limit." },
      ]}
    />
  );
}
