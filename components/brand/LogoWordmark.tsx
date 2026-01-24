"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoWordmarkProps {
  variant?: "default" | "white" | "black";
  className?: string;
  href?: string;
}

export function LogoWordmark({ variant = "default", className, href = "/" }: LogoWordmarkProps) {
  const Component = href ? Link : "div";
  
  const textColor = {
    default: "text-navy",
    white: "text-white",
    black: "text-charcoal",
  }[variant];

  return (
    <Component href={href} className={cn("inline-flex items-baseline gap-1", className)}>
      <svg
        viewBox="0 0 400 60"
        className="h-8 w-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <text
          x="0"
          y="45"
          className={cn("font-serif text-4xl font-bold fill-current", textColor)}
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          Alpine
        </text>
        <text
          x="120"
          y="45"
          className="font-serif text-4xl font-bold fill-red"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          Crypto
        </text>
        <text
          x="220"
          y="45"
          className={cn("font-serif text-4xl font-bold fill-current", textColor)}
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          Capital
        </text>
      </svg>
    </Component>
  );
}
