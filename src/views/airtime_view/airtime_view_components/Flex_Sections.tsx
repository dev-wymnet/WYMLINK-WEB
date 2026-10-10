import React from "react";
import Simple_Flex_Items from "../../../components/Simple_Flex_Items";
import {
  AirtimeWithLovedOnes,
  BlackWomanSmiling,
  NetworkProvider,
} from "../../../assets";
import appName from "../../../constants/data/App_Name";

const Flex_Sections = () => {
  return (
    <>
      <div style={{ paddingTop: 20, paddingBottom: 20, background: "#F4F8FC" }}>
        <Simple_Flex_Items
          img={{
            img: NetworkProvider,
          }}
          bgColor="bg-[#F4F8FC]"
          title={"Explore all network providers"}
          details={`${appName} seamlessly integrates with leading telecom networks, ensuring you're always connected, wherever you go!`}
          details2={`Top up any line, anytime.
${appName} lets you buy airtime for all major Nigerian networks — MTN, Airtel, Glo, and 9mobile — in seconds, straight from your wallet.`}
          btn={{
            btnStyles: "bg-transparent text-[#0067F5] text-[18px]",
            btnText: "Recharge Now",
          }}
        />
      </div>
      <div
        style={{ paddingTop: 20, paddingBottom: 20, background: "#FFFFFFFF" }}
      >
        <Simple_Flex_Items
          img={{
            img: AirtimeWithLovedOnes,
            imgPosition: "right",
          }}
          bgColor="bg-transparent"
          title={"Share airtime with your loved ones"}
          details={`Stay connected effortlessly: With ${appName}, buying and sharing airtime is quick and easy, keeping you and your loved ones in touch!`}
          btn={{
            btnStyles: "text-[#0067F5] text-[18px]",
            btnText: "Recharge Now",
          }}
        />
      </div>
      <div style={{ paddingTop: 20, paddingBottom: 40, background: "#F4F8FC" }}>
        <Simple_Flex_Items
          img={{
            img: BlackWomanSmiling,
          }}
          bgColor="bg-[#F4F8FC]"
          title={`Recharge your phone seamlessly with ${appName}`}
          details={
            "Whether it’s your line or someone else’s, top up any network with ease because staying connected should be simple. One app, all networks. "
          }
          btn={{
            btnStyles:
              "text-white bg-[#0a40ed] w-[210px] max-md:px-10 py-[17px] rounded-[4px] font-[300] text-center",
            btnText: "Get Started",
            btnBgColor: "",
          }}
        />
      </div>
    </>
  );
};

export default Flex_Sections;
