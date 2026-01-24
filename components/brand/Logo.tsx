"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "default" | "white" | "black";
  className?: string;
  href?: string;
}

export function Logo({ variant = "default", className, href = "/" }: LogoProps) {
  const Component = href ? Link : "div";
  const baseClasses = "font-serif text-2xl font-bold tracking-tight";

  const colorClasses = {
    default: "text-navy",
    white: "text-white",
    black: "text-charcoal",
  };

  return (
    <Component href={href} className={cn(baseClasses, colorClasses[variant], className)}>
      <span className="text-navy">Alpine</span>
      <span className="text-red">Crypto</span>
      <span className="text-navy"> Capital</span>
    </Component>
  );
}
