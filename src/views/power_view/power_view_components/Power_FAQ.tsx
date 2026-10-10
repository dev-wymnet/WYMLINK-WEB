import FAQ from "../../../components/FAQ";
import appName from "../../../constants/data/App_Name";

interface Question {
  title: string;
  content: string;
}
const frequentQuestions: Question[] = [
  {
    title: `How do I buy electricity units on ${appName}?`,
    content: `Open the ${appName} app, select “Electricity,” enter your meter number, choose your DISCO (electricity provider), input the amount, and complete your payment in seconds.`,
  },
  {
    title: `What electricity providers are supported on ${appName}?`,
    content: `${appName} supports all major electricity distribution companies (DISCOs) in Nigeria, including IKEDC, EKEDC, AEDC, PHED, and more.`,
  },
  {
    title: `How much does it cost to buy electricity on ${appName}?`,
    content: `You only pay for the units you purchase. ${appName} does not charge any extra or hidden fees for electricity token purchases.`,
  },
  {
    title: `How quickly are electricity tokens delivered?`,
    content: `Electricity tokens are generated and delivered instantly after a successful payment. You can view your token immediately in the app or via SMS/email.`,
  },
  {
    title: `Can I buy electricity for someone else using the app?`,
    content: `Yes, you can recharge any prepaid meter as long as you have the correct meter number and distribution company selected.`,
  },
];

const Power_FAQ = () => {
  return (
    <FAQ
      title="Buy Electricity FAQ"
      description="Everything you need to know about purchasing electricity units"
      questions={frequentQuestions}
    />
  );
};

export default Power_FAQ;
