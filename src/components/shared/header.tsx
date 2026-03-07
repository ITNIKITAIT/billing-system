"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Users } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/clients", label: "Clients", icon: Users },
] as const;

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border pb-4 mb-6">
      <nav className="flex items-center gap-1" aria-label="Main navigation">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
