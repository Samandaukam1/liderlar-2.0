/**
 * TASHKILOT REKVIZITLARI VA HUJJATLARI — YAGONA MANBA.
 *
 * Har bir qiymat `public/assets/legal/` dagi hujjatlardan ko'chirilgan. Oferta
 * ham, "Loyiha haqida" ham shu yerdan o'qiydi: rekvizit ikki sahifada ikki xil
 * turishi huquqiy hujjatda kechirilmaydigan xato.
 *
 * Hujjat yangilansa, PDF, ko'rinish rasmi va shu fayl BIRGA almashtiriladi.
 */
export const LEGAL_ENTITY = {
  fullName: "“MUKAMMAL MEDIA GROUP” MAS’ULIYATI CHEKLANGAN JAMIYAT",
  shortName: "“MUKAMMAL MEDIA GROUP” MCHJ",
  tin: "312 745 545",
  certificateNumber: "5938902",
  registeredOn: "25.01.2026",
  publishingNoticeNumber: "1761798",
} as const;

export type LegalDocument = {
  id: string;
  eyebrow: string;
  title: string;
  pdfHref: string;
  downloadName: string;
  previewSrc: string;
  previewWidth: number;
  previewHeight: number;
  facts: { label: string; value: string }[];
  /** Hujjat holati va uni tekshirish yo'li. */
  verification: { text: string; status: string; href: string; action: string };
  /** Hujjatda sanalgan faoliyat turlari. */
  scope?: { label: string; items: string[]; emphasis: string; quote: string };
};

export const LEGAL_DOCUMENTS: LegalDocument[] = [
  {
    id: "guvohnoma",
    eyebrow: "Davlat ro‘yxatidan o‘tish",
    title: "Yuridik shaxsni davlat ro‘yxatidan o‘tkazilganligi to‘g‘risidagi guvohnoma",
    pdfHref: "/assets/legal/mukammal-media-group-guvohnoma.pdf",
    downloadName: "Mukammal-Media-Group-MCHJ-guvohnoma.pdf",
    previewSrc: "/assets/legal/mukammal-media-group-guvohnoma.webp",
    previewWidth: 1000,
    previewHeight: 1416,
    facts: [
      { label: "To‘liq nomi", value: LEGAL_ENTITY.fullName },
      { label: "STIR", value: LEGAL_ENTITY.tin },
      { label: "Hujjat raqami", value: LEGAL_ENTITY.certificateNumber },
      { label: "Berilgan sana", value: LEGAL_ENTITY.registeredOn },
      { label: "Tasdiqlash raqami", value: "3101815" },
      { label: "Tomonidan berilgan", value: "Toshkent shahri, Yunusobod tumani DXM" },
      {
        label: "Faoliyat manzili",
        value: "Toshkent shahri, Yunusobod tumani, Firdavsiy MFY, Chingiz Aytmatov ko‘chasi, 50-uy",
      },
    ],
    /* Holat hujjatdan emas, QR ochadigan Adliya vazirligi sahifasidan o'qilgan. */
    verification: {
      text: "Adliya vazirligining tadbirkorlik subyektlarini ro‘yxatdan o‘tkazish tizimida 2026-yil 6-noyabr holatiga ko‘ra tadbirkorlik holati:",
      status: "Faoliyat ko‘rsatayotgan hamda soliq majburiyatlariga ega",
      href: "https://new.birdarcha.uz/document/d7055d01-623d-4eab-bf86-cdd35a046ef3",
      action: "Davlat tizimida tekshirish",
    },
  },
  {
    id: "noshirlik",
    eyebrow: "Noshirlik faoliyati",
    title: "Xabarnoma qabul qilinganligi to‘g‘risida tasdiqnoma",
    pdfHref: "/assets/legal/mukammal-media-group-noshirlik-tasdiqnoma.pdf",
    downloadName: "Mukammal-Media-Group-MCHJ-noshirlik-tasdiqnoma.pdf",
    previewSrc: "/assets/legal/mukammal-media-group-noshirlik-tasdiqnoma.webp",
    previewWidth: 1000,
    previewHeight: 1564,
    facts: [
      { label: "Tashkilot", value: LEGAL_ENTITY.fullName },
      { label: "Tasdiqnoma raqami", value: `№ ${LEGAL_ENTITY.publishingNoticeNumber}` },
      { label: "Reyestr tartib raqami", value: "X-25942660614" },
      { label: "STIR", value: LEGAL_ENTITY.tin },
      { label: "Taqdim etilgan sana", value: "06.08.2026, 14:49" },
      { label: "Xabarnoma", value: "Noshirlik faoliyatini boshlaganlik yoki tugatganlik haqida xabarnoma" },
      {
        label: "Vakolatli organ",
        value:
          "O‘zbekiston Respublikasi Raqamli texnologiyalar vazirligi huzuridagi Axborotlashtirish va telekommunikatsiyalar sohasida nazorat inspeksiyasi",
      },
    ],
    /* Holat hujjatning o'zida yozilgan; reyestrda STIR bo'yicha izlash mumkin. */
    verification: {
      text: "“Litsenziya” axborot tizimi reyestrida STIR bo‘yicha izlash mumkin. Hujjatda ko‘rsatilgan holat:",
      status: "Faol",
      href: "https://license.gov.uz/registry/b9b88cc1-f5eb-4e63-86a9-f6586a00ff47",
      action: "Reyestrda tekshirish",
    },
    scope: {
      label: "Tasdiqnomadagi faoliyat turlari",
      emphasis: "Ensiklopedik (ma’lumotnoma) nashrlar",
      quote: "Turli xil axborotlarni (ilmiy, amaliy va boshqalar) olishga mo‘ljallangan nashrlar.",
      items: [
        "Ma’naviy-ma’rifiy nashrlar",
        "Adabiy-badiiy nashrlar",
        "Ilmiy nashrlar",
        "Ilmiy-ommabop nashrlar",
        "Ensiklopedik (ma’lumotnoma) nashrlar",
        "Bolalar va o‘smirlar nashrlari",
        "Ishlab chiqarishga oid nashrlar",
        "O‘quv adabiyotlarini nashr etish",
        "Axborot-reklama nashrlari",
        "Rasmiy nashrlar",
        "Ijtimoiy-siyosiy nashrlar",
        "Diniy nashrlar",
      ],
    },
  },
];

/** Qonun matnlarining rasmiy manbasi. */
export const LAW_LINKS = {
  civilCode: "https://lex.uz/docs/111189",
} as const;
