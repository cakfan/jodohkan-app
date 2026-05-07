import { User, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  iconClassName?: string;
  heartClassName?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function BrandLogo({
  className,
  iconClassName,
  heartClassName,
  size = "md",
}: BrandLogoProps) {
  const sizeClasses = {
    sm: { container: "size-10", icon: "size-5", heart: "size-4", heartIcon: "size-2" },
    md: { container: "size-12", icon: "size-6", heart: "size-5", heartIcon: "size-2.5" },
    lg: { container: "size-16", icon: "size-8", heart: "size-6", heartIcon: "size-3" },
    xl: { container: "size-20", icon: "size-10", heart: "size-8", heartIcon: "size-4" },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "bg-primary text-primary-foreground shadow-primary/20 flex transform items-center justify-center rounded-2xl shadow-2xl transition-transform duration-300 hover:scale-105",
          currentSize.container,
          iconClassName
        )}
      >
        <User className={currentSize.icon} />
      </div>
      <div
        className={cn(
          "border-primary absolute -right-1 -bottom-1 flex items-center justify-center rounded-full border-2 bg-white shadow-sm",
          currentSize.heart,
          heartClassName
        )}
      >
        <Heart className={cn("text-primary fill-primary", currentSize.heartIcon)} />
      </div>
    </div>
  );
}
