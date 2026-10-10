import Hero_Layout from "../../components/Hero_Layout";
import Nav_Bar from "../../components/layout/Nav_bar";
import Cashback_Hero from "./cashback_view_components/Cashback_Hero";
import GetInTouch from "../../components/GetInTouch";
import FAQ from "../../components/FAQ";
import Bottom_Banner from "./cashback_view_components/Bottom_Banner";
import Simple_Flex_Items from "../../components/Simple_Flex_Items";
import { CashbackBg, CashbackWoman } from "../../assets";
import Three_Cards_Section from "./cashback_view_components/Three_Cards_Section";
import appName from "../../constants/data/App_Name";
import { useRouter } from "next/navigation";

const Cashback_View = () => {
  const frequentQuestions = [
    {
      title: "What does cashback mean?",
      content: `The ${appName} cash-back offer allows you to earn some money back each time you spend on a bill payment. We’ll give you back 2% of the total value of your bill payment to help reduce the cost of your bill payments.`,
    },
    {
      title: `What rewards do you offer for using ${appName}?`,
      content:
        "In addition to 2% cash back on each utility bill payment, we offer a sign-up bonus of N250 for each new user.",
    },
    {
      title: "How do I claim the 2% cash back?",
      content:
        "You don't have to claim the 2% cash-back on your bill payments. This sum will be credited to your account immediately.",
    },
  ];
  const router = useRouter();
  const handleClick = () => {
    router.push("/auth/login");
  };
  return (
    <>
      <Nav_Bar
        bgColor={"bg-[#753FF6]"}
        logoColor={"white"}
        linkColor={"text-white"}
        linkDColor={"text-white"}
      />
      <Hero_Layout
        sectionClassName={"bg-[#753FF6]"}
        lower="yes"
        bgImage={CashbackBg}
        cash="-bottom-[8%] xl:-bottom-[12%] m3xl:-bottom-[15%] right-0"
      >
        <Cashback_Hero />
      </Hero_Layout>
      <section className="xmd:text-center xmd:mt-16 w-[95%] max-w-screen-2lg 3xl:max-w-xlg mx-auto">
        <h2 className="xmd:w-[70%] mx-auto font-[500] xmd:leading-[52px] xmd:text-[52px] text-3xl max-xmd:pt-[30px] font-aeonik mb-4">
          Unlocking Earnings with Every Transaction
        </h2>
        <p className="text-lg leading-normal pt-6xmd: xmd:w-[70%] mx-auto text-[344054]">
          Download the app now and get N250 in your ${appName} wallet as a
          welcome gift! Plus, earn 2% cashback on all utility bill payments made
          through ${appName}.
        </p>
      </section>
      <Simple_Flex_Items
        img={{
          img: CashbackWoman,
          imgPosition: "left",
        }}
        bgColor={"bg-transparent"}
        title={`Introducing ${appName} Cashback`}
        details={`${appName} Cashback is our exclusive rewards program designed to make your financial transactions even more rewarding. With ${appName} Cashback, you earn 2% cashback on every bill payment and transaction made through the ${appName} app.`}
        details2={`This means that every time you pay bills  using the app, you automatically accumulate cashback rewards, providing you with a tangible incentive for managing your finances through ${appName}.`}
        btn={{
          btnStyles:
            "text-white bg-[#0a40ed] w-[190px] max-md:px-10 py-[17px] rounded-[4px] font-[300] text-center",
          btnText: "Start Paying Bills",
          btnBgColor: undefined,
        }}
        btnAction={handleClick}
      />

      <Three_Cards_Section
        styles={{
          bg: "bg-[#F9FAFE]",
          card: "bg-[#EEFFDE]",
        }}
        title={"Bonus Rewards: Enhancing Your earning Journey Further"}
        data={[
          {
            title: "Automatic Rewards",
            details: `No need to sign up or enroll – every transaction through the ${appName} app earns you 2% cashback automatically.`,
          },
          {
            title: "Unlimited Earnings",
            details: `There's no cap on how much cashback you can earn. The more you use ${appName}, the more you save.`,
          },
          {
            title: "Instant Redemption",
            details: `Redeem your cashback at any time, directly from the app, for added flexibility and convenience`,
          },
        ]}
        subText={`Does the idea of financial independence appeal to you? Become a ${appName} executive agent to earn a generous income. We’ll pay you a monthly stipend along with N5 every single time your referrals use the app to pay a bill.`}
      />

      <FAQ
        title={"Cashback & Bonus FAQs"}
        description={
          "Everything you need to know about the cashback and bonuses"
        }
        questions={frequentQuestions}
      />
      <GetInTouch />
      <Bottom_Banner
        sectionColor={{
          container: "bg-[#753FF6]",
        }}
        title={`Join ${appName} Today`}
        subText={`Start earning 2% cashback on your bill payments and transactions today. Download the ${appName} app now and experience the convenience and rewards of ${appName} Cashback firsthand`}
      />
    </>
  );
};

export default Cashback_View;
