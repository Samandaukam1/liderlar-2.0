/**
 * Bot aniqlash — SOF MODUL.
 *
 * MAQSAD ANIQ: reyting ballari faqat odamlardan kelsin.
 *
 * Bu "mukammal himoya" emas va bo'la olmaydi ham —
 * User-Agent'ni istalgan dastur o'zgartira oladi. Lekin
 * krauler va oldindan ko'rish robotlarining aksariyati
 * o'zini ochiq tanishtiradi, va aynan ular eng ko'p "soxta
 * ko'rish" keltiradi.
 *
 * Shuning uchun bu BIRINCHI QATLAM. Ikkinchisi — kunlik
 * dedup (bazadagi unikal indeks), uchinchisi — oylik ball
 * chegarasi. Uchalasi birga ishlaydi.
 */

/*
 * O'zini ochiq tanishtiradigan botlar: qidiruv tizimlari,
 * ijtimoiy tarmoq oldindan ko'rishlari, monitoring va keng
 * tarqalgan avtomatlashtirish vositalari.
 */
const BOT_PATTERNS = [
  "bot", "crawl", "spider", "slurp",
  "googlebot", "bingbot", "yandex", "duckduckbot", "baiduspider",
  "facebookexternalhit", "facebot", "twitterbot", "linkedinbot",
  "telegrambot", "whatsapp", "skypeuripreview", "discordbot", "slackbot",
  "embedly", "pinterest", "vkshare", "applebot", "petalbot",
  "ahrefs", "semrush", "mj12bot", "dotbot",
  "curl", "wget", "python-requests", "httpclient", "axios", "go-http-client",
  "headlesschrome", "phantomjs", "puppeteer", "playwright",
  "lighthouse", "pagespeed", "gtmetrix", "uptimerobot", "pingdom",
  "scraper", "monitor",
] as const;

/**
 * User-Agent bo'yicha bot ekanini aniqlaydi.
 *
 * BO'SH UA HAM BOT DEB HISOBLANADI: haqiqiy brauzer uni har
 * doim yuboradi. Uni "noma'lum, demak odam" deb qabul qilish
 * eng oson chetlab o'tish yo'li bo'lardi — UA ni o'chirish
 * yetarli bo'lardi.
 */
export function isBotUserAgent(userAgent: string | null | undefined): boolean {
  const ua = (userAgent ?? "").trim().toLowerCase();
  if (!ua) return true;

  // Brauzer UA'lari uzun bo'ladi; juda qisqasi shubhali.
  if (ua.length < 20) return true;

  return BOT_PATTERNS.some((pattern) => ua.includes(pattern));
}

/**
 * Ko'rish hisoblanishi uchun minimal e'tibor vaqti.
 *
 * Sahifa ochilishi bilan darhol hisoblansa, orqa fonda
 * ochilgan yorliq, tasodifiy bosish va oldindan yuklash ham
 * ball berardi.
 *
 * Uch soniya — odam sarlavhani o'qishga ulguradigan, lekin
 * hech kimni kutishga majburlamaydigan chegara.
 */
export const MIN_ENGAGEMENT_MS = 3000;
