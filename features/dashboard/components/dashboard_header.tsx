import { App_Text } from "@/components/ui_components/app_text";
import Link from "next/link";
import { CgProfile } from "react-icons/cg";

type DashboardHeaderProps = {
  fullName: string;
};

export const DashboardHeader = ({ fullName }: DashboardHeaderProps) => {
  const firstName = String(fullName || "").split(" ")[0] || "";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return (
    <header className="flex items-start justify-between w-full">
      <div>
        <App_Text variant="subtitle" className="text-foreground">
          {greeting}, {firstName}
        </App_Text>
        <App_Text variant="body" className="mt-1 text-secondary">
          Here&apos;s what&apos;s happening with your wallet.
        </App_Text>
      </div>
      <Link
        href="/dashboard/profile"
        aria-label="Profile"
        className="rounded-full border border-border p-2 text-secondary hover:bg-primarySoft"
      >
        <CgProfile size={22} />
      </Link>
    </header>
  );
};
