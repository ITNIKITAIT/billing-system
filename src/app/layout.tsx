import type { Metadata } from "next";
import "./globals.css";
import { Raleway } from "next/font/google";
import { cn } from "@/lib/utils";
import NextTopLoader from "nextjs-toploader";

const raleway = Raleway({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Billing System",
  description: "Grow My Ads billing system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", raleway.variable)}>
      <body className="antialiased">
        <NextTopLoader color="#097969" height={3} showSpinner={false} />
        <main className="min-h-screen p-8">
          <div className="mx-auto max-w-5xl space-y-6">{children}</div>
        </main>
      </body>
    </html>
  );
}
