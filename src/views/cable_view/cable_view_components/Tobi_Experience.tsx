import React from 'react'
import { EasyMangeImage } from '../../../assets'
import Full_Flex from '../../../components/Full_Flex'
import appName from '../../../constants/data/App_Name'
const Tobi_Experience = () => {
  return (
    <>
        <Full_Flex 
          img={EasyMangeImage} 
          title="Tobi's Smart Move: Paying for TV Cable in Style"
          details={`Experience the smart choice in payments with the ${appName} app, as exemplified by Tobi who, paying for his TV cable in style, enjoyed instant transactions, enhanced security, and a user-friendly interface, inviting you to join the ${appName} Movement for a uniquely seamless financial experience.`} 
          btnText={'Join Tobi'}
          styles={
              {
                  bg: "bg-[#0B40EE]",
                  textbg: "bg-[#CDF2FC]"
              }
          }        
        />
    </>
  )
}

export default Tobi_Experience