import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-none border border-transparent bg-clip-padding font-mono text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-[transform,filter,box-shadow,background-color,color,border-color] outline-none select-none [clip-path:polygon(0_0,calc(100%-10px)_0,100%_10px,100%_100%,10px_100%,0_calc(100%-10px))] shadow-[inset_1px_1px_0_0_rgba(255,255,255,0.55),inset_-1px_-1px_0_0_rgba(0,0,0,0.4)] drop-shadow-[2px_2px_0_oklch(0.22_0_0)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:not-aria-[haspopup]:translate-[1px_1px] active:not-aria-[haspopup]:shadow-[inset_1px_1px_0_0_rgba(0,0,0,0.45),inset_-1px_-1px_0_0_rgba(255,255,255,0.35)] active:not-aria-[haspopup]:drop-shadow-[1px_1px_0_oklch(0.22_0_0)] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:outline-2 aria-invalid:outline-offset-2 aria-invalid:outline-destructive/20 dark:aria-invalid:outline-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-[color-mix(in_oklch,var(--primary),white_12%)]",
        outline:
          "border-2 border-foreground/80 bg-card text-foreground hover:bg-muted aria-expanded:bg-muted aria-expanded:text-foreground",
        secondary:
          "border-2 border-foreground/50 bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_8%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "border border-dashed border-foreground/35 bg-transparent text-foreground shadow-none drop-shadow-none hover:border-solid hover:border-foreground/60 hover:bg-muted hover:shadow-[inset_1px_1px_0_0_rgba(255,255,255,0.55),inset_-1px_-1px_0_0_rgba(0,0,0,0.4)] hover:drop-shadow-[2px_2px_0_oklch(0.22_0_0)] aria-expanded:bg-muted aria-expanded:text-foreground",
        destructive:
          "bg-destructive text-white hover:bg-[color-mix(in_oklch,var(--destructive),white_10%)] focus-visible:outline-destructive",
        link: "[clip-path:none] border-transparent bg-transparent p-0 text-primary shadow-none drop-shadow-none underline-offset-4 hover:underline hover:decoration-dashed focus-visible:outline-none focus-visible:underline focus-visible:decoration-dashed active:translate-none active:shadow-none active:drop-shadow-none",
      },
      size: {
        default:
          "h-8 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        xs: "h-6 gap-1 px-2 text-[0.65rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 px-2.5 text-[0.7rem] has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-3.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-8",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
