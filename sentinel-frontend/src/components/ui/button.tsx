import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/40 hover:shadow-xl hover:shadow-primary/60 hover:scale-105 shimmer",
        destructive:
          "bg-gradient-to-r from-destructive to-destructive/80 text-white shadow-lg shadow-destructive/40 hover:shadow-xl hover:shadow-destructive/60",
        outline:
          "border-2 border-primary/40 bg-transparent hover:bg-primary/10 hover:border-primary text-primary hover:scale-105",
        secondary:
          "bg-gradient-to-r from-secondary to-secondary/80 text-white shadow-lg shadow-secondary/40 hover:shadow-xl hover:shadow-secondary/60 hover:scale-105",
        ghost: "hover:bg-primary/10 hover:text-primary",
        link: "text-primary underline-offset-4 hover:underline",
        glow: "bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] text-white shadow-2xl shadow-primary/50 hover:shadow-primary/70 animate-shimmer hover:scale-105",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-13 rounded-xl px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

