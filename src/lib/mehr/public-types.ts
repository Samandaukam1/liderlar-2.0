/**
 * Ommaviy MEHR ma'lumotining TIPLARI — SOF MODUL.
 *
 * `public-stats.ts` da `import "server-only"` bor; mijoz
 * komponenti undan tipni import qilsa, bundler butun modulni
 * brauzer paketiga tortadi va build yiqiladi. Bu loyihada
 * bunday xato bir necha marta sodir bo'lgan.
 *
 * MUHIM: bu tiplarda MAXFIY maydon YO'Q va bo'lmasligi ham
 * kerak. Koordinata, dalil fayllari, tekshiruv izohlari va
 * xavf belgilari ommaviy yo'lga umuman chiqmaydi.
 */

export interface MehrPublicStats {
  /** Tasdiqlangan MEHR faoliyati bor odamlar soni. */
  volunteers: number;
  approvedActivities: number;
  certificates: number;
  totalPoints: number;
}

export interface PublicActivityCard {
  id: string;
  slug: string | null;
  title: string;
  coverImageUrl: string | null;
  regionName: string | null;
  categoryName: string | null;
  organizerName: string | null;
  startsAt: string | null;
  approvedAt: string | null;
  beneficiaryCount: number | null;
  participantCount: number;
}

export interface PublicActivityDetail extends PublicActivityCard {
  purpose: string | null;
  description: string | null;
  resultSummary: string | null;
  locationName: string | null;
  organizerSlug: string | null;
  organizerAvatarUrl: string | null;
  /** Ommaviy galereya — faqat tasdiqlangan ish uchun. */
  media: { url: string; caption: string | null }[];
  participants: {
    profileId: string;
    fullName: string | null;
    avatarUrl: string | null;
    candidateSlug: string | null;
    role: string;
  }[];
}

export interface TopVolunteer {
  profileId: string;
  fullName: string | null;
  avatarUrl: string | null;
  regionName: string | null;
  /** Ensiklopediya profili bo'lsa — havola uchun. */
  candidateSlug: string | null;
  points: number;
  activityCount: number;
}

export type RankingPeriod = "all" | "year" | "month";

export const RANKING_PERIOD_LABEL: Readonly<Record<RankingPeriod, string>> = {
  all: "Umumiy",
  year: "Joriy yil",
  month: "Joriy oy",
};
