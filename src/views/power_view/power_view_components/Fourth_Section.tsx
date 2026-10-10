import React from 'react'
import Flex_With_Bg from '../../../components/Flex_With_Bg'
import { Amina } from '../../../assets'
import Full_Flex from '../../../components/Full_Flex'
import appName from '../../../constants/data/App_Name'

const Fourth_Section = () => {
  return (
    <>
      <Full_Flex 
        img={Amina} 
        title={`Amina’s Smart Move: Keeping the Lights on`}
        details={`Amina is a busy professional with tons of bills to pay and very little time to spare. When she runs out of electricity units, Amina relies on ${appName} for quick, seamless electricity top-ups. For Amina, the convenience offered by ${appName} is why she won’t use any other app. Be like Amina. Experience ${appName}!`} 
        btnText={`Join Amina`}
        styles={
            {
                bg: "bg-[#753FF6]",
                textbg: "bg-[#E0D2FF]"
            }
        }        
      />
    </>
  )
}

export default Fourth_Section