"use client";
import { Home_Hero_Image } from "@/assets";
import Hero from "@/components/card_components/hero";
import { appName } from "@/data/constants/app_name";

const Home_Hero = () => {
  return (
    <>
      <Hero
        title={"Buy Airtime and Internet Data"}
        subText={`Stay connected with easy airtime and internet data purchases. ${appName} covers all mobile networks and major internet service providers in Nigeria.`}
        img={Home_Hero_Image as any}
        btnText={"Get Started"}
        styles={{
          imgContainer:
            "mb-[-4rem]  xmd:mb-[-5rem] lg:mb-[-5rem] xmd:absolute right-0 bottom-0",
          container: "xmd:py-4 lg:pt-10 xl:pt-16 containerclass text-black",
          btn: "text-[#ffffff] bg-[#0a40ed] w-[190px] max-md:px-10 py-[17px] rounded-[4px] font-[300] text-center",
          titleStyle: "xmd:w-[70%]",
        }}
      />
    </>
  );
};

export default Home_Hero;
