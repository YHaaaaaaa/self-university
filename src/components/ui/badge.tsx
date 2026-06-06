import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "default" | "success" | "warning" | "danger" | "outline";
  className?: string;
  children: React.ReactNode;
}

export function Badge({ variant = "default", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        {
          "bg-muted text-muted-foreground": variant === "default",
          "bg-green-50 text-success": variant === "success",
          "bg-amber-50 text-warning": variant === "warning",
          "bg-red-50 text-danger": variant === "danger",
          "border border-border text-muted-foreground": variant === "outline",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
