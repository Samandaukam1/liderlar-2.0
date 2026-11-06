import { createHash, randomBytes } from "node:crypto";

/**
 * AdabiyotX bog'lash tokeni — SOF MODUL.
 *
 * Tokenni SHU ilova (liderlar-web, a'zoning seansida) yaratadi; AdabiyotX
 * ilovasi uni skaner qilib o'z serveri orqali liderlar-admin ga yuboradi,
 * u esa bazadagi hash bilan solishtiradi. Shartnoma:
 *
 *     adabiyotx_link_tokens.token_hash = sha256(token), hex, kichik harf
 *     adabiyotx_link_tokens.code       = 8 belgili qo'lda kiritiladigan kod
 *
 * QR ichida UNIVERSAL HAVOLA turadi (`https://adabiyotx.uz/link/liderlar?…`):
 * ilova o'rnatilgan telefon uni to'g'ridan-to'g'ri ilovada ochadi, o'rnatilmagan
 * bo'lsa adabiyotx.uz sahifasi nima qilishni tushuntiradi.
 */

const TOKEN_BYTES = 24;
export const ADABIYOTX_LINK_TTL_SECONDS = 15 * 60;
export const ADABIYOTX_ORIGIN = "https://adabiyotx.uz";

/** 0/O va 1/I chalkashmasligi uchun ular alifboda yo'q. */
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 8;

export function hashLinkToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function randomLinkCode(): string {
  const bytes = randomBytes(CODE_LENGTH);
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) code += CODE_ALPHABET[bytes[i]! % CODE_ALPHABET.length];
  return code;
}

/** "ABCD-EFGH" — o'qishga qulay ko'rinish. */
export function formatLinkCode(code: string): string {
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}

export interface IssuedAdabiyotXLink {
  /** QR / deep link uchun xom token. Bazaga TUSHMAYDI. */
  token: string;
  tokenHash: string;
  code: string;
  expiresAt: string;
  /** QR ichidagi havola. */
  universalLink: string;
  /** Shu telefonda ilovani to'g'ridan-to'g'ri ochadigan havola. */
  appLink: string;
}

export function issueAdabiyotXLink(now: Date, ttlSeconds = ADABIYOTX_LINK_TTL_SECONDS): IssuedAdabiyotXLink {
  const token = randomBytes(TOKEN_BYTES).toString("base64url");
  const code = randomLinkCode();
  return {
    token,
    tokenHash: hashLinkToken(token),
    code,
    expiresAt: new Date(now.getTime() + ttlSeconds * 1000).toISOString(),
    universalLink: adabiyotXLinkUrl(token, code),
    appLink: `adabiyotx://link/liderlar?token=${encodeURIComponent(token)}&code=${code}`,
  };
}

/** The code travels with the token so adabiyotx.uz can show it to someone without the app. */
export function adabiyotXLinkUrl(token: string, code?: string): string {
  return `${ADABIYOTX_ORIGIN}/link/liderlar?token=${encodeURIComponent(token)}${code ? `&code=${code}` : ""}`;
}
