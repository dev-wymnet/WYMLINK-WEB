import Card from "./Card";
import {
  ConverMoney,
  GiftCard,
  GoToBoy,
  GoToVector,
  LockedCard,
  MoneyTransfer,
  Networks,
  StackCard,
} from "../../assets";
import appName from "../../constants/data/App_Name";
import Image from "next/image";
import Link from "next/link";

const cardItems = [
  {
    text: "Pay your electricity, data, airtime, & TV cable ",
    image: Networks,
    imageWidth: "",
  },
  {
    text: `Send money instantly to any Nigerian bank account`,
    image: MoneyTransfer,
    imageWidth: "",
    width: 356,
    height: 186,
  },
  {
    text: "Receive money straight into your wallet",
    image: ConverMoney,
    imageWidth: "",
  },
  {
    text: "Fund your wallet in seconds",
    image: LockedCard,
    imageWidth: "",
  },
  {
    text: "Top up airtime & data on every network",
    image: StackCard,
    imageWidth: "",
  },
  {
    text: `Get rewarded every time you use ${appName}`,
    image: GiftCard,
    imageWidth: "",
  },
];
interface goToProps {
  handleClick?: any;
}
const Your_Go_To_App = ({ handleClick }: goToProps) => {
  return (
    <div
      // className={` lg:mt-[80px] md:mt-[60px] mt-[40px] bg-secondary`}
      className={`bg-secondary `}
    >
      <div className={`bg-white containerclass mt-4 md:mt-0 md:bg-[#DEEBFC]`}>
        <Image
          className=""
          data-aos="slide-up"
          data-aos-once="true"
          data-aos-duration="1500"
          src={GoToVector}
          alt="user imag"
        />
      </div>

      <div className="containerclass">
        <div className="p-2 relative w-[95%] max-w-screen-2lg 3xl:max-w-xlg mx-auto">
          <div className="flex flex-col xmd:flex-row gap-10 pt-12 justify-between  border-b border-b-[#FFFFFF] relative text-white">
            <div className="md:w-[70%] xmd:w-[60%] flex flex-col justify-center gap-8">
              <h3 className="xl:text-[60px] xl:text-left xl:leading-[64px] lg:text-[56px] lg:leading-[59px] xmd:text-[40px] font-[500] text-left text-[36px] leading-[44px] font-aeonik">
                Everything your money needs, in one app
              </h3>
              <p className="font-[200]">
                With {appName}, your wallet does it all. Send money to any
                Nigerian bank in seconds, receive payments straight into your
                wallet, and pay every bill that matters — airtime, data, cable
                TV, and electricity. It&apos;s everything you need, in one app.
              </p>
              <Link
                href="/auth/login"
                className="bg-[#DCFFC7] text-[#071445FF] rounded-[4px] w-[220px] py-[18px] text-[16px] text-center font-[300]"
              >
                Download App
              </Link>
            </div>
            <div
              className="w-[50%] mb-[-1rem] md:w-[45%] md:mb-[-1.2rem] ml-auto mt-[-5rem] xmd:mt-[-6rem] xmd:mb-[-1.2rem]"
              data-aos="slide-up"
              data-aos-once="true"
              data-aos-duration="1500"
            >
              <Image src={GoToBoy} alt="boy" className="" />
            </div>
            {/* <div className='absolute right-0  top-[-4rem] bottom-0 w-[40%] h-[32.9rem]'>
              <img src={GoToBoy} alt="boy" className='' />
            </div> */}
          </div>
        </div>

        <div className="py-[63px] w-[95%] max-w-screen-2lg 3xl:max-w-xlg mx-auto">
          <div className="flex flex-wrap justify-between">
            {cardItems.map((item, index) => (
              <Card
                key={index}
                cardImage={item?.image}
                text={item?.text}
                imageWidth={item?.imageWidth}
                width={(item as any)?.width}
                height={(item as any)?.height}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Your_Go_To_App;
