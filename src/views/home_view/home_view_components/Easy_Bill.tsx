/* eslint-disable react/jsx-pascal-case */
import Feature_Card from "./Feature_Card";
import { Circle_Cards_Container } from "./Circle_Cards";
import Bulk_Transfer_Icon from "../../../assets/svgs/home/Bulk_Transfer_Icon";
import Airtime_Icon from "../../../assets/svgs/Airtime_Icon";
import Cable_Icon from "../../../assets/svgs/Cable_Icon";
import Power_Icon from "../../../assets/svgs/Power_Icon";
import Note_Icon from "../../../assets/svgs/home/Note_Icon";
import Purse_Icon from "../../../assets/svgs/home/Purse_Icon";
import appName from "../../../constants/data/App_Name";
const circleCardsData = [
  { text: "Bank Transfers", image: Bulk_Transfer_Icon },
  { text: "Airtime & Data", image: Airtime_Icon },
  { text: "Cable TV", image: Cable_Icon },
  { text: "Electricity", image: Power_Icon },
];

const Easy_Bill = () => {
  return (
    <div className="w-[95%] containerclass max-w-screen-2lg 3xl:max-w-xlg flex flex-col md:flex-row md:flex-wrap lg:flex-nowrap gap-6 lg:gap-0 lg:justify-between items-center mx-auto pt-12 lg:pt-[5rem]">
      <Feature_Card
        containerClass="bg-[#DCFFC7] rounded-2xl px-1 lg:px-4 py-3 lg:py-6 flex items-center lg:justify-between gap-4 w-full  xmd:w-[48%] lg:w-[30%]"
        contentClass="text-[#344054]"
        titleClass="font-[500] text-lg"
        descriptionClass="text-[12px]"
        imageSrc={Note_Icon}
        imageAlt="bill"
        title="Easy bill payments"
        description={`Pay airtime, data, cable TV and electricity bills with the ${appName} app — quick, secure, and hassle-free`}
        aosAnimation="fade-right"
        aosDuration="1500"
      />

      <div className="space-y-4  max-xmd:w-full max-xmd:flex max-xmd:flex-col max-xmd:gap-[10px]">
        <h4 className="md:hidden font-[500] text-[16px] text-black">
          {appName} App Features
        </h4>
        <Circle_Cards_Container
          items={circleCardsData}
          containerClass="w-full xmd:w-[48%] lg:w-[33.33%] h-auto md:gap-4 flex justify-between"
          itemClass="flex flex-col w-full gap-2 items-center justify-center"
          circleClass="bg-[#DCFFC7] rounded-full grid place-items-center w-[3.5rem] h-[3.5rem]  xmd:w-[4rem] xmd:h-[4rem]"
          textClass="text-[14px] max-md:text-[10px] text-nowrap xmd:text-sm text-[#344054] font-[500]"
        />
      </div>

      <Feature_Card
        containerClass="flex items-center gap-4 w-full xmd:w-[50%] lg:w-[28%]"
        contentClass="text-[#344054]"
        titleClass="font-[500] text-lg"
        imageWrapperClass="w-[70px] lg:w-[30%]"
        descriptionClass="text-[12px]"
        imageSrc={Purse_Icon}
        imageAlt="bill"
        title="Instant bank transfers"
        description={`Send money from your ${appName} wallet to any Nigerian bank account — fast, smooth, and secure`}
        aosAnimation="fade-right"
        aosDuration="1500"
      />
    </div>
  );
};

export default Easy_Bill;
