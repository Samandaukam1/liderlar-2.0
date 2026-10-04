/**
 * PREMIUM DIZAYN REYESTRI — SOF MODUL.
 *
 * §11: o'n xil sahifa nusxasi EMAS. Barcha dizaynlar BIR XIL
 * normallashgan ma'lumotni oladi; faqat ko'rinish farq qiladi.
 *
 * BU FAYLDA KOMPONENT YO'Q — faqat kalitlar va ularning
 * ma'lumotnomasi. Komponentlar dinamik yuklanadi (`loader.tsx`), ya'ni
 * foydalanuvchi tanlagan bitta dizayn paketga tushadi, o'ntasi emas
 * (§49 "code splitting").
 *
 * Hech narsa import qilinmaydi: testlar `@/` taxallusini yecha olmaydi.
 */

/* ========================================================================= *
 * KALITLAR
 * ========================================================================= */

/**
 * STANDART DIZAYN.
 *
 * Mavjud, ishlab chiqarishda turgan sahifa. Premium emas va obuna
 * talab qilmaydi — har bir nomzod shu bilan boshlanadi.
 *
 * Alohida kalit bo'lishi muhim: "dizayn yo'q" holatini `null` bilan
 * ifodalash koddagi har joyda `?? "classic"` yozishni talab qilardi.
 */
export const DEFAULT_THEME = "classic" as const;

export const THEME_KEYS = [
  "classic",
  "imperial-gold",
  "silver-executive",
  "emerald-legacy",
  "royal-navy",
  "obsidian",
  "ivory-editorial",
  "aurora-glass",
  "zarafshon",
  "monochrome-signature",
  "crimson-prestige",
] as const;

export type ThemeKey = (typeof THEME_KEYS)[number];

export interface ThemeMeta {
  key: ThemeKey;
  label: string;
  /** Kayfiyat — tanlash oynasida ko'rsatiladi (§12). */
  mood: string;
  description: string;
  /** Premium obuna talab qiladimi. */
  premium: boolean;
  /**
   * Dizayn hali qurilganmi.
   *
   * `false` bo'lsa, tanlash oynasida "tez kunda" deb ko'rsatiladi va
   * TANLANMAYDI. Ro'yxatga oldindan kiritish ataylab: §12 galereyasi
   * nimalar kelayotganini ko'rsatadi, lekin tanlanmagan dizaynni
   * "tanlash mumkin" qilib ko'rsatish yolg'on bo'lardi (§71).
   */
  ready: boolean;
  /** Kimga mos — tanlashda yo'l-yo'riq. */
  suitedFor: string;
}

/**
 * Dizaynlar ma'lumotnomasi.
 *
 * `ready: false` — kalit band qilingan, komponent hali yo'q. Shunday
 * dizaynni tanlashga urinish server tomonda rad etiladi.
 */
export const THEMES: Readonly<Record<ThemeKey, ThemeMeta>> = {
  classic: {
    key: "classic",
    label: "Klassik",
    mood: "Liderlar.uz ning asosiy ko'rinishi",
    description:
      "Ensiklopediyaning standart sahifasi. Barcha ma'lumotlar tartib bilan, qo'shimcha bezaksiz.",
    premium: false,
    ready: true,
    suitedFor: "Hamma uchun",
  },
  "imperial-gold": {
    key: "imperial-gold",
    label: "Imperial Gold",
    mood: "Nufuz, yetakchilik, institutsional hashamat",
    description:
      "Iliq chuqur qora, fil suyagi matn va o'lchovli shampan tillasi. Fonsiz portret ingichka tilla ramkadan chiqib turadi, katta editorial serif ism, sokin va silliq animatsiyalar.",
    premium: true,
    ready: true,
    suitedFor: "Rahbarlar, tashkilot asoschilari",
  },
  "silver-executive": {
    key: "silver-executive",
    label: "Silver Executive",
    mood: "Zamonaviy korporativ premium",
    description:
      "Oq va och kumush-moviy fon, to'q ko'k tipografiya, qirollik ko'k urg'u. Chapda fonga qo'shilib ketgan portret, shisha yuzalar va toza ko'rsatkichlar paneli.",
    premium: true,
    ready: true,
    suitedFor: "Biznes va boshqaruv",
  },
  "emerald-legacy": {
    key: "emerald-legacy",
    label: "Emerald Legacy",
    mood: "Meros, bilim, intellektual nufuz",
    description:
      "Chuqur zumrad-qora, nurli zumrad shisha va bosiq antiqa guruch. Assimetrik hero, me'moriy ism, suzuvchi ma'lumot modullari, gorizontal vaqt o'qi va kinematik media lentasi.",
    premium: true,
    ready: true,
    suitedFor: "Olimlar, ustozlar",
  },
  "royal-navy": {
    key: "royal-navy",
    label: "Royal Navy",
    mood: "Davlat, diplomatiya, institut",
    description:
      "Qora-ko'k fazo, sekin oquvchi kobalt yorug'lik va suyuq shisha (liquid glass) panellar. Bento hero, portret ustida qo'lyozma iqtibos va oltin imzo, kengaytirilgan zamonaviy tipografiya.",
    premium: true,
    ready: true,
    suitedFor: "Davlat xizmati, diplomatiya",
  },
  obsidian: {
    key: "obsidian",
    label: "Obsidian",
    mood: "Minimal qorong'u hashamat",
    description:
      "Toza qora, oq tipografiya va ingichka kumush chiziqlar. Ortda ulkan ism (ism — oq, familiya — kontur), oldinda katta fonsiz portret; rang faqat ijtimoiy tarmoq belgilarida.",
    premium: true,
    ready: true,
    suitedFor: "Ijodkorlar, me'morlar",
  },
  "ivory-editorial": {
    key: "ivory-editorial",
    label: "Ivory Editorial",
    mood: "Premium jurnal, biografiya",
    description:
      "Suyak rangi, qora va iliq kulrang, bosiq burgundiya urg'u. Jurnal muqovasiga o'xshash kompozitsiya, katta iqtiboslar.",
    premium: true,
    ready: true,
    suitedFor: "Jurnalistlar, yozuvchilar, tadqiqotchilar",
  },
  "aurora-glass": {
    key: "aurora-glass",
    label: "Aurora Glass",
    mood: "Kelajak yetakchiligi, texnologiya",
    description:
      "Qorong'u dengiz ko'ki, shaffof shisha qatlamlar, o'lchovli moviy va binafsha yorug'lik.",
    premium: true,
    ready: true,
    suitedFor: "Texnologiya, startap",
  },
  zarafshon: {
    key: "zarafshon",
    label: "Zarafshon",
    mood: "Zamonaviy o'zbek o'zligi",
    description:
      "Iliq qum, chuqur turkuaz, to'q dengiz ko'ki va o'lchovli tilla. Milliy geometriya juda nozik qo'llanadi.",
    premium: true,
    ready: true,
    suitedFor: "Madaniyat, san'at, milliy loyihalar",
  },
  "monochrome-signature": {
    key: "monochrome-signature",
    label: "Monochrome Signature",
    mood: "Moda, editorial, shaxsiy brend",
    description:
      "Faqat qora, oq va kulrang. Katta portret, o'lchamdan katta tipografiya, deyarli bezaksiz.",
    premium: true,
    ready: true,
    suitedFor: "Shaxsiy brend, moda, fotografiya",
  },
  "crimson-prestige": {
    key: "crimson-prestige",
    label: "Crimson Prestige",
    mood: "Dadil yetakchilik, yutuq",
    description:
      "Chuqur burgundiya, qaymoq, qora va bosiq bronza. Assimetrik editorial tuzilma, yutuqqa yo'naltirilgan.",
    premium: true,
    ready: true,
    suitedFor: "Sportchilar, tanlov g'oliblari",
  },
};

/* ========================================================================= *
 * YECHISH
 * ========================================================================= */

export function isThemeKey(value: unknown): value is ThemeKey {
  return typeof value === "string" && Object.hasOwn(THEMES, value);
}

/**
 * Saqlangan qiymatni ishlatiladigan dizaynga aylantiradi.
 *
 * XAVFSIZ ZAXIRA (§11 "If a theme is retired later, provide safe
 * fallback"):
 *
 *   - `null`, bo'sh yoki noma'lum kalit  -> standart
 *   - ro'yxatda bor, lekin `ready: false` -> standart
 *
 * Ikkinchisi muhim: kalit koddan olib tashlanmasdan "qurilmagan"
 * holatiga qaytarilsa ham sahifa ishlashda davom etadi. Shu sababli
 * bu funksiya HECH QACHON xato tashlamaydi — ommaviy sahifa dizayn
 * kaliti sababli ochilmay qolmasligi kerak.
 */
export function resolveTheme(stored: unknown): ThemeKey {
  if (!isThemeKey(stored)) return DEFAULT_THEME;
  return THEMES[stored].ready ? stored : DEFAULT_THEME;
}

/**
 * Tanlash uchun ruxsat etilgan kalitlar.
 *
 * `ready: false` bo'lganlari KIRMAYDI: ularni tanlashga ruxsat berish
 * profilni standart dizaynga qaytarib, foydalanuvchini "nega
 * o'zgarmadi" degan savol oldida qoldirardi.
 */
export function selectableThemes(): ThemeMeta[] {
  return THEME_KEYS.map((key) => THEMES[key]).filter((theme) => theme.ready);
}

/** Galereyada ko'rsatiladigan hamma dizayn — qurilmaganlari ham. */
export function galleryThemes(): ThemeMeta[] {
  return THEME_KEYS.map((key) => THEMES[key]);
}

export type ThemeChoiceProblem = "unknown" | "not_ready" | "needs_premium";

export const THEME_PROBLEM_TEXT: Record<ThemeChoiceProblem, string> = {
  unknown: "Bunday dizayn yo'q.",
  not_ready: "Bu dizayn hali tayyor emas.",
  needs_premium: "Bu dizayn Liderlar VIP obunasi bilan ochiladi.",
};

/**
 * Tanlov o'rinlimi.
 *
 * `hasPremium` SERVERDA aniqlanadi va parametr sifatida beriladi:
 * bu modul sof bo'lishi kerak va obunani o'zi tekshira olmaydi.
 */
export function checkThemeChoice(
  key: unknown,
  hasPremium: boolean,
): { ok: true; key: ThemeKey } | { ok: false; problem: ThemeChoiceProblem } {
  if (!isThemeKey(key)) return { ok: false, problem: "unknown" };

  const theme = THEMES[key];
  if (!theme.ready) return { ok: false, problem: "not_ready" };

  /*
   * STANDART DIZAYN HAR DOIM MUMKIN.
   *
   * Obuna tugaganda odam standartga qaytishi kerak — aks holda u
   * tanlagan dizaynida qotib qolardi yoki hech narsa tanlay olmasdi.
   */
  if (theme.premium && !hasPremium) {
    return { ok: false, problem: "needs_premium" };
  }

  return { ok: true, key };
}

/* ========================================================================= *
 * OBUNA TUGAGANDA
 * ========================================================================= */

/**
 * Obuna tugasa, nashr qilingan dizayn nima bo'ladi.
 *
 * §35 buni ANIQ belgilashni talab qiladi va mazmunni yo'q qilishni
 * taqiqlaydi.
 *
 * QAROR: dizayn SAQLANADI, standartga qaytarilmaydi.
 *
 * Sabab: dizayn — mazmun ko'rinishi va uni to'satdan o'zgartirish
 * profilga tashqaridan kelgan odam uchun sahifani tanimas holga
 * keltirardi. Tanlov esa yopiladi — yangi dizayn tanlash uchun obuna
 * kerak. Ya'ni bor narsa olinmaydi, yangisi berilmaydi.
 */
export function themeAfterExpiry(publishedTheme: unknown): ThemeKey {
  return resolveTheme(publishedTheme);
}
