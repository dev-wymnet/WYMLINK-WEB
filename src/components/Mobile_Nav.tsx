import Image from "next/image";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import { HELP, PAYMENT, REWARD } from "../constants/data/Nav_Data";
// import { BlueLogo, MobileBlue } from "../assets";
import { IoClose } from "react-icons/io5";
import { useState } from "react";
import Link from "next/link";
import { appName } from "@/data/constants/app_name";

interface MobileNavProps {
  openMobileNav: boolean;
  navIndicator: string;
  handleNavIndicator: (val: string) => void;
  setOpenMobileNav: React.Dispatch<React.SetStateAction<boolean>>;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}

const renderNavSection = (
  navIndicator: string,
  sectionTitle: string,
  sectionData: any[],
  setNavIndicator: any,
) => {
  return (
    <div>
      <div
        className="flex items-center justify-between py-3 cursor-pointer"
        onClick={() => setNavIndicator(sectionTitle)}
      >
        <h3 className="text-[16px] font-[600] text-gray-900">{sectionTitle}</h3>
        {navIndicator === sectionTitle
          ? FaAngleUp({
              size: 20,
              className: "text-[#667085]",
            })
          : FaAngleDown({
              size: 20,
              className: "text-[#667085]",
            })}
      </div>

      {navIndicator === sectionTitle && (
        <div className="">
          {sectionData.map((section, sectionIdx) => (
            <div key={sectionIdx} className="px-4">
              {section.title && (
                <h4 className="text-[16px] font-[500] text-[#101828] py-3">
                  {section.title}
                </h4>
              )}
              <div className="space-y-3">
                {section.subList.map((item: any, itemIdx: number) => (
                  <Link
                    key={itemIdx}
                    href={item.href}
                    // target={item.target || '_self'}

                    className="flex items-center py-2 text-gray-700"
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      {item.image ? (
                        // <img src={item.image} alt={item.name} className="w-3 h-3" />
                        <>{item.image()}</>
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      )}
                    </div>
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MobileNav = ({
  openMobileNav,
  // navIndicator,
  handleNavIndicator,
  setOpenMobileNav,
  dropdownRef,
}: MobileNavProps) => {
  const navSections = [
    { title: "Payments", data: PAYMENT },
    { title: "Rewards", data: REWARD },
    { title: "Help", data: HELP },
  ];

  const [navIndicator, setNavIndicator] = useState("");

  return (
    <div
      className={`fixed z-[999] top-0 bottom-0 left-0 right-0 bg-white transition-transform duration-300 ease-in-out lg:hidden
      ${openMobileNav ? "translate-x-0" : "translate-x-full"}`}
      ref={dropdownRef}
    >
      <div className="flex flex-col h-full bg-white">
        <div className="flex items-center justify-between px-4 pt-4">
          <div className="flex items-center">
            <Link href={"/"}>
              {/* <Image src={BlueLogo} alt="logo" className="h-[60px] w-auto" /> */}{appName}
            </Link>
          </div>
          <button
            onClick={() => setOpenMobileNav(false)}
            className="text-[#292D32]"
          >
            {IoClose({
              size: 24,
              className: "text-[#101828] cursor-pointer",
            })}
          </button>
        </div>
        <div className="flex w-[95%] mx-auto mt-8 gap-4">
          <div className="bg-[#DCFFC7] text-[#0B40EE] py-2 px-8 rounded-lg">
            <Link href={"/"}>
              <p>Personal</p>
            </Link>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto gap-4 p-4">
          {renderNavSection(
            navIndicator,
            navSections[0].title,
            navSections[0].data,
            setNavIndicator,
          )}
          {renderNavSection(
            navIndicator,
            navSections[1].title,
            navSections[1].data,
            setNavIndicator,
          )}
          <div className="">
            <Link
              href="/about"
              className="flex items-center py-3 text-[16px] font-[600] text-gray-900"
            >
              About Us
            </Link>
          </div>
          {renderNavSection(
            navIndicator,
            navSections[2].title,
            navSections[2].data,
            setNavIndicator,
          )}
        </div>
        <div className="w-full border-t-[2px] border-t-[#F9FAFB] px-4 py-8">
          <Link
            href="/auth/login"
            className="flex items-center py-3 text-[16px] font-[600] text-gray-900"
          >
            <button className="w-full bg-[#101828] text-white text-[16px] font-[600] py-[10px] px-[18px] rounded-lg">
              Get started — It&apos;s free
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MobileNav;
