import Email_Icon from "@/src/assets/svgs/Email_Icon";
import Phone_Call from "@/src/assets/svgs/Phone_Call";

const Contact_Section = () => {
  return (
    <div className="w-[95%] max-w-screen-2lg 3xl:max-w-xlg mx-auto py-[30px] xmd:py-[3rem] max-md:grid-cols-1 gap-4">
      <div className="xl:h-[751px] p-[10px]">
        <div className="w-full xmd:w-[70%] my-[4rem] flex flex-col gap-[60px]">
          <div>
            <h1 className="font-[500] font-aeonik lg:text-[54px] md:text-[36px] text-[30px] text-black">
              Contact us
            </h1>
            <p className="text-[18px] font-[400] leading-[30px] text-black">
              While our services are seamlessly integrated into our app
              for your convenience, we&apos;re always here to support you. If you
              require assistance or have any questions, don&apos;t hesitate to
              reach out. Your satisfaction is our priority.
            </p>
          </div>
          <div className="flex items-center lg:justify-start md:justify-between justify-center gap-[32px] max-md:flex-col">
            <div className="bg-[#E8F0FC] flex flex-col rounded-[16px] px-3 lg:py-10 py-6 lg:px-6 w-full">
              <div className="max-w-[72px] max-h-[72px]">
                <Email_Icon />
              </div>
              <span className="my-6 text-[16px] font-[400] text-[#363F51]">
                Send Us a Mail for Prompt Assistance and Expert Support
              </span>
              <div className="flex gap-2 max-md:gap-1 items-center max-md:flex-col">
                <span>Support: </span>
                <a
                  href="mailto:support@wymlink.org"
                  className="xmd:bg-[#F9F5FF] underline rounded-[16px] px-3 py-2 text-[16px] max-sm:text-[12px] text-[#006FFF] my-6"
                >
                  <span className="font-[600] no-underline">
                    support@wymlink.org
                  </span>
                </a>
              </div>
            </div>
            <div className="bg-[#EFE4FB] flex flex-col rounded-[16px] px-3 lg:py-10 py-6 lg:px-6 w-full">
              <div className="max-w-[72px] max-h-[72px]">
                <Phone_Call />
              </div>
              <span className="my-6 text-[16px] font-[400] text-[#363F51]">
                Call Us Today for Expert Support and Immediate Assistance.
              </span>
              <div className="flex gap-2 max-md:gap-1 items-center max-md:flex-col">
                <span>Call: </span>
                <a
                  href="tel:+2347075949707"
                  className="xmd:bg-[#F9F5FF] rounded-[16px] px-3 py-2 text-[16px] max-sm:text-[12px] text-[#006FFF] my-6"
                >
                  <span className="font-[600]">+2347075949707</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact_Section;
