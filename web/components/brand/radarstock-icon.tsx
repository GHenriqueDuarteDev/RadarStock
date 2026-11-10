import { cn } from "@/lib/utils";

type RadarStockIconProps = {
  className?: string;
  title?: string;
  /** Color that punches through the radar badge (parent background). */
  knockout?: string;
};

export function RadarStockIcon({
  className,
  title = "RadarStock",
  knockout = "#0a0a0a",
}: RadarStockIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-4", className)}
      role="img"
      aria-label={title}
    >
      <path
        d="M12 3.2 19.2 7.1v8.2L12 19.2 4.8 15.3V7.1L12 3.2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M12 3.2v16M4.8 7.1 12 11l7.2-3.9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="17.2" cy="6.2" r="4.1" fill="currentColor" />
      <circle
        cx="17.2"
        cy="6.2"
        r="2.35"
        stroke={knockout}
        strokeWidth="1.15"
        fill="none"
      />
      <circle cx="17.2" cy="6.2" r="0.85" fill={knockout} />
      <path
        d="M17.2 6.2 19.55 4.55"
        stroke={knockout}
        strokeWidth="1.15"
        strokeLinecap="round"
      />
    </svg>
  );
}
