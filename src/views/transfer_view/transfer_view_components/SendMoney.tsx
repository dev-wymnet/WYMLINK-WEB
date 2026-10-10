import { useState } from "react";
import { GroupBank, FastTransaction, LowTransaction } from "@/src/assets";
import appName from "@/src/constants/data/App_Name";
import Image from "next/image";

const SendMoney = () => {
  const [active, setActive] = useState(0);

  const sendMoneyData = [
    {
      title: "Comprehensive Network",
      subText:
        "Access a vast network of banks in Nigeria, ensuring seamless transfers to any recipient.",
      img: GroupBank,
      bgGradient: "from-[#0a40ed] to-[#0a40ed]",
      text: "text-white",
    },
    {
      title: "Fast Transfers",
      subText:
        "Transfer funds swiftly within Nigeria, with most transactions completing within few seconds.",
      img: FastTransaction,
      bgGradient: "from-[#dcffc7] to-[#dcffc7]",
    },
    {
      title: "Low Transaction  Fees",
      subText:
        "Benefit from low transfer fees for domestic transactions, helping you save on transaction costs.",
      img: LowTransaction,
      bgGradient: "from-[#0A1C34] to-[#0A1C34]",
      text: "text-white",
    },
  ];
  return (
    <div className="max-w-screen-2lg 3xl:max-w-xlg w-[95%] mx-auto py-[5px] xmd:py-20">
      <div className="w-full">
        <h2 className="lg:w-[50%] max-md:w-full font-[700] xmd:leading-[60px] xmd:text-[62px] text-3xl max-xmd:pt-[30px] font-aeonik">
          Send Money to Banks in Nigeria
        </h2>
        <p className="lg:w-[60%]  max-md:w-full font-[300] lg:mt-4 mt-2 xmd:text-xl text-[#667085]">
          Move naira the easy way with {appName}. Send money to any Nigerian bank account, receive payments into your wallet, and stay in control of your finances — all in one place.
        </p>
      </div>
      <section className="flex sm:flex-row flex-col justify-center xl:gap-[29px] gap-8  mt-12 xmd:h-[570px]">
        {sendMoneyData.map((item, index) => (
          <div
            key={index}
            onMouseEnter={() => setActive(index)}
            className={`bg-gradient-to-br ${
              item.bgGradient
            } transition-all duration-500 ease-in-out rounded-xl px-4 xmd:px-8 pt-4 xmd:pt-12 flex flex-col justify-between 
                ${
                  index !== active ? "lg:w-[25%]" : "lg:w-[50%]"
                } w-full md:w-[33%] overflow-hidden cursor-pointer ${
              item.text && item.text
            }`}
          >
            <div className="flex flex-col gap-6">
              <h5 className="font-[700] font-aeonik text-2xl md:text-[1.8rem]">
                {item.title}
              </h5>
              <p className="text-sm md:text-[1.125rem] md:leading-[1.4rem]">
                {item.subText}
              </p>
            </div>

            <div className="mt-auto flex gap-4 items-center">
              {index === active && (
                <a
                  href="/auth/login"
                  className="lg:block hidden mt-4 w-fit bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm transition-all duration-300 self-end my-6"
                >
                  Get Started
                </a>
              )}
              <div className="flex-1 h-full block">
                <Image
                  src={item.img}
                  alt={item.title}
                  className={`w-full h-full block transition-transform duration-500 
                        ${
                          index === active
                            ? "scale-1000 opacity-100"
                            : "scale-90"
                        }`}
                />
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default SendMoney;
