import { SendMoney, Woman } from "../../assets";
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
      title: "Send Money To Any Nigerian Bank",
      text: `Fund your ${appName} wallet once, then send money to any bank account in Nigeria — instantly and securely. Whether you're settling up with friends, supporting family, or paying for services, ${appName} makes every transfer effortless.`,
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
  ];

  return (
    <div className="w-[95%] containerclass max-w-screen-2lg 3xl:max-w-xlg mx-auto">
      <div className="xl:block lg:justify-center lg:items-center pt-[62px] max-md:pt-[32px]">
        <h2 className="text-center font-aeonik max-md:text-[30px] p-[0px] text-black my-[0] font-[500] lg:text-[54px] text-[28px] mb-[-10px]">
          Seamless Payments
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
