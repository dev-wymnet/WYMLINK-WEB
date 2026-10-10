import Link from "next/link";
import Image from "next/image";
import { FooterImage } from "../../assets";
import appName from "../../constants/data/App_Name";

const Home_Footer = () => {
  return (
    <section className="bg-[#010B25]  pt-4 xmd:py-12">
      <div className="flex containerclass justify-between items-center w-[95%] max-w-screen-2lg 3xl:max-w-xlg mx-auto text-white xmd:border-2 border-[#EEFFDE33] rounded-2xl py-12 xmd:px-16 text-center xmd:text-start">
        <div className="w-full xmd:w-[60%] flex flex-col gap-6">
          <p className="text-4xl lg:text-5xl max-xm:w-[80%] mx-auto font-[600] xmd:leading-snug">
            Transfers, Airtime, Data & Bills. One App.
          </p>
          <p className="w-[90%] mx-auto xmd:ml-0 text-[18px] xmd:leading-snug">
            Send money to any Nigerian bank, receive payments, and knock out
            your bills in seconds — {appName} gives you full control of your
            money.
          </p>
          <Link
            href={"/auth/login"}
            className="bg-[#DCFFC7] font-[300] text-[#0F1F51FF] block w-full md:w-fit mx-auto xmd:w-fit xmd:ml-0 px-7 py-3 rounded-xl xmd:rounded-full hover:bg-[#0B40EE] hover:text-[#DCFFC7]"
          >
            Try {appName}
          </Link>
        </div>
        <Image
          src={FooterImage}
          alt=""
          className="hidden xmd:block xmd:w-[30%] "
        />
      </div>
    </section>
  );
};

export default Home_Footer;
