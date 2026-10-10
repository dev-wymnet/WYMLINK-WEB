import Link from "next/link";
import {
  AppleStore,
  AppleStoreMobile,
  PlayStore,
  PlayStoreMobile,
} from "../assets/index";
import appName from "../constants/data/App_Name";
import Image from "next/image";

interface Footer_Props {
  bgColor: string;
  textColor: string;
}
const Download_Footer = ({ bgColor, textColor}: Footer_Props) => {
  return (
    <>
      <div
        className={`w-full flex flex-col items-center justify-center py-10 max-md:hidden gap-[15px] py-[7%] px-[10%] ${bgColor}`}
      >
        <h2 className={`text-[70px] font-[900] ${textColor} leading-none text-center font-aeonik w-[80%] space-x-0 space-y-0 gap-0 mb-10`}>
            {appName}: Payments <br /> That Just Work
        </h2>
        <div className="flex items-center">
          <Link 
            href={`/auth/login`}
            target="_blank"
            className=""
          >
            <Image className="block" src={AppleStore} alt="download image" />
          </Link>
          <Link
            href={`/auth/login`}
            target="_blank"
            className="pl-4 lg:mt-0 "
          >
            <Image className={""} src={PlayStore} alt="download image" />
          </Link>
        </div>
      </div>
      <div className="md:hidden flex p-4">
        <div className="bg-[#101828] text-white flex flex-col py-10 px-4 rounded-[10px] ">
          <h4 className="mb-4 font-[600] text-[30px]">
            Download {appName} App
          </h4>
          <p className="text-[14px] font-[400] mb-6">
            Send money to any Nigerian bank, receive payments, and pay all your
            bills — from one simple wallet.
          </p>
          <div className="flex items-center">
            <Link
              href={`/auth/login`}
              target="_blank"
              className=""
            >
              <Image
                className="block"
                src={AppleStoreMobile}
                alt="download image"
              />
            </Link>
            <Link
              href={`/auth/login`}
              target="_blank"
              className="pl-4 lg:mt-0 "
            >
              <Image className={""} src={PlayStoreMobile} alt="download image" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Download_Footer;
