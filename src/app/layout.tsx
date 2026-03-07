import type { Metadata } from "next";
import "./globals.css";
import { Geist, Raleway } from "next/font/google";
import { cn } from "@/lib/utils";

const raleway = Raleway({subsets:['latin'],variable:'--font-sans'});

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
      <body className="antialiased">{children}</body>
    </html>
  );
}
