import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthLayout } from "@/components/app/auth_layout";
import { SignInForm } from "@/features/auth/components/sign_in";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your Wymlink account."
      footer={
        <>
          New to Wymlink?{" "}
          <Link href="/auth/signup" className="font-medium text-brand-600 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <Suspense>
        <SignInForm />
      </Suspense>
    </AuthLayout>
  );
}
