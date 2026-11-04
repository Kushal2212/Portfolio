import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_8px_28px_-14px_rgb(var(--shadow-color)/0.55)]",
        brand:
          "bg-brand-strong text-brand-foreground hover:bg-brand-strong/90 shadow-[0_10px_28px_-18px_rgb(var(--shadow-color)/0.45)]",
        outline:
          "border border-border bg-transparent hover:bg-muted hover:border-foreground/25",
        secondary: "bg-muted text-foreground hover:bg-muted/70",
        ghost: "hover:bg-muted text-foreground/80 hover:text-foreground",
        link: "text-brand underline-offset-4 hover:underline rounded-none",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 shadow-[0_10px_30px_-16px_rgba(200,50,40,0.7)]",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-8 px-3.5 text-xs",
        lg: "h-12 px-7 text-[0.95rem]",
        icon: "size-10",
        "icon-sm": "size-8",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
