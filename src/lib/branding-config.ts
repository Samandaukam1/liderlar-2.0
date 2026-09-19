/**
 * BRENDING — ADMIN PANELDAN.
 *
 * Favicon va ikonkalar admin panelda yuklanadi va `site_settings`
 * ga yoziladi. Bu jadval ommaviy o'qiladi (`0008_storage_and_rls.sql`
 * dagi "site settings are public" siyosati), shuning uchun sayt ham
 * AYNAN o'sha qiymatlarni oladi — ikkita brending sozlamasi
 * bo'lmaydi va ular bir-biridan ajralib ketmaydi.
 *
 * SOF MODUL — bazaga bormaydi, shuning uchun kalitlar va o'qish
 * qoidalari haqiqiy testlar bilan qoplanadi.
 *
 * KALITLAR — IKKI REPO ORASIDAGI SHARTNOMA. Ular admin tomondagi
 * `src/lib/branding/config.ts` bilan bir xil bo'lishi SHART; nomi
 * o'zgarsa, sayt jimgina standart belgiga qaytadi va buni hech kim
 * sezmaydi. Shuning uchun test ularni qat'iy tekshiradi.
 */

export const BRANDING_ICON_KEYS: Readonly<Record<number, string>> = {
  16: "branding_icon_16_url",
  32: "branding_icon_32_url",
  180: "branding_icon_180_url",
  192: "branding_icon_192_url",
  512: "branding_icon_512_url",
};

export const BRANDING_VERSION_KEY = "branding_version";

export interface SiteBranding {
  /** O'lcham -> URL. Bo'sh bo'lsa standart favicon qoladi. */
  icons: Record<number, string>;
  version: string | null;
}

export const EMPTY_SITE_BRANDING: SiteBranding = { icons: {}, version: null };

/**
 * Kesh buzuvchi qo'shimcha.
 *
 * Brauzer favicon'ni juda uzoq keshlaydi: versiyasiz yangi logo
 * haftalab ko'rinmay qolishi mumkin.
 */
export function versioned(url: string, version: string | null): string {
  if (!version) return url;
  return url.includes("?") ? `${url}&v=${version}` : `${url}?v=${version}`;
}

export function parseSiteBranding(
  values: Record<string, string | null | undefined>,
): SiteBranding {
  const read = (key: string): string | null => {
    const value = values[key];
    // Bo'sh satr YO'Q deb qaraladi: sozlama tozalanganda qator
    // o'chirilmay, qiymati bo'shatilishi mumkin.
    return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
  };

  const icons: Record<number, string> = {};
  for (const [size, key] of Object.entries(BRANDING_ICON_KEYS)) {
    const url = read(key);
    if (url) icons[Number(size)] = url;
  }
  return { icons, version: read(BRANDING_VERSION_KEY) };
}

/** Next `metadata.icons` uchun tayyor shakl. */
export function buildIconsMetadata(branding: SiteBranding) {
  const sizes = Object.keys(branding.icons).map(Number).sort((a, b) => a - b);
  if (sizes.length === 0) {
    // Maxsus ikonka yo'q — `public/favicon.ico` zaxira bo'lib qoladi.
    return { icon: "/favicon.ico", shortcut: "/favicon.ico" };
  }

  return {
    icon: sizes
      .filter((size) => size <= 192)
      .map((size) => ({
        url: versioned(branding.icons[size], branding.version),
        sizes: `${size}x${size}`,
        type: "image/png",
      })),
    apple: branding.icons[180]
      ? [{ url: versioned(branding.icons[180], branding.version), sizes: "180x180" }]
      : undefined,
    shortcut: branding.icons[32]
      ? versioned(branding.icons[32], branding.version)
      : "/favicon.ico",
  };
}
