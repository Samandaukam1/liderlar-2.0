/**
 * OMMAVIY RO'YXATLAR KESHI — UMUMIY QOIDALAR.
 *
 * NEGA: ommaviy sahifalarning hammasi dinamik (`private, no-store`), ya'ni
 * har tashrif va har krauler so'rovi bazaga to'g'ridan-to'g'ri borardi.
 * Katalog bitta ko'rsatishda ~520 KB tortardi, reyting so'rovi esa 3,5 s
 * ishlardi — Micro serverda bir nechtasi bir vaqtda kelsa, PostgREST
 * ulanishlari tugab (PGRST003), butun loyiha (Auth ham) yiqilardi.
 *
 * 5 DAQIQA YETARLI VA XAVFSIZ: reyting soatda bir marta qayta hisoblanadi,
 * katalog esa nomzod chop etilganda o'zgaradi. Muddat o'tgach Next eski
 * qiymatni berib turib, fonda yangilaydi; yangilash yiqilsa eski qiymat
 * qoladi — baza qisqa uzilganda ham sahifa bo'sh qolmaydi.
 */
export const PUBLIC_LIST_REVALIDATE_SECONDS = 300;
