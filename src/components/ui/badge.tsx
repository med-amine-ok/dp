import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide transition-all focus:outline-none focus:ring-2 focus:ring-ring/55 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/95 text-primary-foreground hover:bg-primary/88",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/85",
        destructive: "border-transparent bg-destructive/95 text-destructive-foreground hover:bg-destructive/88",
        outline: "text-foreground bg-background/80 border-border/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
