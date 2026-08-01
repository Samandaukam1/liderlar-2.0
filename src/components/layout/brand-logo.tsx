import Image from "next/image";
import { cn } from "@/lib/utils";

const LOGO_SRC = {
  light: "/assets/brand/ozbekiston-lider-yoshlari/logo-light-transparent.png",
  dark: "/assets/brand/ozbekiston-lider-yoshlari/logo-dark-transparent.png",
} as const;

// Intrinsic size of the source asset — used only to give Next/Image a
// correct aspect ratio; actual display size is controlled by className.
const LOGO_WIDTH = 1920;
const LOGO_HEIGHT = 650;

/**
 * Brand wordmark. `variant="light"` (dark wordmark) belongs on light
 * surfaces, `variant="dark"` (white wordmark) on dark surfaces — pick
 * whichever keeps contrast against the surface it sits on. The phoenix mark
 * is baked into the asset at a fixed cyan, so it never changes with a CSS
 * filter.
 */
export function BrandLogo({
  variant,
  className,
  priority,
  alt = "",
}: {
  variant: "light" | "dark";
  className?: string;
  priority?: boolean;
  /** Defaults to "" (decorative) — set this when the logo isn't already inside an aria-labelled link. */
  alt?: string;
}) {
  return (
    <Image
      src={LOGO_SRC[variant]}
      alt={alt}
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      priority={priority}
      className={cn("w-auto object-contain", className)}
    />
  );
}
