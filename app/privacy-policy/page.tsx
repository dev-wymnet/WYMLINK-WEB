"use client";

import { Fragment } from "react";
import Nav_Bar from "@/src/components/layout/Nav_bar";
import Footer from "@/src/components/layout/Footer";
import { appName } from "@/data/constants/app_name";

export default function PrivacyPolicyPage() {
  return (
    <Fragment>
      <Nav_Bar
        bgColor="bg-[#DCFFC7]"
        logoColor="black"
        linkColor="text-black"
        linkDColor="text-black"
        personalStyle="bg-[#0B40EE] text-[#DCFFC7]"
        iconColor="text-black"
        disableScrollStyleChange
      />

      <main className="containerclass max-w-screen-lg md:max-w-screen-xl w-[90%] mx-auto pt-28 pb-20">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-secondary">Privacy Policy</h1>
          <p className="text-sm text-muted mt-2 flex flex-wrap gap-2">
            <span>Effective Date:  9/15/2026</span>
            <span className="hidden md:inline">•</span>
            <span>Last Updated:  9/15/2026</span>
          </p>
        </header>

        <section className="prose prose-slate max-w-none">
          <p className="text-base leading-7 text-secondary">
            This Privacy Policy explains how {appName} collects, uses, stores, and protects information when you use the {appName} web application and related services.
          </p>
        </section>

        <div className="mt-8 space-y-6">
          <section className="bg-surface border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold text-secondary mb-3">Information We Collect</h2>
            <p className="mb-3 text-secondary/90">
              We may collect the following categories of information when you use {appName}:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-secondary/90">
              <li>Personal information</li>
              <li>Contact information</li>
              <li>Account information</li>
              <li>Transaction and wallet information</li>
              <li>Device and technical information</li>
              <li>Usage information</li>
              <li>Information provided when contacting support</li>
            </ul>
          </section>

          <section className="bg-surface border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold text-secondary mb-3">How We Use Information</h2>
            <p className="mb-3 text-secondary/90">We use information to:</p>
            <ul className="list-disc pl-5 space-y-1 text-secondary/90">
              <li>Create and manage user accounts</li>
              <li>Provide wallet and bill-payment services</li>
              <li>Process transactions</li>
              <li>Verify users and help prevent fraud</li>
              <li>Provide customer support</li>
              <li>Improve and optimize the application</li>
              <li>Perform security and operational monitoring</li>
              <li>Meet legal and regulatory requirements</li>
            </ul>
          </section>

          <section className="bg-surface border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold text-secondary mb-3">Financial and Transaction Information</h2>
            <p className="text-secondary/90">
              To provide financial and bill-payment services, we may process wallet details, transaction information, payment metadata, and beneficiary information to execute and record transactions and to meet applicable obligations.
            </p>
          </section>

          <section className="bg-surface border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold text-secondary mb-3">Information Sharing</h2>
            <p className="mb-3 text-secondary/90">
              We may share information as necessary to provide the services or as required by law, including with:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-secondary/90">
              <li>Payment and financial service providers</li>
              <li>Telecom and bill-payment providers</li>
              <li>Service providers that support our operations</li>
              <li>Regulators and government authorities where legally required</li>
              <li>Security, fraud-prevention, or legal-service providers</li>
            </ul>
            <p className="mt-3 text-secondary/90">We do not sell personal information.</p>
          </section>

          <section className="bg-surface border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold text-secondary mb-3">Data Security</h2>
            <p className="text-secondary/90">
              We use reasonable technical and organizational measures designed to protect information. However, no internet-based system can guarantee absolute security.
            </p>
          </section>

          <section className="bg-surface border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold text-secondary mb-3">Data Retention</h2>
            <p className="text-secondary/90">
              We may retain information for as long as necessary to provide services, maintain records, resolve disputes, prevent fraud, and comply with applicable legal obligations.
            </p>
          </section>

          <section className="bg-surface border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold text-secondary mb-3">User Rights and Choices</h2>
            <p className="mb-3 text-secondary/90">Depending on your jurisdiction and applicable law, you may have options to:</p>
            <ul className="list-disc pl-5 space-y-1 text-secondary/90">
              <li>Access personal information</li>
              <li>Request correction of information</li>
              <li>Request deletion where legally applicable</li>
              <li>Manage your account information and preferences</li>
              <li>Contact {appName} regarding privacy concerns</li>
            </ul>
          </section>

          <section className="bg-surface border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold text-secondary mb-3">Cookies and Similar Technologies</h2>
            <p className="text-secondary/90">
              Some associated web services may use cookies or similar technologies. This website may use such technologies where applicable. Please refer to any relevant cookie notices.
            </p>
          </section>

          <section className="bg-surface border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold text-secondary mb-3">Third-Party Services</h2>
            <p className="text-secondary/90">
              {appName} may integrate with third-party providers to deliver certain features. These providers may process information according to their own privacy policies.
            </p>
          </section>

          <section className="bg-surface border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold text-secondary mb-3">Children&apos;s Privacy</h2>
            <p className="text-secondary/90">The service is not intended for children.</p>
          </section>

          <section className="bg-surface border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold text-secondary mb-3">Changes to This Privacy Policy</h2>
            <p className="text-secondary/90">
              We may update this Privacy Policy periodically. The updated version will be made available through the application. Continued use of the services after changes means you accept the updated policy.
            </p>
          </section>

          <section className="bg-surface border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold text-secondary mb-3">Contact Us</h2>
            <p className="text-secondary/90">
              If you have questions or requests regarding this Privacy Policy, contact us at: [Privacy Contact Email]
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </Fragment>
  );
}
