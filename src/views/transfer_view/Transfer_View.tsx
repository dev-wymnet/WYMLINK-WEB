import Nav_Bar from "@/src/components/layout/Nav_bar";
import Hero_Layout from "@/src/components/Hero_Layout";
import Transfer_Hero from "./transfer_view_components/Transfer_Hero";
import GetInTouch from "@/src/components/GetInTouch";
import FAQ from "@/src/components/FAQ";
import Full_Flex from "@/src/components/Full_Flex";
import { AfricanWoman, TransferBg } from "@/src/assets";
import SendMoney from "./transfer_view_components/SendMoney";
import Multiple_Payment from "./transfer_view_components/Multiple_Payment";
import Download_Footer from "@/src/components/Download_Footer";
import Send_Money_Easily from "./transfer_view_components/Send_Money_Easily";
import appName from "@/src/constants/data/App_Name";

const frequentQuestions = [
  {
    title: `How does ${appName}'s money transfer feature work?`,
    content: `Fund your ${appName} wallet, enter the recipient's Nigerian bank account details, confirm the account name, and hit send. The money lands in their account in seconds.`,
  },
  {
    title: `Can I receive money with ${appName}?`,
    content:
      `Yes. Every ${appName} wallet comes with a dedicated account number you can share to receive money from any Nigerian bank — transfers land in your wallet instantly.`,
  },
  {
    title: "How much are the fees for making transfers?",
    content: `${appName} keeps transfer fees low and transparent — you'll always see the exact fee before you confirm a transfer. No hidden charges, ever.`,
  },
  {
    title: "How fast do recipients receive transfers?",
    content:
      `Most ${appName} transfers are delivered instantly. In rare cases, settlement may take a few minutes depending on the recipient's bank.`,
  },
  {
    title: `Is there a limit to the number of money transfers I can make with ${appName}?`,
    content:
      "We do not impose a specific limit on the number of money transfers you can make.",
  },
];

const Transfer_View = () => {
  return (
    <>
      <Nav_Bar
        bgColor={"bg-[#CDF2FC]"}
        logoColor={"black"}
        linkColor={"text-black"}
        linkDColor={"text-black"}
        iconColor="text-black"
      />
      <Hero_Layout sectionClassName={"bg-[#CDF2FC]"} lower="yes" bgImage={TransferBg}>
        <Transfer_Hero />
      </Hero_Layout>
      <SendMoney />
      <Send_Money_Easily />
      <Multiple_Payment />
      <Full_Flex
        img={AfricanWoman}
        details={`Through my experience with ${appName} Money Transfer, I've seen the remarkable speed and convenience it offers. Whether sending money from ${appName} to ${appName} instantly or paying straight into any Nigerian bank account, each step is seamless.`}
        subText={{
          span: "- Teniola ",
          text: ", Send money experience.",
        }}
        btnText={"Send money now"}
        styles={{
          bg: "bg-[#00DCFE]",
          textbg: "bg-[#CDF2FC]",
        }}
      />

      <FAQ
        title={`FAQs - Local Transfers`}
        description={`Everything you need to know about ${appName} transfer`}
        questions={frequentQuestions}
      />
      <GetInTouch />
      <Download_Footer bgColor="bg-[#010525]" textColor="text-white" />
    </>
  );
};

export default Transfer_View;
