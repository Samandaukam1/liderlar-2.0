import Image from "next/image";
import { cn } from "@/lib/utils";
import { initials as getInitials } from "@/lib/utils";

const SIZES = {
  sm: "h-9 w-9 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-base",
  xl: "h-24 w-24 text-xl",
} as const;

export function Avatar({
  src,
  firstName,
  lastName,
  size = "md",
  className,
}: {
  src?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full bg-gradient-blue font-display-alt text-white",
        "flex items-center justify-center",
        SIZES[size],
        className
      )}
    >
      {src ? (
        <Image src={src} alt={`${firstName ?? ""} ${lastName ?? ""}`.trim()} fill sizes="96px" className="object-cover" />
      ) : (
        <span>{getInitials(firstName, lastName)}</span>
      )}
    </div>
  );
}
