import { createHash, randomBytes } from "node:crypto";

/**
 * Telegram bog'lash tokeni — SOF MODUL.
 *
 * IKKI ILOVA O'RTASIDAGI SHARTNOMA.
 *
 * Tokenni SHU ilova (liderlar-web) yaratadi, bot esa admin
 * ilovasida uni tekshiradi. Ular bir-birining kodini
 * ko'rmaydi — yagona umumiy narsa BAZADAGI HASH.
 *
 * Shartnoma qisqa va o'zgarmas:
 *
 *     member_link_tokens.token_hash = sha256(token), hex, kichik harf
 *
 * Shuning uchun bu yerda murakkab mantiq YO'Q: qancha kam
 * kelishuv bo'lsa, ikki ilova shuncha kam ajralib ketadi.
 * Tokenning o'zi hech qachon bazaga yozilmaydi.
 */

const TOKEN_BYTES = 16;

/** Telegram deep-link'da 10 daqiqa yetarli va xavfsiz. */
export const LINK_TOKEN_TTL_SECONDS = 10 * 60;

export function hashLinkToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export interface IssuedLinkToken {
  /** Foydalanuvchiga beriladi. Bazaga TUSHMAYDI. */
  token: string;
  /** Bazaga yoziladi. */
  tokenHash: string;
  expiresAt: string;
}

export function issueLinkToken(
  now: Date,
  ttlSeconds: number = LINK_TOKEN_TTL_SECONDS,
): IssuedLinkToken {
  // base64url — Telegram `start` parametrida o'zgarishsiz o'tadi.
  const token = randomBytes(TOKEN_BYTES)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return {
    token,
    tokenHash: hashLinkToken(token),
    expiresAt: new Date(now.getTime() + ttlSeconds * 1000).toISOString(),
  };
}

/** Telegram deep-link. Bot foydalanuvchi nomi sozlanmagan bo'lsa — null. */
export function telegramDeepLink(botUsername: string | null, token: string): string | null {
  const clean = botUsername?.replace(/^@/, "").trim();
  return clean ? `https://t.me/${clean}?start=${token}` : null;
}
