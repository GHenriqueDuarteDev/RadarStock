import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-none border-2 border-foreground bg-card px-3 py-2 font-mono text-base shadow-[inset_1px_1px_0_0_rgba(0,0,0,0.25),inset_-1px_-1px_0_0_rgba(255,255,255,0.55)] transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:font-sans file:text-sm file:font-medium file:text-foreground placeholder:font-sans placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:outline-2 aria-invalid:outline-destructive md:text-sm dark:bg-card dark:disabled:bg-muted/50 dark:aria-invalid:border-destructive/50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
