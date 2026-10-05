import dynamic from "next/dynamic";
import type { ThemeKey } from "@/lib/themes/registry";
import type { ThemeExtras, ThemeProfile } from "@/lib/themes/types";

/**
 * DIZAYN YUKLOVCHI.
 *
 * §11 va §49: har bir dizayn DINAMIK yuklanadi, ya'ni foydalanuvchi
 * tanlagan bitta dizayn paketga tushadi — o'ntasi emas. Hammasini
 * tepada statik import qilsak, har profil sahifasi barcha
 * dizaynlarning kodini yuklab olardi.
 *
 * `dynamic()` MODUL DARAJASIDA chaqiriladi, komponent ichida emas:
 * ichida chaqirilsa, har renderda YANGI komponent turi yasalardi va
 * React butun daraxtni qaytadan qurardi (`react-hooks/static-components`
 * shuni ushlaydi).
 *
 * `classic` BU YERDA YO'Q: u mavjud sahifaning o'zi, alohida komponent
 * emas. Shuning uchun chaqiruvchi avval `hasThemeComponent` bilan
 * so'raydi va `false` bo'lsa, o'zining standart ko'rinishini
 * ko'rsatadi.
 */

const ImperialGold = dynamic(() => import("./imperial-gold"));
const Obsidian = dynamic(() => import("./obsidian"));
const IvoryEditorial = dynamic(() => import("./ivory-editorial"));
const SilverExecutive = dynamic(() => import("./silver-executive"));
const RoyalNavy = dynamic(() => import("./royal-navy"));
const MonochromeSignature = dynamic(() => import("./monochrome-signature"));
const EmeraldLegacy = dynamic(() => import("./emerald-legacy"));
const AuroraGlass = dynamic(() => import("./aurora-glass"));
const Zarafshon = dynamic(() => import("./zarafshon"));
const CrimsonPrestige = dynamic(() => import("./crimson-prestige"));

/**
 * Komponenti qurilgan dizaynlar.
 *
 * Reyestrdagi `ready: true` bilan MOS bo'lishi kerak va buni test
 * qo'riqlaydi: `ready` bo'lib komponenti yo'q dizayn tanlanganda
 * sahifa bo'sh chiqardi.
 */
const IMPLEMENTED: readonly ThemeKey[] = [
  "imperial-gold",
  "obsidian",
  "ivory-editorial",
  "silver-executive",
  "royal-navy",
  "monochrome-signature",
  "emerald-legacy",
  "aurora-glass",
  "zarafshon",
  "crimson-prestige",
];

export function hasThemeComponent(key: ThemeKey): boolean {
  return IMPLEMENTED.includes(key);
}

export function implementedThemeKeys(): readonly ThemeKey[] {
  return IMPLEMENTED;
}

/**
 * Qaysi dizayn qanday qo'shimcha ma'lumotni o'zi ko'rsatadi.
 *
 * Sahifa faqat shu ro'yxatdagini yuklaydi — boshqa dizaynlar ortiqcha
 * so'rov qilmaydi. `promoCode: true` bo'lsa, dizayn promo kodni o'z
 * uslubida chizadi va sahifa umumiy promo blokini qo'shmaydi.
 */
export interface ThemeExtrasNeeds {
  portraitCutout: boolean;
  promoCode: boolean;
  journalArticles: boolean;
  podcasts: boolean;
}

const NO_EXTRAS: ThemeExtrasNeeds = {
  portraitCutout: false,
  promoCode: false,
  journalArticles: false,
  podcasts: false,
};

export function themeExtrasFor(key: ThemeKey): ThemeExtrasNeeds {
  if (key === "imperial-gold") {
    return { portraitCutout: true, promoCode: true, journalArticles: true, podcasts: true };
  }
  if (key === "emerald-legacy") {
    return { portraitCutout: true, promoCode: true, journalArticles: true, podcasts: true };
  }
  if (key === "aurora-glass") {
    return { portraitCutout: true, promoCode: true, journalArticles: true, podcasts: true };
  }
  if (key === "ivory-editorial") {
    return { portraitCutout: true, promoCode: true, journalArticles: true, podcasts: true };
  }
  if (key === "obsidian") {
    return { portraitCutout: true, promoCode: true, journalArticles: true, podcasts: true };
  }
  if (key === "royal-navy") {
    return { portraitCutout: true, promoCode: true, journalArticles: true, podcasts: true };
  }
  if (key === "silver-executive") {
    return { ...NO_EXTRAS, journalArticles: true, podcasts: true };
  }
  return NO_EXTRAS;
}

/**
 * Dizaynni ko'rsatadi.
 *
 * `switch` ATAYLAB: xaritadan komponent olib, uni o'zgaruvchi orqali
 * JSX'da chaqirish React uchun "render paytida yasalgan komponent"
 * bo'lib ko'rinadi. `switch` da esa har tarmoqda havola barqaror.
 */
export function ThemeRenderer({
  themeKey,
  profile,
  extras,
}: {
  themeKey: ThemeKey;
  profile: ThemeProfile;
  extras?: ThemeExtras;
}) {
  switch (themeKey) {
    case "imperial-gold":
      return <ImperialGold profile={profile} extras={extras} />;
    case "obsidian":
      return <Obsidian profile={profile} extras={extras} />;
    case "ivory-editorial":
      return <IvoryEditorial profile={profile} extras={extras} />;
    case "silver-executive":
      return <SilverExecutive profile={profile} extras={extras} />;
    case "royal-navy":
      return <RoyalNavy profile={profile} extras={extras} />;
    case "monochrome-signature":
      return <MonochromeSignature profile={profile} />;
    case "emerald-legacy":
      return <EmeraldLegacy profile={profile} extras={extras} />;
    case "aurora-glass":
      return <AuroraGlass profile={profile} extras={extras} />;
    case "zarafshon":
      return <Zarafshon profile={profile} />;
    case "crimson-prestige":
      return <CrimsonPrestige profile={profile} />;
    default:
      /*
       * Noma'lum yoki qurilmagan dizayn — hech narsa ko'rsatilmaydi.
       *
       * Chaqiruvchi bu holatga tushmasligi kerak (`hasThemeComponent`
       * bilan tekshiradi), lekin tushsa ham sahifa yiqilmaydi.
       */
      return null;
  }
}
