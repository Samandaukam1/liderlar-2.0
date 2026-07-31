import { headers } from "next/headers";
import { SITE_URL } from "@/lib/constants";

/**
 * SITE_URL falls back to a localhost default whenever NEXT_PUBLIC_SITE_URL
 * isn't set for the current deployment. QR codes and share links must never
 * point at localhost in production, so derive the real origin from the
 * incoming request in that case instead.
 */
export async function resolveSiteUrl(): Promise<string> {
  if (!SITE_URL.includes("localhost")) return SITE_URL;
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (!host) return SITE_URL;
    const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  } catch {
    return SITE_URL;
  }
}
