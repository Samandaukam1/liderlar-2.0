import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-blue text-white shadow-[0_12px_30px_rgba(5,151,198,0.22)] hover:brightness-[0.97] hover:shadow-[0_16px_38px_rgba(5,151,198,0.32)] hover:-translate-y-0.5",
        secondary:
          "bg-paper text-navy border border-brand-soft hover:border-liderlar-blue/60 hover:-translate-y-0.5 shadow-card",
        ghost: "bg-transparent text-navy hover:bg-liderlar-blue/8",
        outline:
          "bg-transparent border border-liderlar-blue/40 text-liderlar-blue hover:bg-liderlar-blue/8",
        danger: "bg-coral text-white hover:brightness-95",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-[0.95rem]",
        lg: "h-13 px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = "Button";

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  "aria-label": string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = "secondary", size = "icon", ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), "rounded-full", className)} {...props} />
  )
);
IconButton.displayName = "IconButton";

export interface LinkButtonProps
  extends React.ComponentProps<typeof Link>,
    VariantProps<typeof buttonVariants> {}

export function LinkButton({ className, variant, size, ...props }: LinkButtonProps) {
  return <Link className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
