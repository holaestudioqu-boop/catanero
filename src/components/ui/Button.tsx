import { type ButtonHTMLAttributes, forwardRef } from "react";
import { buttonClasses, type ButtonVariant } from "./buttonStyles";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", fullWidth, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={buttonClasses(variant, fullWidth, className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
