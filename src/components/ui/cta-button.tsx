import Link from "next/link";

import { cn } from "@/lib/utils";

type CTAButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

export function CTAButton({
  href,
  children,
  variant = "primary",
  className,
}: CTAButtonProps) {
  const base =
    "site-button inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
  const styles = {
    primary:
      "shadow-lg shadow-emerald-950/15 focus-visible:ring-emerald-700",
    secondary:
      "focus-visible:ring-emerald-700",
    ghost:
      "focus-visible:ring-emerald-700",
  } as const;

  const isExternal = href.startsWith("http");

  if (isExternal) {
    return (
      <a
        className={cn(base, styles[variant], className)}
        href={href}
        rel="noreferrer"
        target="_blank"
      >
        {children}
      </a>
    );
  }

  return (
    <Link className={cn(base, styles[variant], className)} href={href}>
      {children}
    </Link>
  );
}
