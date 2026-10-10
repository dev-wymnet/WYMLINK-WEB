import Link from "next/link";
import { appName } from "@/data/constants/app_name";

const Not_Found = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="text-muted-foreground max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or may have been
        moved. Let&apos;s get you back to moving money with {appName}.
      </p>
      <Link
        href="/"
        className="mt-4 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
      >
        Back to home
      </Link>
    </div>
  );
};

export default Not_Found;
