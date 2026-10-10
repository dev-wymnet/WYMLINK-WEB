import appName from "./App_Name";
import ROUTES from "../routes";

export const PAYMENT = [
  {
    title: "Bill Payment",
    subList: [
      { href: ROUTES.AIRTIME, name: "Airtime", image: "/icons/Aitime.svg" },
      {
        href: ROUTES.POWER,
        name: "Buy Power",
        image: "/icons/ELECTRICITY.svg",
      },
      { href: ROUTES.CABLE, name: "Cable TV", image: "/icons/TV.svg" },
    ],
  },
  {
    title: "Account & Services",
    subList: [
      {
        href: ROUTES.TRANSFER,
        name: "Transfer Money",
        image: "/icons/transferIcon.svg",
      },
    ],
  },
];

export const HELP = [
  {
    subList: [
      {
        href: `/blog`,
        name: " Blog",
        image: "/images/blog.svg",
      },
      { href: "/faq", name: " FAQ", image: "/images/FAQ.svg" },
      {
        href: ROUTES.CONTACT,
        name: " Contact Us",
        image: "/images/contact.svg",
      },
      {
        href: ROUTES.CONTACT,
        name: " Knowledge Base",
        image: "/images/FAQ.svg",
      },
    ],
  },
];

export const REWARD = [
  {
    subList: [],
  },
];

export const LIST = [
  {
    title: "AIRTIME & DATA",
    button: [
      {
        head: `How do I buy airtime and data on ${appName}?`,
        subList: [
          {
            text: `Simply log into ${appName} and click on the Pay Bills button.`,
          },
        ],
      },
      {
        head: "What networks can I buy airtime or data on?",
        subList: [
          {
            text: "You can buy data and airtime from Glo, MTN, Airtel,  9Mobile, Spectranet, Smile Network and others.",
          },
        ],
      },
      {
        head: `How much does it cost to buy airtime or data on ${appName}?`,
        subList: [
          {
            text: `There are no additional charges for buying data or airtime from ${appName}. ${appName} is the most affordable way to top up your data or airtime in Nigeria.`,
          },
        ],
      },
      {
        head: "How quickly are airtime and data purchases processed?",
        subList: [
          {
            text: `Airtime and data purchases are instant on ${appName}.`,
          },
        ],
      },
      {
        head: "Can I purchase airtime or data for someone else using the app?",
        subList: [
          {
            text: `Yes! With ${appName}, you can easily buy data or airtime for yourself or for others.`,
          },
        ],
      },
    ],
  },
  {
    title: "CASHBACK",
    button: [
      {
        head: "What does cashback mean?",
        subList: [
          {
            text: `The ${appName} cash-back offer allows you to earn some money back each time you spend on a bill payment. We’ll give you back 2% of the total value of your bill payment to help reduce the cost of your bill payments. `,
          },
        ],
      },
      {
        head: `What rewards do you offer for using ${appName}?`,
        subList: [
          {
            text: "In addition to 2% cash back on each utility bill payment, we offer a sign-up bonus of N250 for each new user.",
          },
        ],
      },
      {
        head: "How do I claim the 2% cash back?",
        subList: [
          {
            text: "You don’t have to claim the 2% cash-back on your bill payments. This sum will be credited to your account immediately.",
          },
        ],
      },
    ],
  },
  {
    title: "ELECTRICITY",
    button: [
      {
        head: `How do I buy electricity top-ups on ${appName}?`,
        subList: [
          {
            text: "All you have to do is download and log into the app, click on the Pay Bills section, select the Electricity Top Up button and choose your electricity provider. ",
          },
        ],
      },
      {
        head: "What payment methods can I use for purchasing electricity units on the app?",
        subList: [
          {
            text: "You can buy electricity units directly from the app. Simply login and navigate to the Pay Bills section, then click Electricity Top-up and choose your electricity provider.",
          },
        ],
      },
      {
        head: "How much does it cost to purchase electricity units on the app?",
        subList: [
          {
            text: `There are no charges for purchasing electricity units on ${appName}. In fact, we’ll give you back 2% of the total value of any electricity top-up that you make using the app.`,
          },
        ],
      },
      {
        head: "Is there a limit to how much electricity I can buy on the app?",
        subList: [
          {
            text: `No, there is no limit to how much electricity you can buy on ${appName}.`,
          },
        ],
      },
      {
        head: `What electricity providers does ${appName} support?`,
        subList: [
          {
            text: `${appName} supports major electricity providers in Nigeria including IKEDC IKEJA ELECTRICITY, EKEDC EKO ELECTRICITY, KEDCO EKO ELECTRICITY, PHED PORT HARCOURT ELECTRICITY, JED JOS ELECTRICITY, IBEDC IBADAN ELECTRICITY, KAEDCO KADUNA ELECTRICITY, AEDC ABUJA ELECTRICITY.`,
          },
        ],
      },
    ],
  },
  {
    title: "CABLE TV",
    button: [
      {
        head: "Which Cable TV networks do you support?",
        subList: [
          {
            text: `With ${appName}, you can renew your subscription on DStv, GOtv, and Startimes.`,
          },
        ],
      },
      {
        head: `What payment methods can I use to renew my cable TV subscription?`,
        subList: [
          {
            text: `You can easily renew your DStv, GOtv, or Startimes subscription directly from the app. Just fund your ${appName} wallet, then pay your cable TV bill.`,
          },
        ],
      },
      {
        head: "How do I subscribe to Cable TV using the app?",
        subList: [
          {
            text: `Open the ${appName} app, tap Pay Bills, select Cable TV, choose your provider, enter your smartcard or IUC number, pick a package, and confirm your payment.`,
          },
        ],
      },
      {
        head: "Are there any extra fees for subscribing to cable TV?",
        subList: [
          {
            text: "There are no fees for renewing your cable TV subscription! Instead, we’ll give you back 2% of the total value of each transaction when you pay your cable TV and other bills on the app.",
          },
        ],
      },
      {
        head: `Do I get any rewards for paying Cable TV subscription on ${appName}?`,
        subList: [
          {
            text: "Yes! We give you 2% cashback on the total value of any bill you pay using the app, including your cable TV bills. ",
          },
        ],
      },
    ],
  },
  {
    title: `REFER AND EARN`,
    button: [
      {
        head: `What is ${appName}'s Refer and Earn Program?`,
        subList: [
          {
            text: "The Refer and Earn Program is a rewarding initiative that allows our users to earn rewards for signing up and for referring others to use the app.",
          },
        ],
      },
      {
        head: `How does ${appName} pay me when I pay?`,
        subList: [
          {
            text: `When you pay any utility bill using the app, we pay you back 2% of the total value of your payment. `,
          },
        ],
      },
      {
        head: `What incentives are there for ${appName} executive agents?`,
        subList: [
          {
            text: `${appName} executive agents earn a monthly stipend along with 5 naira for every utility bill payment made by referrals who use the app.`,
          },
        ],
      },
      {
        head: `How can I become a ${appName} executive agent?`,
        subList: [
          {
            text: `Anyone can become a ${appName} executive agent, however, we accept applications for ${appName} executive agent positions from time to time. We will advertise the qualifications and requirements when we do.`,
          },
        ],
      },
    ],
  },
  {
    title: "MONEY TRANSFER",
    button: [
      {
        head: `How does ${appName}'s money transfer feature work?`,
        subList: [
          {
            text: `Fund your ${appName} wallet, enter the recipient's Nigerian bank account details, confirm the account name, and hit send — the money arrives in seconds.`,
          },
        ],
      },
      {
        head: `Can I receive money with ${appName}?`,
        subList: [
          {
            text: `Yes. Your ${appName} wallet has a dedicated account number you can share to receive money from any Nigerian bank — inflows land in your wallet instantly.`,
          },
        ],
      },
      {
        head: `How much are the fees for making transfers?`,
        subList: [
          {
            text: `${appName} keeps transfer fees low and transparent — you'll always see the exact fee before confirming a transfer, with no hidden charges.`,
          },
        ],
      },
      {
        head: `How fast do recipients receive transfers?`,
        subList: [
          {
            text: `Most ${appName} transfers are delivered instantly. In rare cases, settlement may take a few minutes depending on the recipient's bank.`,
          },
        ],
      },
      {
        head: ` Is there a limit to the number of money transfers I can make with ${appName}?`,
        subList: [
          {
            text: `We do not impose a specific limit on the number of money transfers you can make.`,
          },
        ],
      },
    ],
  },
];
