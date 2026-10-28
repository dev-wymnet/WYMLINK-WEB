import {
  IcArrowUpRight,
  IcCardReceive,
  IcCircleHelp,
  IcDocument,
  IcKeyRound,
  IcLifeBuoy,
  IcLock,
  IcMail,
  IcMonitor,
  IcReceipt,
  IcShieldCheck,
  IcAcademic,
  IcSmartphone,
  IcTv,
  IcUsers,
  IcZap,
} from "@/components/app/icons";

type Icon = React.ComponentType<{ className?: string }>;

// Shared by the header (client) and server-rendered pages/footer.
export const SERVICES = [
  { href: "/services/telecom", label: "Airtime & data", body: "Every Nigerian network, instantly.", icon: IcSmartphone },
  { href: "/services/cable", label: "Cable TV", body: "DStv, GOtv and StarTimes.", icon: IcTv },
  { href: "/services/electricity-payment", label: "Electricity", body: "Prepaid tokens and postpaid bills.", icon: IcZap },
  { href: "/services/bank-transfer", label: "Bank transfers", body: "Send money to any Nigerian bank.", icon: IcArrowUpRight },
];

export const CONTACT = {
  email: "info@wymnet.org",
  phone: "+234 707 594 9707",
  phoneHref: "tel:+2347075949707",
};

// Header mega-menu. "app" items show the Wymlink app icon instead of a line icon.
export type MenuItem = { href: string; title: string; body: string; icon: Icon | "app" };
export const MENUS: Array<{ label: string; items: MenuItem[] }> = [
  {
    label: "Products",
    items: [
      { href: "/auth/signup", title: "Wymlink App", body: "Bills and transfers on your phone", icon: "app" },
      { href: "/dashboard", title: "Web dashboard", body: "Your wallet in any browser", icon: IcMonitor },
      { href: "/training/ai-workflow-automation", title: "Training", body: "Courses from WymNet Global", icon: IcAcademic },
    ],
  },
  {
    label: "Services",
    items: [
      ...SERVICES.map((s) => ({ href: s.href, title: s.label, body: s.body, icon: s.icon })),
      { href: "/dashboard/fund", title: "Add money", body: "Your own account number", icon: IcCardReceive },
      { href: "/dashboard/transactions", title: "Receipts", body: "Every transaction, recorded", icon: IcReceipt },
    ],
  },
  {
    label: "Resources",
    items: [
      { href: "/blog", title: "Blog", body: "News and updates", icon: IcDocument },
      { href: "/faq", title: "FAQs", body: "Answers to common questions", icon: IcCircleHelp },
      { href: "/contact", title: "Help & Support", body: "Talk to the Wymlink team", icon: IcLifeBuoy },
      { href: "/faq#security", title: "Security", body: "How we keep your money safe", icon: IcShieldCheck },
      { href: "/privacy-policy", title: "Privacy", body: "How we handle your data", icon: IcLock },
      { href: "/auth/forgot", title: "Reset password", body: "Get back into your account", icon: IcKeyRound },
    ],
  },
  {
    label: "About",
    items: [
      { href: "/about", title: "About Wymlink", body: "Who we are and what we build", icon: IcUsers },
      { href: "/contact", title: "Contact", body: "Email or call the team", icon: IcMail },
    ],
  },
];

// Footer columns.
export const FOOTER: Array<{ title: string; links: Array<{ href: string; label: string; icon?: "app" | "web" }> }> = [
  {
    title: "Products",
    links: [
      { href: "/auth/signup", label: "Wymlink App", icon: "app" },
      { href: "/dashboard", label: "Web dashboard", icon: "web" },
    ],
  },
  { title: "Services", links: SERVICES.map((s) => ({ href: s.href, label: s.label })) },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About us" },
      { href: "/contact", label: "Contact" },
      { href: "/training/ai-workflow-automation", label: "Training" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/blog", label: "Blog" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Help & Support" },
      { href: "/faq#security", label: "Security" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/auth/signup", label: "Create an account" },
      { href: "/auth/login", label: "Sign in" },
      { href: "/auth/forgot", label: "Reset password" },
    ],
  },
  { title: "Legal & Privacy", links: [{ href: "/privacy-policy", label: "Privacy Policy" }] },
];
