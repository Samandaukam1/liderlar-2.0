import { ANNUAL_FEE_UZS } from "@/lib/kabinet/annual-fee";

/**
 * OMMAVIY OFERTA MATNI.
 *
 * Asos — 2026-09-05 da `legal_pages` ga kiritilgan amaldagi shartnoma. Tijoriy
 * shartlar (badal, 14 kun, nashr muddati, tahrir, to'lov ma'lumotlari) undan
 * o'zgarishsiz olingan.
 *
 * Band raqamlari QO'LDA YOZILMAYDI: sahifa ularni tartibdan hisoblaydi, shunda
 * yangi band qo'shilganda raqamlash buzilmaydi. Shu sababli matn ichida boshqa
 * bandga raqam bilan havola qilinmaydi.
 */

/**
 * Shu tahrir e'lon qilingan payt. `legal_pages.oferta` undan KEYIN saqlangan
 * bo'lsa, sahifa admin panelda yozilgan matnni ko'rsatadi (`page.tsx`).
 */
export const OFFER_REVISION_AT = "2026-11-06T12:00:00+05:00";

export const OFFER_BASE_FEE_UZS = 100_000;

const figure = (amount: number) => new Intl.NumberFormat("ru-RU").format(amount).replace(/\s/g, " ");
const som = (amount: number) => `${figure(amount)} so‘m`;

export const OFFER_PAYMENT = {
  card: "5614 6865 0041 6261",
  holder: "Jaxongir Qurbonnazarov",
} as const;

export type OfferClause = {
  text: string;
  /** Band ostidagi ro'yxat. */
  items?: string[];
  /** `items` raqamlansinmi (masalan, anketa savollari). */
  ordered?: boolean;
  /** Ajratib ko'rsatiladigan "nomi — qiymati" juftliklari. */
  details?: { label: string; value: string }[];
  /** Band ostidagi izoh. */
  note?: string;
  link?: { href: string; label: string };
};

export type OfferSection = {
  id: string;
  title: string;
  clauses: OfferClause[];
};

export const OFFER_TITLE = "Ommaviy oferta shartnomasi";
export const OFFER_SUBTITLE =
  "“O‘zbekiston Lider Yoshlari Ensiklopediyasi” platformasida biografik maqola joylashtirish bo‘yicha";

export const OFFER_PREAMBLE = [
  "Ushbu ommaviy oferta shartnomasi (keyingi o‘rinlarda — Shartnoma) “MUKAMMAL MEDIA GROUP” mas’uliyati cheklangan jamiyati (keyingi o‘rinlarda — Tashkilot) tomonidan liderlar.uz internet sayti orqali yuritiladigan “O‘zbekiston Lider Yoshlari Ensiklopediyasi” platformasida ommaviy foydalanish uchun e’lon qilinadi.",
  "Shartnoma ensiklopediyaga kiritilishi rejalashtirilgan jismoniy shaxs (keyingi o‘rinlarda — Nomzod) bilan O‘zbekiston Respublikasi Fuqarolik kodeksining 369–370-moddalariga muvofiq tuziladi va uning barcha asosiy shartlarini o‘z ichiga oladi.",
  "Nomzod Shartnomani qabul qilishdan oldin uning matni bilan to‘liq tanishib chiqishi lozim.",
];

/** Qonundan aynan olingan parchalar (lex.uz, rasmiy matn lotin yozuviga o'girilgan). */
export const OFFER_LAW_QUOTES = [
  {
    article: "369-modda, ikkinchi qism",
    text: "Shartnomaning barcha asosiy shartlarini o‘z ichiga olgan, taklif kiritayotgan shaxsning javob qaytargan har qanday shaxs bilan taklifda ko‘rsatilgan shartlar asosida shartnoma tuzishga bo‘lgan xohish-irodasi bilinib turgan taklif oferta (ommaviy oferta) hisoblanadi.",
  },
  {
    article: "370-modda",
    text: "Oferta yuborilgan shaxsning uni qabul qilganligi haqidagi javobi aksept hisoblanadi. Aksept to‘liq va pisandasiz bo‘lishi kerak.",
  },
];

export const OFFER_SUMMARY = [
  { label: "Xizmat", value: "Biografik-ensiklopedik maqolani tayyorlash va e’lon qilish" },
  { label: "Yillik badal", value: som(OFFER_BASE_FEE_UZS), hint: `Chegirma davrida ${som(ANNUAL_FEE_UZS)}` },
  { label: "To‘lov muddati", value: "14 kalendar kuni", hint: "Bo‘lib to‘lash mumkin" },
  { label: "E’lon qilish", value: "Keyingi ish kuni", hint: "Ma’lumotlar to‘liq bo‘lsa" },
  { label: "Tahrir", value: "Birinchi yil bepul", hint: "Oyiga bir murojaat" },
  { label: "Rozilik", value: "Yozma kelishuv", hint: "Alohida imzo talab etilmaydi" },
];

export const OFFER_SECTIONS: OfferSection[] = [
  {
    id: "atamalar",
    title: "Atamalar",
    clauses: [
      {
        text: "Ushbu Shartnomada quyidagi atamalar qo‘llaniladi:",
        items: [
          "Tashkilot — “MUKAMMAL MEDIA GROUP” MCHJ, Shartnoma bo‘yicha xizmat ko‘rsatuvchi tomon.",
          "Platforma — liderlar.uz internet sayti orqali yuritiladigan “O‘zbekiston Lider Yoshlari Ensiklopediyasi”.",
          "Nomzod — Ensiklopediyaga kiritilishi rejalashtirilgan va Shartnomani qabul qilgan jismoniy shaxs.",
          "Maqola — Nomzod taqdim etgan ma’lumotlar asosida tayyorlanadigan biografik-ensiklopedik maqola.",
          "Aksept — Nomzodning ushbu Shartnoma shartlarini to‘liq va so‘zsiz qabul qilishi.",
          "Yillik badal — Maqolani Platformada joylashtirish va yuritish uchun to‘lanadigan summa.",
        ],
      },
    ],
  },
  {
    id: "predmet",
    title: "Shartnoma predmeti",
    clauses: [
      {
        text: "Ushbu Shartnomaning predmeti Nomzod haqidagi biografik-ensiklopedik Maqolani:",
        items: [
          "tayyorlash;",
          "tahrirlash;",
          "elektron formatga keltirish;",
          "“O‘zbekiston Lider Yoshlari Ensiklopediyasi” platformasida e’lon qilishdan iborat.",
        ],
      },
      {
        text: "Maqola Nomzod tomonidan taqdim etilgan ma’lumotlar asosida tayyorlanadi hamda ensiklopedik, axborotiy va ijtimoiy-ma’rifiy xarakterga ega bo‘ladi.",
      },
    ],
  },
  {
    id: "aksept",
    title: "Ofertani qabul qilish (aksept)",
    clauses: [
      {
        text: "Nomzod tomonidan Tashkilotga biografik ma’lumotlar, fotosuratlar va boshqa zarur axborotlarning taqdim etilishi hamda belgilangan tartibda to‘lov amalga oshirilishi ushbu Shartnoma shartlarini to‘liq, so‘zsiz va cheklovlarsiz qabul qilinganini anglatadi.",
      },
      {
        text: "Nomzod Shartnoma shartlari bilan to‘liq tanishib chiqqanligini, ularning mazmuni va huquqiy oqibatlarini anglaganligini hamda ongli ravishda rozilik bildirganligini Telegram messenjeridagi yozma kelishuv orqali tasdiqlaydi.",
      },
      {
        text: "Mazkur rozilik alohida imzo qo‘yilishini talab etmaydi va ommaviy oferta shartlariga muvofiq qonuniy kuchga ega hisoblanadi.",
      },
      {
        text: "Nomzod o‘n sakkiz yoshga to‘lmagan bo‘lsa, Shartnoma qonunchilikda belgilangan tartibda uning ota-onasi yoki qonuniy vakilining roziligi bilan tuziladi.",
      },
    ],
  },
  {
    id: "nomzod",
    title: "Nomzodning majburiyatlari",
    clauses: [
      {
        text: "Nomzod Maqola va brending ishlari uchun quyidagi talablarga javob beradigan fotosuratni taqdim etishi shart:",
        items: ["to‘g‘riga qaragan;", "rasmiy yoki yarim rasmiy kiyimda;", "yuqori sifatli."],
      },
      {
        text: "Nomzod quyidagi biografik savollarga to‘liq va ishonchli javoblarni taqdim etadi:",
        ordered: true,
        items: [
          "To‘liq ismi, familiyasi va otasining ismi",
          "Tug‘ilgan sanasi va joyi",
          "Hozirgi yashash hududi",
          "Ta’lim darajasi va o‘qigan muassasalari",
          "Faoliyat yuritayotgan yoki tahsil olayotgan sohasi",
          "Faoliyat boshlanish davri",
          "Muhim yutuqlar va mukofotlar",
          "Hayotiga ta’sir qilgan shaxs yoki voqea",
          "Hayotiy shiori yoki prinsipi",
          "Bo‘sh vaqt mashg‘ulotlari",
          "Liderlik uchun muhim deb bilgan fazilati",
          "Kelajakdagi rejalari va maqsadlari",
          "Boshqalarga bera oladigan tajribasi",
          "Qo‘shimcha muhim ma’lumotlar",
          "Yoshlar uchun maslahat yoki motivatsion fikr",
        ],
      },
      {
        text: "Nomzod tomonidan taqdim etilgan barcha ma’lumotlarning haqqoniyligi va qonuniyligi uchun Nomzod shaxsan javobgar hisoblanadi.",
      },
      {
        text: "Nomzod boshqa shaxsga tegishli ma’lumot yoki materialni o‘z nomidan taqdim etmaydi.",
      },
    ],
  },
  {
    id: "tashkilot",
    title: "Tashkilotning majburiyatlari va huquqlari",
    clauses: [
      {
        text: "Nomzod ma’lumotlarni to‘liq taqdim etgan va to‘lovni amalga oshirgan taqdirda, Tashkilot Maqolani tayyorlash, tahrirlash va Platformada e’lon qilish majburiyatini oladi.",
      },
      {
        text: "Tashkilot taqdim etilgan ma’lumotlarni ko‘rib chiqish, ensiklopedik uslubga moslab tahrirlash va zarur hollarda Nomzoddan aniqlik kiritishni so‘rash huquqiga ega.",
      },
      {
        text: "Ma’lumot yolg‘on, boshqa shaxsga tegishli yoki qonunchilikka zid bo‘lsa, Tashkilot uni e’lon qilishni rad etish huquqini saqlab qoladi.",
      },
    ],
  },
  {
    id: "tolov",
    title: "Badal va to‘lov tartibi",
    clauses: [
      {
        text: `Maqolani ensiklopediyaga joylashtirish uchun yillik badal miqdori ${figure(OFFER_BASE_FEE_UZS)} (bir yuz ming) so‘mni tashkil etadi.`,
      },
      {
        text: `Tashkilot belgilagan chegirma yoki promo kod amal qilgan davrda badal ${figure(ANNUAL_FEE_UZS)} (o‘ttiz sakkiz ming) so‘m miqdorida qo‘llanishi mumkin. Nomzod uchun amal qiladigan aniq summa to‘lovdan oldin unga yozma ravishda ma’lum qilinadi.`,
      },
      {
        text: `Maqola e’lon qilingandan keyingi yillar uchun yillik texnik badal ${som(ANNUAL_FEE_UZS)}ni tashkil etadi. Uning muddati Maqola birinchi marta e’lon qilingan sanadan hisoblanadi va Nomzodning shaxsiy kabinetida ko‘rsatiladi. Mablag‘ bank kartasidan avtomatik yechilmaydi.`,
      },
      {
        text: "Badal mablag‘lari quyidagilarga yo‘naltiriladi:",
        items: [
          "platformani texnik qo‘llab-quvvatlash;",
          "maqolalarni yuritish va saqlash;",
          "loyihani rivojlantirish.",
        ],
      },
      {
        text: "To‘lov kelishuv boshlangan kundan boshlab 14 kalendar kuni ichida to‘liq amalga oshirilishi shart. Shu muddat ichida to‘lovni bo‘lib-bo‘lib amalga oshirish mumkin.",
      },
      {
        text: "To‘lov quyidagi ma’lumotlar bo‘yicha amalga oshiriladi:",
        details: [
          { label: "Plastik karta", value: OFFER_PAYMENT.card },
          { label: "Karta egasi", value: OFFER_PAYMENT.holder },
        ],
        note: "To‘lov amalga oshirilgach, chek (skrinshot) taqdim etilishi shart.",
      },
      {
        text: "To‘lovni qaytarish bilan bog‘liq masalalar O‘zbekiston Respublikasi qonunchiligiga muvofiq hal qilinadi.",
      },
    ],
  },
  {
    id: "muddat",
    title: "Maqolani e’lon qilish muddati",
    clauses: [
      {
        text: "Barcha ma’lumotlar to‘liq taqdim etilgan taqdirda, Maqola kelishuvdan keyingi ish kuni e’lon qilinadi.",
      },
      {
        text: "Ma’lumotlar to‘liq bo‘lmasa, muddat yetishmagan ma’lumotlar taqdim etilgan kundan boshlab hisoblanadi.",
      },
    ],
  },
  {
    id: "ozgartirish",
    title: "Maqolaga o‘zgartirish kiritish",
    clauses: [
      { text: "Maqola e’lon qilinganidan so‘ng bir yil ichida kiritiladigan o‘zgartirishlar bepul amalga oshiriladi." },
      { text: "O‘zgartirish kiritish murojaati oyiga bir marta qabul qilinadi." },
      { text: "Keyingi yillar uchun o‘zgartirish shartlari tomonlar kelishuviga ko‘ra belgilanadi." },
    ],
  },
  {
    id: "maxfiylik",
    title: "Ma’lumotlardan foydalanish va maxfiylik",
    clauses: [
      { text: "Nomzod tomonidan Maqola uchun taqdim etilgan ma’lumotlar ochiq ensiklopedik axborot hisoblanadi." },
      { text: "Nomzod o‘z ma’lumotlari va fotosuratlarining internet tarmog‘ida ochiq e’lon qilinishiga rozilik bildiradi." },
      { text: "Tashkilot ma’lumotlardan faqat ensiklopedik, axborotiy va ma’rifiy maqsadlarda foydalanadi." },
      {
        text: "Shaxsga doir ma’lumotlarga ishlov berish “Shaxsga doir ma’lumotlar to‘g‘risida”gi O‘zbekiston Respublikasi Qonuni va Platformaning Maxfiylik siyosatiga muvofiq amalga oshiriladi. Nomzod qonunda belgilangan tartibda rozilikni chaqirib olishi, ma’lumotlarini tuzatish yoki profilini o‘chirishni so‘rashi mumkin.",
        link: { href: "/maxfiylik-siyosati", label: "Maxfiylik siyosati" },
      },
    ],
  },
  {
    id: "materiallar",
    title: "Materiallardan foydalanish",
    clauses: [
      {
        text: "Nomzod taqdim etadigan matn, fotosurat va boshqa materiallar unga tegishli bo‘lishi yoki Nomzod ulardan foydalanishga haqli bo‘lishi kerak.",
      },
      {
        text: "Materiallarni yuborish orqali Nomzod Tashkilotga ularni Platforma doirasida, jumladan profil, jurnal va ijtimoiy tarmoqlarda namoyish etishga ruxsat beradi.",
      },
    ],
  },
  {
    id: "reyting",
    title: "Reyting va qo‘shimcha loyihalar",
    clauses: [
      {
        text: "Badal to‘lash reytingdagi o‘rinni, ball yoki mukofotni kafolatlamaydi. Reyting Platformada e’lon qilingan qoidalar asosida hisoblanadi.",
        link: { href: "/reyting", label: "Reyting qoidalari" },
      },
      { text: "Tashkilot kelajakda seminarlar, podkastlar, reels va boshqa media loyihalarni amalga oshirishi mumkin." },
      { text: "Ushbu loyihalar Nomzodlarning ijtimoiy nufuzi va virtual imidjini oshirishga qaratiladi." },
    ],
  },
  {
    id: "javobgarlik",
    title: "Tomonlarning javobgarligi",
    clauses: [
      {
        text: "Tomonlar Shartnoma bo‘yicha majburiyatlarni bajarmaganlik yoki lozim darajada bajarmaganlik uchun O‘zbekiston Respublikasi qonunchiligiga muvofiq javobgar bo‘ladi.",
      },
      {
        text: "Nomzod tomonidan belgilangan shartlar bajarilmagan taqdirda, unga dastlab tegishli tartibda ogohlantirish beriladi. Agar ogohlantirishdan so‘ng ham mazkur holat bartaraf etilmasa yoki belgilangan talablar bajarilmasa, amaldagi qonunchilik doirasida tegishli huquqiy choralar ko‘rilishi mumkin.",
      },
      {
        text: "Tomonlar yengib bo‘lmaydigan kuch holatlari sababli majburiyatni bajara olmaganlik uchun qonunchilikda belgilangan tartibda javobgarlikdan ozod etiladi.",
      },
    ],
  },
  {
    id: "nizolar",
    title: "Nizolarni hal qilish",
    clauses: [
      { text: "Shartnomadan kelib chiqadigan barcha nizolar muzokaralar yo‘li bilan hal qilinadi." },
      {
        text: "Kelishuvga erishilmagan taqdirda nizo O‘zbekiston Respublikasi qonunchiligida belgilangan tartibda ko‘rib chiqiladi.",
      },
    ],
  },
  {
    id: "yakuniy",
    title: "Amal qilish muddati va yakuniy qoidalar",
    clauses: [
      { text: "Shartnoma aksept qilingan paytdan boshlab kuchga kiradi va to‘langan yillik davr mobaynida amal qiladi." },
      {
        text: "Tashkilot Shartnoma matniga o‘zgartirish kiritishi mumkin. Yangi tahrir ushbu sahifada e’lon qilingan kundan kuchga kiradi va shu kundan keyin tuzilgan shartnomalarga tatbiq etiladi.",
      },
      { text: "Ushbu Shartnoma O‘zbekiston Respublikasi amaldagi qonunchiligiga zid bo‘lmagan holda amal qiladi." },
    ],
  },
];
