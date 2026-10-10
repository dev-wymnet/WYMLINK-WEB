import { appName } from "@/data/constants/app_name";
import { Footer_Data } from "@/data/constants/footer_data";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-[#191C1F] text-[#D7D7D7] py-12 mx-auto w-full">
      <div className="containerclass">
        <section className="flex flex-col md:flex-row lg:gap-30 gap-8 font-instrumentSans">
          <div className="md:w-[40%] flex flex-col gap-3">
            <Link href={"/"}>
            </Link>
            <p className="md:w-[90%]">
              {appName} helps you send money to any Nigerian bank, receive
              payments, and pay bills instantly — anytime, anywhere.
            </p>
          </div>
          <div className="flex-1 flex flex-col gap-8 md:flex-row justify-between">
            {Footer_Data.map((data) => (
              <div className="flex flex-col gap-3">
                <h5 className="text-[#0B40EE]">{data.title}</h5>
                {data.subLinks.map((link, idx) => (
                  <div key={idx}>
                    {link.href ? (
                      <Link href={link.href}>{link.name}</Link>
                    ) : (
                      <p className="cursor-pointer">{link.name}</p>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
        <section className="border-t border-t-[#E1E5E766] pt-8 mt-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <p>
              © {new Date().getFullYear()} {appName}. All rights reserved.
            </p>
            <div className="flex gap-10">
              <Link href={"/aml-and-kyc"}>Privacy Policy</Link>
              <Link href={"/terms"}>Terms & Conditions</Link>
            </div>
          </div>
          <p className="font-inter text-[#E1E1E1] mt-8">
            At {appName}, we are committed to your financial freedom. Our
            platform is designed to give you seamless, secure, and instant
            payments — from wallet-to-bank transfers to airtime, data, cable
            TV, and electricity bills. We are constantly innovating to ensure
            your money moves as smoothly as you do. Thank you for choosing{" "}
            {appName} — money, made simple.
          </p>
        </section>
      </div>
    </footer>
  );
};

export default Footer;
