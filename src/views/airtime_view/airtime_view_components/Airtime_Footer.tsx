import Link from "next/link";
import {
  AirtimeFooterImg,
  AppleStore,
  iPhoneMockUp,
  PlayStore,
} from "../../../assets";
import Simple_Flex_Items from "../../../components/Simple_Flex_Items";
import appName from "../../../constants/data/App_Name";
import Image from "next/image";

const Airtime_Footer = () => {
  return (
    <Simple_Flex_Items
      img={{
        img: AirtimeFooterImg,
        imgSm: iPhoneMockUp as any,
      }}
      bgColor="bg-[#F4F8FC]"
      title={`Pay Bills with Confidence — Right From Your Wallet`}
      titleStyle="font-[900]"
      details={`Top up airtime and data, renew cable TV, buy electricity, and send money to any Nigerian bank — all from one powerful app.
${appName} brings everything you need into one place, making your financial life easier, faster, and more connected.`}
      btn={{
        btnStyles: "text-white bg-[#0067F5]",
        btnText: "Recharge Now",
      }}
      bannerSize="xmd:text-[48px] xmd:leading-[50px]"
      comp={
        <div className="flex items-center">
          <Link
            href={``}
            target="_blank"
            className=""
          >
            <Image className="block" src={AppleStore} alt="download image" />
          </Link>
          <Link
            href={``}
            target="_blank"
            className="pl-4 lg:mt-0 "
          >
            <Image className={""} src={PlayStore} alt="download image" />
          </Link>
        </div>
      }
    />
  );
};

export default Airtime_Footer;
