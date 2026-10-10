import ROUTES from "../routes";
export const FooterTopData = [
  {
    width: 10,
    title: "Pay Bills",
    listItems: [
      {
        href: ROUTES.AIRTIME,
        name: "Buy Airtime",
      },
      {
        href: ROUTES.POWER,
        name: "Buy Power",
      },
      {
        href: ROUTES.CABLE,
        name: "Cable TV",
      },
      {
        href: ROUTES.AIRTIME,
        name: "Buy Internet Data",
      },
    ],
  },
  {
    width: 10,
    title: "Transfer & Spend",
    listItems: [
      {
        href: ROUTES.TRANSFER,
        name: "Send Money",
      },
    ],
  },
  {
    width: 10,
    title: "Company",
    listItems: [
      {
        href: ROUTES.ABOUT,
        name: "About Us",
      },
      {
        href: ROUTES.CONTACT,
        name: "Contact Us",
      },
      {
        href: "/blog",
        name: "Blog",
      },
    ],
  },
  {
    width: 10,
    title: "Help",
    listItems: [
      {
        href: ROUTES.CONTACT,
        name: "Get Help",
      },
      {
        href: ROUTES.FAQ,
        name: "FAQs",
      },
      {
        href: ROUTES.CONTACT,
        name: "Knowledge Base",
      },
    ],
  },
  {
    width: 15,
    title: "Legal",
    listItems: [
      {
        href: ROUTES.TERMS,
        name: "Terms",
      },
      {
        href: ROUTES.PRIVACY,
        name: "Privacy",
      },
      {
        href: ROUTES.AML,
        name: "Anti Money Laundering",
      },
      {
        href: ROUTES.RISK,
        name: "Risk Disclosure",
      },
    ],
  },
];
