"use client";
import Link from "next/link";
import Nav_List from "../ui_components/nav_list";
import { IoClose } from "react-icons/io5";
import { IoIosMenu } from "react-icons/io";
import { useState, useEffect } from "react";
import { App_Button } from "../ui_components/app_button";
import { useRouter } from "next/navigation";
import { appName } from "@/data/constants/app_name";

const Nav_Bar = ({ logo = false }: { logo?: boolean }) => {
  const [mobileNav, setMobileNav] = useState(false);
  const [isAwayFromTop, setIsAwayFromTop] = useState(false);
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setIsAwayFromTop(window.scrollY > 50);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navTextColor = isAwayFromTop ? "text-secondary" : "text-secondary";

  return (
    <>
      <header
        className={`fixed right-0 left-0 top-0 z-[1000] transition-all duration-300
          ${
            isAwayFromTop
              ? "bg-white/95 backdrop-blur-md shadow-md"
              : "bg-transparent"
          }`}
      >
        <nav className="containerclass py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                href={"/"}
                className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors"
              >
                {appName}
              </Link>
            </div>

            <div className="hidden lg:flex flex-1 justify-center items-center gap-8">
              <Nav_List mobileNav={mobileNav} setMobileNav={setMobileNav} />
            </div>

            <div className="hidden lg:flex items-center gap-4">
              <App_Button
                onClick={() => router.push('/auth/login')}
                variant="secondary"
                className="px-6 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              >
                Get Started
              </App_Button>
            </div>

            <button
              className="lg:hidden p-2 rounded-xl hover:bg-primary/10 transition-colors"
              onClick={() => setMobileNav(true)}
            >
              <IoIosMenu size={24} className="text-secondary" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-[999] bg-white lg:hidden transition-transform duration-300 ease-in-out
          ${mobileNav ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="containerclass flex flex-col h-full py-6">
          <div className="flex items-center justify-between mb-8">
            <Link href={"/"} className="text-2xl font-bold text-primary">
              {appName}
            </Link>
            <button
              onClick={() => setMobileNav(false)}
              className="p-2 rounded-xl hover:bg-primary/10 transition-colors"
            >
              <IoClose size={24} className="text-secondary" />
            </button>
          </div>

          <div className="flex flex-col gap-6 flex-1">
            <Nav_List mobileNav={mobileNav} setMobileNav={setMobileNav} />
          </div>

          <div className="flex flex-col gap-4 pt-6 border-t border-border">
            <Link
              href={"/auth/login"}
              onClick={() => setMobileNav(false)}
              className="w-full px-6 py-3 text-center text-sm font-semibold text-secondary border border-border rounded-xl hover:bg-primarySoft transition-colors"
            >
              Login
            </Link>
            <App_Button
              onClick={() => setMobileNav(false)}
              variant="primary"
              className="w-full px-6 py-3 text-sm font-semibold shadow-md"
            >
              Get Started
            </App_Button>
          </div>
        </div>
      </div>

      {mobileNav && (
        <div
          className="fixed inset-0 bg-black/50 z-[998] lg:hidden"
          onClick={() => setMobileNav(false)}
        />
      )}
    </>
  );
};

export default Nav_Bar;
