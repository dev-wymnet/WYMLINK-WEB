import { Gift, ReferalBonus } from "../../../assets";
import Hero from "./Hero";
import appName from "../../../constants/data/App_Name";
import { useRouter } from "next/navigation";
const Cashback_Hero = () => {
  const router = useRouter();
  const handleClick = () => {
    router.push("/auth/login");
  };
  return (
    <>
      <Hero
        title={"Cashback and Bonus Rewards"}
        subText={`With the ${appName} app, every bill payment and transaction earns you cashback and bonus rewards, transforming ordinary expenses into valuable savings opportunities.`}
        img={Gift}
        btnText={"Get Started"}
        styles={{
          container: "text-white",
          btn: "bg-[#EEFFDE] w-[190px] max-md:px-10 py-[17px] rounded-[4px] font-[300] text-center",
          titleStyle: "xmd:w-[70%]",
        }}
        btnAction={handleClick}
      />
    </>
  );
};

export default Cashback_Hero;
