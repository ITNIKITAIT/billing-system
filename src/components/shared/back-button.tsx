"use client";
import Link from "next/link";
import { buttonVariants } from "../ui/button";
import { ChevronLeft } from "lucide-react";

export function BackButton({ href }: { href: string }) {
  return (
    <Link href={href} className={buttonVariants({ variant: "ghost" })}>
      <ChevronLeft /> Back
    </Link>
  );
}
