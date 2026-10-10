"use client";
import { Fragment, useEffect, useRef, useState } from "react";
import { IoMdMenu } from "react-icons/io";
import NavList from "../NavList";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/assets/images/logo.png";

interface Navbar_Props {
  bgColor: string;
  logoColor?: string;
  linkColor: string;
  linkDColor: string;
  personalStyle?: string;
  getStartedBtn?: string;
  iconColor?: string;
  disableScrollStyleChange?: boolean;
}

const Nav_Bar = ({
  bgColor,
  logoColor,
  linkColor,
  linkDColor,
  personalStyle,
  getStartedBtn,
  iconColor,
  disableScrollStyleChange = false,
}: Navbar_Props) => {
  const [navIndicator, setNavIndicator] = useState("");
  const [scroll, setScroll] = useState(false);
  const [dropDown, setDropDown] = useState(false);
  const [openMobileNav, setOpenMobileNav] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      return window?.scrollY < 30 ? setScroll(false) : setScroll(true);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setNavIndicator("");
        setDropDown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNavIndicator = (data: string) => {
    return data == navIndicator ? setNavIndicator("") : setNavIndicator(data);
  };

  return (
    <Fragment>
      <header
        className={`${
          disableScrollStyleChange ? bgColor : scroll ? "bg-white" : bgColor
        } py-4 sticky z-[150] top-0`}
        style={{ paddingTop: 20 }}
      >
        <nav
          className={`w-[95%] containerclass max-w-screen-2lg 3xl:max-w-xlg mx-auto flex justify-between items-center`}
        >
          <div className={`flex items-center gap-[35.6px]`}>
            <Link href="/">
              <Image src={Logo} width={50} height={50} alt="" />
            </Link>
          </div>

          <NavList
            scroll={scroll}
            openMobileNav={openMobileNav}
            dropdownRef={dropdownRef}
            navIndicator={navIndicator}
            handleNavIndicator={handleNavIndicator}
            setDropDown={setDropDown}
            setOpenMobileNav={setOpenMobileNav}
            linkDColor={linkDColor}
          />

          <Link
            href="/auth/login"
            className={`${
              disableScrollStyleChange
                ? (getStartedBtn ?? "border-black border")
                : getStartedBtn && !scroll
                  ? getStartedBtn
                  : "border-black border"
            } hidden lg:block text-sm font-medium px-4 py-2 rounded-sm`}
          >
            Get started — It&apos;s free
          </Link>

          <button className="lg:hidden" onClick={() => setOpenMobileNav(true)}>
            {IoMdMenu({
              size: 24,
              className: `${
                disableScrollStyleChange
                  ? (iconColor ?? "text-white")
                  : scroll
                    ? "text-[#101828]"
                    : (iconColor ?? "text-white")
              } cursor-pointer`,
            })}
          </button>
        </nav>
      </header>
    </Fragment>
  );
};

export default Nav_Bar;
