"use client";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

export function ClientsPageHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
        <p className="text-muted-foreground">
          Manage agency clients, plans, and discounts.
        </p>
      </div>
      <Link href="/clients/new" className={buttonVariants()}>
        <PlusIcon className="size-4" />
        Add client
      </Link>
    </div>
  );
}
