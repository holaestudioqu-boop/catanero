import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes } from "react";
import { buttonClasses, type ButtonVariant } from "./buttonStyles";

type LinkButtonProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    variant?: ButtonVariant;
    fullWidth?: boolean;
  };

export function LinkButton({
  className,
  variant = "primary",
  fullWidth,
  ...props
}: LinkButtonProps) {
  return <Link className={buttonClasses(variant, fullWidth, className)} {...props} />;
}
