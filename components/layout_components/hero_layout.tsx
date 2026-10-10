import { ChildrenProps } from "@/types/general_types/general_types";
import Image from "next/image";

interface Hero_Layout_Props extends ChildrenProps {
  sectionClassName?: string;
  lower?: string;
  bgImage?: any;
  cash?: string;
}

const Hero_Layout = ({
  children,
  cash,
  sectionClassName = "bg-[#0B40EE]",
  lower,
  bgImage,
}: Hero_Layout_Props) => {
  return (
    <section className={`relative ${sectionClassName}`}>
      <div className="w-[95%] max-w-screen-xl 3xl:max-w-xlg mx-auto text-[#ffffff] flex flex-col items-center xmd:flex-row gap-4 justify-between relative h-fit overflow-hidden py-6 xmd:py-[8rem] lg:py-[6rem]">
        {children}
      </div>
      {lower && (
        <div
          className={`w-full max-lg:hidden absolute ${
            cash ? cash : "bottom-0 right-0"
          }`}
        >
          <Image src={bgImage} alt="" className="w-full" />
        </div>
      )}
    </section>
  );
};

export default Hero_Layout;
