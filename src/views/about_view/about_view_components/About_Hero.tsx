import { AppleStore, PlayStore } from "@/src/assets";
import appName from "@/src/constants/data/App_Name";
import Image from "next/image";
import Link from "next/link";

const About_Hero = () => {
  return (
    <div className="flex items-center justify-center flex-col">
      <h1 className="xl:text-[100px] md:text-[60px] text-[40px] text-primary font-[700] font-aeonik text-center xl:leading-[104px] lg:leading-[90px] md:leading-[64px] leading-[44px]">
        Moving Money Forward with {appName}
      </h1>
      <div className="flex justify-center xl:mt-[4rem] w-full lg:justify-center lg:flex-row items-center my-6 lg:w-full">
        <Link href="/auth/login" target="_blank" className="">
          <Image
            className="xl:w-[140px]"
            src={AppleStore}
            alt="download image"
          />
        </Link>
        <Link
          href="/auth/login"
          target="_blank"
          className="pl-0 lg:pl-[10px] ml-[5px] lg:mt-0 "
        >
          <Image
            className="xl:w-[150px]"
            src={PlayStore}
            alt="download image"
          />
        </Link>
      </div>
    </div>
  );
};

export default About_Hero;
