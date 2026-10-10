import Image from "next/image";
import { Globe } from "@/src/assets";
import { appName } from "@/data/constants/app_name";

const First_Section = () => {
  return (
    <div className="w-full mx-auto py-12 xmd:py-[5rem]">
      <div className="w-[95%] max-w-screen-2lg 3xl:max-w-xlg mx-auto flex flex-col items-center justify-center">
        <span className="text-[#006FFF] text-[16px] font-[600]">About Us</span>
        <h2 className="text-[#101828] font-[500] font-aeonik lg:text-[60px] text-center text-[30px] leading-[34px]  xl:w-[960px] xl:px-0 px-[24px] lg:py-[16px] py-[12px] flex lg:leading-[64px]">
          Simplifying payments for everyday Nigerians
        </h2>
        <p className="md:text-[16px] text-[14px] px-auto flex lg:w-[90%] w-[90%] pb-[39px] text-[#344054] xl:w-[906px] text-center font-[200]">
          {appName} is on a mission to make money move effortlessly across Nigeria. We&apos;re building a smarter, faster, and more reliable way to send money to any bank account, receive payments into your wallet, and pay the bills that keep life running — airtime, data, cable TV, and electricity. No failed transfers, no hidden fees, no stress. This isn&apos;t just fintech, it&apos;s financial freedom for everyday Nigerians.
        </p>
        <Image src={Globe} className="w-full my-10" alt="globe" />
      </div>
    </div>
  );
};

export default First_Section;
