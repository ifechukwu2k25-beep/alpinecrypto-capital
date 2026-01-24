"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  children: ReactNode;
  className?: string;
  asChild?: boolean;
  href?: string;
}

export function Button({
  variant = "primary",
  children,
  className,
  asChild,
  href,
  ...props
}: ButtonProps) {
  const baseClasses = "px-6 py-3 font-semibold rounded-md transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center";

  const variantClasses = {
    primary: "bg-red text-white hover:bg-red-600 hover:shadow-lg",
    secondary: "bg-transparent border-2 border-navy text-navy hover:bg-navy hover:text-white",
    ghost: "bg-transparent text-navy hover:text-red hover:bg-offwhite",
  };

  if (asChild && href) {
    return (
      <Link
        href={href}
        className={cn(baseClasses, variantClasses[variant], className)}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
