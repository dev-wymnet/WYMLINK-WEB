import type React from "react";

import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import { HELP, PAYMENT, REWARD } from "../constants/data/Nav_Data";
import Power_Icon from "../assets/svgs/Power_Icon";
import Link from "next/link";

interface DesktopNavProps {
  scroll: boolean;
  navIndicator: string;
  linkDColor: string;
  handleNavIndicator: (val: string) => void;
  setDropDown: React.Dispatch<React.SetStateAction<boolean>>;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}

const navArray = [
  {
    title: "Payment",
    isDropdown: true,
    details: PAYMENT,
  },
  // { title: "Reward", isDropdown: true, details: REWARD },
  { title: "Blog", isDropdown: false, href: "/blog" },
  { title: "About Us", isDropdown: false, href: "/about" },
  { title: "Help", isDropdown: true, details: HELP },
];

const DesktopNav = ({
  scroll,
  linkDColor,
  navIndicator,
  handleNavIndicator,
  setDropDown,
  dropdownRef,
}: DesktopNavProps) => {
  return (
    <div
      className="hidden lg:flex lg:w-[33.33%] justify-between items-center"
      ref={dropdownRef}
    >
      {navArray?.map((item: any, key: any) => (
        <div key={key} className="relative">
          {item.isDropdown === true ? (
            <div className="relative">
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => handleNavIndicator(item?.title)}
              >
                <p
                  className={`font-medium xl:font-semibold text-[16px] font-Inter  ${
                    scroll ? "text-[#101828]" : linkDColor
                  }`}
                >
                  {item.title}
                </p>
                {navIndicator !== item.title
                  ? FaAngleDown({
                      size: 17,
                      className: `${scroll ? "text-[#101828]" : linkDColor}`,
                    })
                  : FaAngleUp({
                      size: 17,
                      className: `${scroll ? "text-[#101828]" : linkDColor}`,
                    })}
              </div>

              {navIndicator?.toLowerCase() === item?.title?.toLowerCase() && (
                <div className="absolute top-full mt-2 left-0 z-[1000]">
                  <div className="bg-white rounded-lg shadow-lg p-4 w-80">
                    {item.details.map((section: any, idx: any) => (
                      <div key={idx} className="mb-4 last:mb-0">
                        {section.title && (
                          <h4 className="text-sm font-medium text-gray-500 mb-2">
                            {section.title}
                          </h4>
                        )}
                        <div className="space-y-2">
                          {section.subList.map((subItem: any, subIdx: any) => (
                            <Link
                              key={subIdx}
                              href={subItem.href}
                              target={subItem.target || "_self"}
                              className="flex items-center p-2 hover:bg-gray-50 rounded-md"
                              onClick={() => {
                                handleNavIndicator("");
                                setDropDown(false);
                              }}
                            >
                              {/* <img
                                src={subItem.image || "/placeholder.svg"}
                                alt={subItem.name}
                                className="w-5 h-5 mr-3"
                              /> */}
                              <div className="w-5 h-5 mr-3">
                                <subItem.image />
                              </div>
                              <span className="text-gray-700">
                                {subItem.name}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href={item?.href} className="flex items-center">
              <p
                className={`font-medium xl:font-semibold text-[16px] font-inter ${
                  scroll ? "text-[#101828]" : linkDColor
                }`}
              >
                {item?.title}
              </p>
            </Link>
          )}
        </div>
      ))}
    </div>
  );
};

export default DesktopNav;
