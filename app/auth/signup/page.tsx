import Link from "next/link";
import type { Metadata } from "next";
import { AuthLayout } from "@/components/app/auth_layout";
import { SignUpForm } from "@/features/auth/components/sign_up";

export const metadata: Metadata = { title: "Create your account" };

export default function SignupPage() {
  return (
    <AuthLayout
      photo={{ src: "/assets/people/family.webp", alt: "A family of six sitting together on steps" }}
      title="Create your account"
      subtitle="It takes about two minutes. Free to open."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-brand-600 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthLayout>
  );
}
