import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const badgeVariants = cva(
  "inline-flex items-center rounded-none border-2 px-2 py-0.5 font-mono text-[0.65rem] font-bold uppercase tracking-wider shadow-[inset_1px_1px_0_0_rgba(255,255,255,0.35),inset_-1px_-1px_0_0_rgba(0,0,0,0.2)]",
  {
    variants: {
      variant: {
        default:
          "border-foreground/40 bg-muted text-foreground",
        success:
          "border-success/40 bg-success/15 text-success",
        destructive:
          "border-critical/40 bg-critical/15 text-critical",
        primary:
          "border-primary/40 bg-primary/15 text-primary",
        warning:
          "border-warning/40 bg-warning/20 text-warning-foreground",
        entrada:
          "border-transparent bg-tag-entrada text-tag-entrada-foreground",
        saida:
          "border-transparent bg-tag-saida text-tag-saida-foreground",
        pending:
          "border-transparent bg-tag-pending text-tag-pending-foreground",
      },
      size: {
        default: "px-2 py-0.5 text-[0.65rem]",
        sm: "px-1.5 py-0 text-[0.6rem]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Badge({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
