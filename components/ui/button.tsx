import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "subtle" | "destructive";

export function buttonClass(variant: ButtonVariant = "secondary", fullWidth = false) {
  return cn(`${variant}-button`, fullWidth && "button--full");
}

export function Button({
  variant = "secondary",
  fullWidth = false,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}) {
  return <button className={cn(buttonClass(variant, fullWidth), className)} {...props} />;
}
