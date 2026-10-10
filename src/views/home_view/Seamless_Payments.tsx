import {
  BlackGuy,
  Convert,
  Hand,
  SendMoney,
  UsBank,
  Woman,
} from "../../assets";
import { FaArrowRight } from "react-icons/fa";
import { MdArrowRightAlt } from "react-icons/md";
import Payment_Section from "./Payment_Section";
import appName from "../../constants/data/App_Name";
import ROUTES from "../../constants/routes";

const Seamless_Payments = () => {
  const aosProps = {
    "data-aos-duration": "1500",
    "data-aos-once": "true",
    "data-aos-offset": "0",
  };

  const paymentItems = [
    {
      preText: "Send Money",
      title: "Send Money To Friends And Family",
      text: `Wherever your friends and family are, and whatever their needs, ${appName} makes it easy for you to be there for them. You can now send money to your loved ones without limits or restrictions.`,
      link: "Send Money Now",
      linkTo: ROUTES.TRANSFER,
      linkStyle: "text-[#DCFFC7]",
      img: SendMoney,
      sideImage: Woman,
      colors: {
        text: "",
        link: "#DCFFC7",
        gradient1: "#0B40EE",
        gradient2: "#0B40EE",
        title: "",
        preText: "#E7F7D7",
      },
      layout: "left-image" as const,
    },
    // {
    //   preText: "Global Banking",
    //   title: "U.S Bank Accounts and Transfers",
    //   text: `With the ${appName} US Account feature, you can send and receive dollars like a local.
    //    Open a U.S. bank account from Anywhere in the world, make secure dollar transfers, and enjoy seamless access to the global financial system.`,
    //   img: UsBank,
    //   link: "U.S Banking",
    //   linkTo: ROUTES.GLOBALTRANSFER,
    //   linkStyle: "text-[#2467E3]",
    //   colors: {
    //     text: "#363F52",
    //     title: "#101828",
    //     link: "#2467E3",
    //     preText: "#5E19B3",
    //     gradient1: "#E6EEFC",
    //     gradient2: "#BFDEFA9E",
    //   },
    //   layout: "full-width" as const,
    // },
    // {
    //   preText: "CONVERT MONEY",
    //   title: "Convert your currency at best rates",
    //   text: "Seamlessly convert between your local currency and USD at the best rates, making currency exchange quick and effortless.",
    //   link: "Convert Now",
    //   linkStyle: "text-[#EEFFDE]",
    //   img: Convert,
    //   sideImage: BlackGuy,
    //   colors: {
    //     text: "",
    //     link: "#EEFFDE",
    //     gradient2: "#09172B",
    //     title: "",
    //     preText: "#E7F7D7",
    //     gradient1: "#0C2648",
    //   },
    //   layout: "right-image" as const,
    // },
  ];

  return (
    <div className="w-[95%] containerclass max-w-screen-2lg 3xl:max-w-xlg mx-auto">
      <div className="xl:block lg:justify-center lg:items-center pt-[62px] max-md:pt-[32px]">
        <h2 className="text-center font-aeonik max-md:text-[30px] p-[0px] text-black my-[0] font-[500] lg:text-[54px] text-[28px] mb-[-10px]">
          Seamless Payment
        </h2>

        <div className="flex p-[0px] my-[0px] justify-center items-center pb-[5rem] max-md:pb-[2rem]">
          {FaArrowRight({
            size: 40,
            className: "text-[#57637D] max-md:hidden",
          })}
          <span className="h-full flex items-end justify-end">
            {MdArrowRightAlt({
              size: 40,
              className: "text-[#57637D] md:hidden",
            })}
          </span>
          <h2 className="text-[#57637D] max-md:text-[30px] font-[600] font-aeonik ml-[0.8rem] text-[52px] ">
            With <span className="text-secondary">{appName}</span>
          </h2>
        </div>
      </div>

      <Payment_Section paymentItems={paymentItems} aosProps={aosProps} />
    </div>
  );
};

export default Seamless_Payments;
