import Hero_Layout from "../../components/Hero_Layout";
import Image from "next/image";
import { LadiesSmiling } from "../../assets";
import Your_Go_To_App from "./Your_Go_To_App";
import Seamless_Payments from "./Seamless_Payments";
// import Price from "./Price";
import Home_Footer from "./Home_Footer";
import Easy_Bill from "./home_view_components/Easy_Bill";
import Home_Hero from "./Home_Hero";
import Nav_Bar from "../../components/layout/Nav_bar";
import Make_Payment from "../../components/Make_Payment";
import Footer from "@/components/layout_components/footer";
// import Footer from "@/src/components/layout/Footer";

const Home_View = () => {
  return (
    <>
      <Nav_Bar
        bgColor="bg-[#0B40EE]"
        logoColor="white"
        linkColor="text-white"
        linkDColor="text-white"
        getStartedBtn="bg-white text-[#0B40EE]"
      />
      <Hero_Layout>
        <Home_Hero />
      </Hero_Layout>

      <section>
        <Easy_Bill />
        <Seamless_Payments />
        <Make_Payment
          styles={{
            bg: "bg-[#DEEBFC]",
            btn: "bg-[#DCFFC7] text-[#3C69F0FF] rounded-[4px] w-[220px] py-[18px] text-[16px] text-center font-[400]",
            cardbg: "bg-white",
          }}
        />
        <Your_Go_To_App />

        {/* <section className="w-[95%] max-w-screen-2lg 3xl:max-w-xlg mx-auto py-12 xmd:py-[5rem]">
          <div
            className="rounded-xl bg-[#DCFFC7] py-12 px-10 lg:px-20 flex flex-col xmd:flex-row gap-6 items-center justify-between"
            data-aos="zoom-in"
            data-aos-duration="1500"
            data-aos-once="true"
          >
            <div className="w-full xmd:w-[70%] lg:w-[55%] grid gap-6">
              <h4 className="xl:text-[60px] font-aeonik xl:text-left xl:leading-[64px] lg:text-[56px] lg:leading-[59px] xmd:text-[40px] font-[500] text-left text-[36px] leading-[44px]">
                <span className="text-[#0B40EE]">Get 2% Cashbacks </span> &
                Rewards
              </h4>

              <p className="text-lg font-[300] py-5">
                With Wymnet, you get 2% cashback on every eligible payment,
                from airtime and utility bills to shopping and transfers. The
                more you use Wymnet, the more you earn in real rewards,
                turning everyday spending into effortless savings. Start
                enjoying smarter payments and unlock exclusive perks made just
                for you.
              </p>

              <Link
                href="/auth/login"
                className="bg-[#101828] text-white rounded-[4px] w-[220px] py-[18px] text-[16px] text-center font-[300]"
              >
                Try {appName}
              </Link>
            </div>
            <div className="w-full xmd:w-[35%] lg:w-[40%]">
              <Image
                src={LadiesSmiling}
                alt="smiling-ladies"
                className="w-full"
              />
            </div>
          </div>
        </section> */}
        {/* <Price /> */}
        <Home_Footer />
        <Footer/>
      </section>
    </>
  );
};

export default Home_View;
