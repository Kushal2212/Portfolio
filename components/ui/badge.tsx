import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide transition-colors whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "border-transparent bg-muted text-foreground/80",
        brand: "border-brand/30 bg-brand/10 text-brand",
        outline: "border-border text-muted-foreground",
        success: "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        warning: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-400",
        danger: "border-red-500/25 bg-red-500/10 text-red-600 dark:text-red-400",
        violet: "border-violet-500/25 bg-violet-500/10 text-violet-600 dark:text-violet-400",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
