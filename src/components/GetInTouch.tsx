import { AvatarGroup } from "../assets";
import Link from "next/link";

const GetInTouch = (props: any) => {
  return (
    <section className="bg-[#F9FAFB] text-black xl:mt-[64px] mb-8 text-center w-[95%] max-w-screen-2lg 3xl:max-w-xlg py-[32px] mx-auto rounded-[5px] pb-[45px]">
      {/* <div className="wrapperContainer bg-[#F9FAFB] text-black xl:mt-[64px] xl:mb-[96px] text-center py-[32px] w-[90%] lg:w-[80%] mx-auto rounded-[5px]"> */}
        <div className="lg:w-[15%] w-[30%] m-auto">
          <img
            className="w-full"
            src={AvatarGroup}
            alt="avatar group"
          />
        </div>
        <div>
          <h3 className="font-[500] text-[16px] xl:text-[20px] my-[0.5rem]">
            Still have questions?
          </h3>
          <p className="text-[#667085] text-[12px] lg:text-[18px] mb-[2rem]">
            Can&apos;t find the answer you&apos;re looking for? Please chat to our
            friendly team.
          </p>
          <Link
            href="/contact"
            className="bg-black text-white font-medium rounded-[5px] px-12 py-5 text-[16px]"
          >
            Get in touch
          </Link>
        </div>
      {/* </div> */}
    </section>
  );
};
export default GetInTouch;
