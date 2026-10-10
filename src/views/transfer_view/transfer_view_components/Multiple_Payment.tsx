import Lock_Icon from "@/src/assets/svgs/Lock_Icon";
import { MultiplePayment } from "@/src/assets";
import appName from "@/src/constants/data/App_Name";
import Image from "next/image";

const Multiple_Payment = () => {
  const multiplePaymentData = [
    {
      title: "Instant delivery",
      details: `Transfers from your ${appName} wallet land in the recipient's bank account in seconds — no queues, no delays.`,
    },
    {
      title: "Every bank covered",
      details:
        "Send money to any commercial bank, microfinance bank, or fintech wallet in Nigeria from one simple app.",
    },
    {
      title: "Safe by design",
      details:
        "Every transfer is protected with transaction PINs, encryption, and instant alerts, so your money always arrives where it should.",
    },
  ];
  return (
    <section className=" py-12 xmd:py-20 bg-[#f9fafe] mt-[-40px]">
      <div className="flex flex-col gap-10 lg:flex-row justify-between max-w-screen-2lg 3xl:max-w-xlg w-[95%] mx-auto">
        <div className="w-full lg:w-[75%] flex flex-col gap-10 pr-4 md:pr-8 lg:pr-12">
          <p className="xmd:text-6xl font-[500] font-aeonik text-[30px] ">
            Why send money with {appName}?
          </p>
          <div className="flex-1 flex justify-between flex-col gap-4">
            {multiplePaymentData.map((item, index) => (
              <div className="flex flex-col gap-2" key={index}>
                <div className="flex gap-4 items-center">
                  <Lock_Icon />
                  <h5 className="font-[500] text-xl">{item.title}</h5>
                </div>
                <p>{item.details}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="h-auto hidden lg:block">
          <Image
            src={MultiplePayment}
            alt="referral"
            className="w-full h-auto object-contain"
          />
        </div>
      </div>
    </section>
  );
};

export default Multiple_Payment;
