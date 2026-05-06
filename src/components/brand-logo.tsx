import { User, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  iconClassName?: string;
  heartClassName?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function BrandLogo({ className, iconClassName, heartClassName, size = "md" }: BrandLogoProps) {
  const sizeClasses = {
    sm: { container: "size-10", icon: "size-5", heart: "size-4", heartIcon: "size-2" },
    md: { container: "size-12", icon: "size-6", heart: "size-5", heartIcon: "size-2.5" },
    lg: { container: "size-16", icon: "size-8", heart: "size-6", heartIcon: "size-3" },
    xl: { container: "size-20", icon: "size-10", heart: "size-8", heartIcon: "size-4" },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={cn("relative", className)}>
      <div className={cn(
        "flex items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-2xl shadow-primary/20 transform transition-transform hover:scale-105 duration-300",
        currentSize.container,
        iconClassName
      )}>
        <User className={currentSize.icon} />
      </div>
      <div className={cn(
        "absolute -bottom-1 -right-1 bg-white rounded-full flex items-center justify-center border-2 border-primary shadow-sm",
        currentSize.heart,
        heartClassName
      )}>
        <Heart className={cn("text-primary fill-primary", currentSize.heartIcon)} />
      </div>
    </div>
  );
}
