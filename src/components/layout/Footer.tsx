import Image from "next/image";
// import Logo_Wrapper from "../Logo_Wrapper";
import Footer_List from "../Footer_LIst";
import { FooterTopData } from "../../constants/data/Footer_Data";
import { AppleStore, NDPR, PlayStore } from "../../assets";
import appName from "../../constants/data/App_Name";
import Instagram_Icon from "../../assets/svgs/Instagram_Icon";
import Facebook_Icon from "../../assets/svgs/Facebook_Icon";
import X_Icon from "../../assets/svgs/X_Icon";
import Youtube_Icon from "../../assets/svgs/Youtube_Icon";
import Tiktok_Icon from "../../assets/svgs/Tiktok_Icon";
import Linkedin_Icon from "../../assets/svgs/Linkedin_Icon";
import Link from "next/link";

interface footerProps {
  wrapperWidth?: any;
}
const Footer = ({ wrapperWidth }: footerProps) => {
  return (
    <div className="bg-[#010B25] py-10">
      {/* inner container */}
      <footer className="max-w-screen-2lg 3xl:max-w-xlg w-[95%] mx-auto">
        <div className="">
          <div className="lg:w-[100%] mx-auto">
            {/* top container */}
            <div className="flex  justify-between flex-wrap">
              {/* logo container */}
              <div className="w-full my-4 pl-[8px] pr-[20px] lg:w-[15%]">
                {/* <Logo_Wrapper
                  indicatorWrapper={`w-[75px] h-[36px]`}
                  indicator="white"
                /> */}

                <p className="font-[300] w-[60%] mt-[-4px] text-lemonColor leading-[1.2] text-[12px] text-nowrap">
                  Money, made simple
                </p>
              </div>
              {FooterTopData?.map((item, key) => (
                <Footer_List
                  key={key}
                  listTitle={item?.title}
                  listLinks={item?.listItems}
                />
              ))}
              {/* download button */}
              <div className="flex w-[48%] flex-col lg:flex-row items-start my-6 lg:w-full lg:justify-end lg:my-2 lg:px-0 ">
                <Link href={``} target="_blank" className="">
                  <Image
                    className="block"
                    src={AppleStore}
                    alt="download image"
                    width={105}
                    height={35}
                  />
                </Link>
                <Link
                  href={``}
                  target="_blank"
                  className="pl-0 lg:pl-[10px] mt-4 lg:mt-0 "
                >
                  <Image
                    className={""}
                    src={PlayStore}
                    alt="download image"
                    width={118}
                    height={35}
                  />
                </Link>
              </div>
              <div
                style={{ borderBottom: "0.1px solid #ffffffa9" }}
                className="border-[0px] mt-[5px] w-[100%] lg:w-[100%] mx-auto"
              ></div>
            </div>
            {/* top container ends here*/}
            {/* bottom container */}
            <div className="flex  justify-start xl:items-start flex-wrap">
              <div className="payBillContaim my-6 w-[48%] text-primary lg:w-[20%] ">
                <h3 className="font-[500] mb-2 text-base text-lemonColor leading-loose">
                  Contact
                </h3>
                <a
                  href="mailto:support@wymlink.org"
                  className="text-[14px] no-underline text-lemonColor underline font-[400] block my-[10px] leading-loose"
                >
                  support@wymlink.org
                </a>
              </div>
              <div className="payBillContaim my-6 w-[48%] text-primary lg:w-[27%] ">
                <h3 className="font-[500] mb-2 text-base text-lemonColor leading-loose">
                  USA
                </h3>
                <p className="text-[13.67px] block text-[white] my-[16px] tracking-[0/001rem] leading-[1.2] lg:w-[70%]">
                  447 Broadway, 2nd Floor Suite #957, New York, New York 10013,
                  United States
                </p>
              </div>
              <div className="payBillContaim lg:my-6 w-[48%] text-primary lg:w-[27%] ">
                <h3 className="font-[500] mb-2 text-base text-lemonColor leading-loose">
                  Nigeria
                </h3>
                <p className="text-[14px] block my-[10px] lg:w-[70%] tracking-wider leading-[20px]">
                  No 5 Stephen Orasanye Street,4th Avenue Gwarinpa, Abuja.
                </p>
              </div>
              <div className="lg:my-6 w-[90%] p-2 flex flex-wrap text-primary items-center lg:w-[25%]">
                <h3 className="font-[500] mb-2 text-lemonColor text-base mr-4 leading-loose">
                  Community
                </h3>
                <div className="flex p-0 w-full">
                  <Link
                    className="mr-[10px]"
                    target="_blank"
                    href="https://www.instagram.com/boldapp.ng"
                  >
                    <div className="h-[20px] w-[20px]">
                      <Instagram_Icon />
                    </div>
                  </Link>
                  <Link
                    target="_blank"
                    className="mr-[10px]"
                    href="https://www.facebook.com/boldapp.ng?mibextid=JRoKGi"
                  >
                    <div className="h-[20px] w-[20px]">
                      <Facebook_Icon />
                    </div>
                  </Link>
                  <Link
                    target="_blank"
                    className="mr-[10px]"
                    href="https://twitter.com/boldapp_ng"
                  >
                    <div className="h-[20px] w-[20px]">
                      <X_Icon />
                    </div>
                  </Link>
                  <Link
                    target="_blank"
                    className="mr-[10px]"
                    href="https://www.youtube.com/@boldapp"
                  >
                    <div className="h-[20px] w-[20px]">
                      <Youtube_Icon />
                    </div>
                  </Link>
                  <Link
                    target="_blank"
                    className="mr-[10px]"
                    href="https://www.tiktok.com/@boldapp_ng?_t=8m0dGigJu4c&_r=1"
                  >
                    <div className="h-[24px] w-[24px]">
                      <Tiktok_Icon />
                    </div>
                  </Link>
                  <Link
                    target="_blank"
                    className="mr-[10px]"
                    href="https://www.linkedin.com/company/boldapp-ng/"
                  >
                    <div>
                      <Linkedin_Icon />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
            {/* bottom container ends here*/}
            {/* last layer */}
            <div className="flex flex-wrap justify-between items-center">
              <div className="w-full flex justify-between gap-2">
                <div className="">
                  <p className="text-primary text-sm">
                    © 2025 {appName}. All rights reserved.
                  </p>
                  <p className="text-primary text-[12px] font-[400] w-[80%] mt-[2rem]">
                    {appName} is a product of {appName} Ltd ({appName}
                    ), a Financial Technology company and not a bank. Banking
                    services are provided by our partner banks who are duly
                    licensed by the CBN.
                  </p>
                </div>
                <div className="max-w-[120px]">
                  <Image
                    src={NDPR}
                    alt="NDPR AUDIT"
                    style={{ borderRadius: 3 }}
                  />
                </div>
              </div>
            </div>
            {/* last layer ends here */}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
