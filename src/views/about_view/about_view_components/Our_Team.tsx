import Image from "next/image";
import {
  BoldMen,
  FirstFrame,
  Glory,
  Jerry,
  Joshua,
  Mary,
  Pastor,
  SeconFrame,
} from "@/src/assets";
import { appName } from "@/data/constants/app_name";

const Our_Team = () => {
  return (
    <div className="flex flex-col text-center items-center justify-center bg-[#fff] lg:pt-[52px] pt-[10px] lg:pb-[90px]">
      <p className="text-[16px] text-secondary lg:pt-[66px] lg:pb-[12px] font-medium">
        Meet Our Team
      </p>
      <h1 className="font-[500] font-aeonik xl:text-[60px] lg:text-[50px] text-[30px] leading-[34px] xl:w-[960px] py-[24px] flex lg:leading-[54px]">
        Meet the minds driving our success
      </h1>
      <div className="flex justify-center">
        <p className="font-[200] md:text-[18px] text-[16px] px-auto py-[20px] flex lg:w-[90%] w-[90%] pb-[39px] text-[#667085] xl:w-[906px] text-center">
          Our success is powered by the passionate, talented individuals behind
          {appName}. Each team member brings their unique strengths, united by
          a shared drive for innovation, excellence, and impact. Together,
          we’re building the future of payment. We’re boldly switching things
          up.
        </p>
      </div>

      <div className="w-[95%] max-w-screen-2lg 3xl:max-w-xlg mx-auto hidden md:flex flex-grow items-center gap-2">
        <div className="grid gap-2 md:gap-4 grid-rows-2">
          <div className="rounded-[20px]">
            <Image src={Joshua} alt="joshua" className="w-full h-full rounded-[20px]" />
          </div>
          <div className="rounded-[20px]">
            <Image src={Mary} alt="mary" className="w-full h-full rounded-[20px]" />
          </div>
        </div>
        <div className="rounded-[20px]">
          <Image
            src={FirstFrame}
            alt="first frame"
            className="w-full h-full rounded-[20px]"
          />
        </div>
        <div className="grid gap-2 md:gap-4 grid-rows-2">
          <div className="rounded-[20px]">
            <Image
              src={BoldMen}
              alt="Wymlink team members"
              className="w-full h-full rounded-[20px]"
            />
          </div>
          <div className="rounded-[20px]">
            <Image
              src={SeconFrame}
              alt="second frame"
              className="w-full h-full rounded-[20px]"
            />
          </div>
        </div>
        <div className="rounded-[20px]">
          <Image
            src={Glory}
            alt="glory"
            className="w-full h-full rounded-[20px]"
          />
        </div>
        <div className="grid gap-2 md:gap-4 grid-rows-2">
          <div className="rounded-[20px]">
            <Image
              src={Pastor}
              alt="pastor"
              className="w-full h-full rounded-[20px]"
            />
          </div>
          <div className="rounded-[20px]">
            <Image
              src={Jerry}
              alt="jerry"
              className="w-full h-full rounded-[20px]"
            />
          </div>
        </div>
      </div>

      <div className="w-[95%] mx-auto mb-12 md:hidden">
        <div className="flex flex-col gap-2">
          <div className="rounded-[20px]">
            <Image
              src={BoldMen}
              alt="Wymlink team members"
              className="w-full h-full rounded-[20px]"
            />
          </div>
          <div className="rounded-[20px]">
            <Image
              src={SeconFrame}
              alt="second frame"
              className="w-full h-full rounded-[20px]"
            />
          </div>
          <div className="w-full grid grid-cols-2 gap-2">
            <div className="rounded-[20px]">
              <Image
                src={FirstFrame}
                alt="first frame"
                className="w-full h-full rounded-[20px]"
              />
            </div>
            <div className="rounded-[20px]">
              <Image
                src={Glory}
                alt="glory"
                className="w-full h-full rounded-[20px]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Our_Team;
