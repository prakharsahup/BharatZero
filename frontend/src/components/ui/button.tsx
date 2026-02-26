import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold uppercase tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:      "bg-dark-bg text-white border border-white/20 hover:bg-lime hover:text-dark-bg",
        lime:         "bg-lime text-dark-bg border border-lime hover:brightness-110",
        outline:      "border border-input bg-transparent hover:bg-dark-bg hover:text-white",
        "outline-dark": "border border-white bg-transparent text-white hover:bg-white hover:text-dark-bg",
        ghost:        "hover:bg-sage/20 hover:text-foreground",
        secondary:    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:  "bg-cbam-red text-white hover:bg-cbam-red/90",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm:      "h-9 px-4 text-xs",
        lg:      "h-12 px-10 py-3 text-base",
        xl:      "h-14 px-12 py-4 text-base",
        icon:    "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size:    "default",
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
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
