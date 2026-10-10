import FAQ from "../../../components/FAQ";
import appName from "../../../constants/data/App_Name";

interface Question {
  title: string;
  content: string;
}
const frequentQuestions: Question[] = [
  {
    title: `How do I pay for DStv, GOtv, or Startimes on ${appName}?`,
    content: `Open the ${appName} app, go to the "Cable TV" section, choose your service provider (e.g., DStv, GOtv, Startimes), enter your smartcard or IUC number, select a package, and complete your payment.`,
  },
  {
    title: `Which cable TV providers can I pay for using ${appName}?`,
    content: `You can subscribe to DStv, GOtv, and Startimes directly from the ${appName} app.`,
  },
  {
    title: `How much does it cost to renew my cable subscription?`,
    content: `You only pay the standard subscription fee for your selected package. ${appName} does not charge extra service fees.`,
  },
  {
    title: `Can I pay for someone else's cable TV subscription?`,
    content: `Yes. As long as you have the correct smartcard or IUC number, you can renew any DStv, GOtv, or Startimes subscription with ${appName}.`,
  },
  {
    title: `How quickly is my subscription activated after payment?`,
    content: `Cable subscriptions are typically activated instantly after successful payment. In rare cases, it may take a few minutes to reflect.`,
  },
];

const Cable_FAQ = () => {
  return (
    <FAQ
      title="Cable TV FAQ"
      description="Everything you need to know about the Cable TV"
      questions={frequentQuestions}
    />
  );
};

export default Cable_FAQ;
