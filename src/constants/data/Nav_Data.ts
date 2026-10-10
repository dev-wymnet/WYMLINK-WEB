import Airtime_Icon from "../../assets/svgs/Airtime_Icon";
import Blog_Icon from "../../assets/svgs/Blog_Icon";
import Cable_Icon from "../../assets/svgs/Cable_Icon";
import Contact_Icon from "../../assets/svgs/Contact_Icon";
import FAQ_Icon from "../../assets/svgs/FAQ_Icon";
import Local_Transfer_Icon from "../../assets/svgs/Local_Transfer_Icon";
import Power_Icon from "../../assets/svgs/Power_Icon";
import ROUTES from "../routes";

export const PAYMENT = [
  {
    title: "Bill Payment",
    subList: [
      { href: ROUTES.AIRTIME, name: "Airtime", image: Airtime_Icon },
      {
        href: ROUTES.POWER,
        name: "Buy Power",
        image: Power_Icon,
      },
      { href: ROUTES.CABLE, name: "Cable TV", image: Cable_Icon },
    ],
  },
  {
    title: "Account & Services",
    subList: [
      {
        href: ROUTES.TRANSFER,
        name: "Send Money",
        image: Local_Transfer_Icon,
      }
    ],
  }
];

export const HELP = [
  {
    subList: [
      {
        href: "/blog",
        name: " Blog",
        image: Blog_Icon,
      },
      { href: ROUTES.FAQ, name: " FAQ", image: FAQ_Icon },
      {
        href: ROUTES.CONTACT,
        name: " Contact Us",
        image: Contact_Icon,
      },
      {
        href: ROUTES.CONTACT,
        name: " Knowledge Base",
        image: FAQ_Icon,
      },
    ],
  },
];

export const REWARD = [
  {
    subList: [],
  },
];
