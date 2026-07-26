import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { GRADIENT_CLASSES } from "@/lib/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initials(firstName?: string | null, lastName?: string | null) {
  const a = firstName?.trim()?.[0] ?? "";
  const b = lastName?.trim()?.[0] ?? "";
  return `${a}${b}`.toUpperCase() || "?";
}

export function fullName(firstName?: string | null, lastName?: string | null) {
  return [firstName, lastName].filter(Boolean).join(" ").trim();
}

export function initialsFromName(name?: string | null) {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  return `${parts[0]?.[0] ?? ""}${parts.length > 1 ? parts.at(-1)?.[0] ?? "" : ""}`.toUpperCase() || "?";
}

export function splitFullName(name?: string | null): [string, string] {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  return [parts[0] ?? "", parts.slice(1).join(" ")];
}

/** Deterministic pastel gradient assignment so the same entity always gets the same look. */
export function gradientFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % GRADIENT_CLASSES.length;
  return GRADIENT_CLASSES[idx];
}

const MONTHS_UZ = [
  "yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr",
];

export function formatDateUz(input: string | Date | null | undefined) {
  if (!input) return "";
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getDate()} ${MONTHS_UZ[date.getMonth()]}, ${date.getFullYear()}`;
}

export function formatDateTimeUz(input: string | Date | null | undefined) {
  if (!input) return "";
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return "";
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${formatDateUz(date)}, ${hh}:${mm}`;
}

export function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return "0";
  return new Intl.NumberFormat("uz-UZ").format(value);
}

export function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

export function rankDelta(current?: number | null, previous?: number | null) {
  if (current == null || previous == null) return 0;
  return previous - current; // positive = moved up
}
