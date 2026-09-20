/**
 * A'zo MEHR ma'lumotining TIPLARI va YORLIQLARI — SOF MODUL.
 *
 * Nega alohida: `member-data.ts` da `import "server-only"` bor
 * va u bazaga boradi. Mijoz komponenti undan hatto TIPNI ham
 * import qilsa, bundler butun modulni brauzer paketiga tortadi
 * va build yiqiladi.
 *
 * Bu yerda esa faqat shakl va matn — ikkala tomon ham
 * xavfsiz ishlatadi.
 */

export interface MehrPointRow {
  category: string;
  points: number;
}

export interface MehrLedgerEntry {
  points: number;
  category: string;
  note: string | null;
  createdAt: string;
  activityTitle: string | null;
}

export interface MehrCertificate {
  code: string;
  role: string | null;
  status: "active" | "revoked";
  issuedAt: string;
  activityTitle: string | null;
  activitySlug: string | null;
}

export interface MehrActivitySummary {
  id: string;
  title: string;
  status: string;
  slug: string | null;
  role: string;
  startsAt: string | null;
  isOrganizer: boolean;

  /* Dalil formasi uchun: nima allaqachon bor. */
  hasCover: boolean;
  photoCount: number;
  /** Tashkilotchi hozir dalil yubora oladimi. */
  canSubmitEvidence: boolean;
}

export interface MemberMehrData {
  totalPoints: number;
  byCategory: MehrPointRow[];
  ledger: MehrLedgerEntry[];
  certificates: MehrCertificate[];
  activities: MehrActivitySummary[];
  organizedCount: number;
  participatedCount: number;
  pendingCount: number;
  approvedCount: number;
  /** Umumiy reytingdagi o'rni. Ball bo'lmasa — null, "0-o'rin" emas. */
  rank: number | null;
  telegramLinked: boolean;
}

export const MEHR_CATEGORY_LABEL: Readonly<Record<string, string>> = {
  ijtimoiy_tasir: "Ijtimoiy ta'sir",
  yetakchilik: "Yetakchilik",
  intellektual: "Intellektual faoliyat",
  yutuqlar: "Yutuqlar",
  jamiyatga_hissa: "Jamiyatga hissa",
};

export const MEHR_ROLE_LABEL: Readonly<Record<string, string>> = {
  participant: "Ishtirokchi",
  co_organizer: "Hamkor tashkilotchi",
  organizer: "Tashkilotchi",
};

export const MEHR_STATUS_LABEL: Readonly<Record<string, string>> = {
  draft: "Qoralama",
  submitted: "Tekshiruvda",
  changes_requested: "Tuzatish so'ralgan",
  approved: "Tasdiqlangan",
  rejected: "Rad etilgan",
};
