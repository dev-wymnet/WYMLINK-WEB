// src/components/SeoHelmet.js
import React from "react";
import { Helmet } from "react-helmet";
import appName from "../constants/data/App_Name";

const Seo = ({
  title = `${appName} | Send Money & Pay Bills in Nigeria`,
  description = `${appName} is the smarter way to move money in Nigeria. Send money instantly from your ${appName} wallet to any Nigerian bank account, receive money, and pay bills — airtime, data, cable TV and electricity — all in one app.`,
  keywords = `${appName}, send money Nigeria, money transfer Nigeria, NGN wallet, bank transfer app Nigeria, receive money Nigeria, pay bills online Nigeria, buy airtime online, buy data bundles, cable TV subscription payment, electricity bill payment, instant bank transfer, fintech Nigeria, digital wallet Nigeria, bill payment app`,
  url = "https://www.wymlink.com",
  image = "https://www.wymlink.com/wymlink-icon.png",
}) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta name="keywords" content={keywords} />

    {/* Open Graph / Facebook */}
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content={url} />
    <meta property="og:image" content={image} />

    {/* Twitter */}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={image} />
  </Helmet>
);

export default Seo;
