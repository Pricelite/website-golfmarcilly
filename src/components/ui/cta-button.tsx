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
    "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
  const styles = {
    primary:
      "bg-emerald-900 text-stone-50 shadow-lg shadow-emerald-950/15 hover:-translate-y-0.5 hover:bg-emerald-800 focus-visible:ring-emerald-700",
    secondary:
      "border border-emerald-950/15 bg-white/85 text-emerald-950 hover:bg-white focus-visible:ring-emerald-700",
    ghost:
      "text-emerald-950 underline decoration-emerald-700/35 underline-offset-4 hover:decoration-emerald-950",
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
