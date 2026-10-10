import Hero_Layout from "../../components/Hero_Layout";
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
        <Home_Footer />
        <Footer/>
      </section>
    </>
  );
};

export default Home_View;
