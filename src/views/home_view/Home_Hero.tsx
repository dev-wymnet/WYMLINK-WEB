import { HomeHeroImg } from "../../assets";
import SEO from "../../components/Seo";
import appName from "../../constants/data/App_Name";
import { Use_Home_Context_Ref_State_Handler } from "../../context/page_context/home_context";
import Hero from "../cashback_view/cashback_view_components/Hero";

const Home_Hero = () => {
  const { toggleModal } = Use_Home_Context_Ref_State_Handler();

  return (
    <>
      <SEO
        title={`${appName} | Send Money, Receive Money & Pay Bills in Nigeria`}
        description={`${appName} is the all-in-one payments app for Nigeria. Send money instantly from your ${appName} wallet to any Nigerian bank account, receive money, and pay bills — airtime, data, cable TV and electricity — all in one place.`}
      />

      <Hero
        title="Send Money, Pay Bills & Top Up — All in One App"
        subText={`Fund your ${appName} wallet, send money instantly to any Nigerian bank account, receive payments, and settle airtime, data, cable TV and electricity bills in seconds. This is money, made simple.`}
        img={HomeHeroImg}
        btnText={`Get Started with ${appName}`}
        styles={{
          imgContainer: "",
          container: "text-white",
          btn: "bg-[#DCFFC7] rounded-[4px] w-[220px] py-[18px] text-[16px] text-center font-[400] text-[#2250DAFF]",
          subTextStyle: "font-[200] text-[#ECF3FFFF] text-[18px]",
          titleStyle: "lg:leading-[68px]",
        }}
        btnAction={toggleModal}
      />
    </>
  );
};

export default Home_Hero;