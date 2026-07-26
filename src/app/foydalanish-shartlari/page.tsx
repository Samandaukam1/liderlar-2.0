import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/legal-layout";
import { SITE_NAME } from "@/lib/constants";
import { getLegalPage } from "@/lib/data/legal";
import { formatDateUz } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Foydalanish shartlari",
  description: `${SITE_NAME} platformasidan foydalanish qoidalari va shartlari.`,
};

export default async function TermsOfUsePage() {
  const page = await getLegalPage("terms").catch(() => null);
  if (page && page.content.length > 100 && !page.content.includes("admin panel orqali")) {
    return (
      <LegalLayout title={page.title} updatedAt={formatDateUz(page.updated_at)}>
        <div className="whitespace-pre-wrap">{page.content}</div>
      </LegalLayout>
    );
  }

  return (
    <LegalLayout title="Foydalanish shartlari" updatedAt="2026-07-24">
      <p>
        Ushbu Foydalanish shartlari {SITE_NAME} platformasidan foydalanuvchilar tomonidan rioya qilinishi
        shart bo&apos;lgan qoidalarni belgilaydi.
      </p>

      <h2>1. Umumiy qoidalar</h2>
      <ol>
        <li>Platformadan foydalanish orqali siz ushbu shartlarni qabul qilgan hisoblanasiz.</li>
        <li>Platformadan faqat qonuniy maqsadlarda foydalanish talab etiladi.</li>
      </ol>

      <h2>2. Foydalanuvchi majburiyatlari</h2>
      <ul>
        <li>Ro&apos;yxatdan o&apos;tishda va profil to&apos;ldirishda haqiqiy ma&apos;lumot taqdim etish.</li>
        <li>Boshqa foydalanuvchilarning huquqlari va qadr-qimmatini hurmat qilish.</li>
        <li>Hisob ma&apos;lumotlarining (parol va h.k.) maxfiyligini ta&apos;minlash.</li>
      </ul>

      <h2>3. Kontent va mualliflik huquqi</h2>
      <p>
        Foydalanuvchi tomonidan yuklangan materiallar (matn, surat, video havolalar) muallifning o&apos;ziga
        tegishli bo&apos;lishi kerak. Materialni Platformaga yuborish orqali foydalanuvchi ularni Platforma
        doirasida (profil, jurnal, ijtimoiy tarmoqlar) namoyish etish uchun ruxsat beradi.
      </p>

      <h2>4. Taqiqlangan harakatlar</h2>
      <ul>
        <li>Yolg&apos;on yoki boshqa shaxsga tegishli ma&apos;lumotlarni o&apos;z nomidan taqdim etish.</li>
        <li>Platforma ishlashiga zarar yetkazishga qaratilgan harakatlar (avtomatlashtirilgan so&apos;rovlar, zararli kod va h.k.).</li>
        <li>Kamsituvchi, haqoratomuz yoki noqonuniy kontent joylashtirish.</li>
      </ul>

      <h2>5. Hisobni bekor qilish</h2>
      <p>
        Platforma ma&apos;muriyati ushbu shartlar buzilgan taqdirda foydalanuvchi hisobini vaqtincha
        cheklash yoki bekor qilish huquqiga ega.
      </p>

      <h2>6. Javobgarlikni cheklash</h2>
      <p>
        Platforma texnik nosozliklar yoki uchinchi tomon xizmatlaridagi uzilishlar natijasida yuzaga
        kelishi mumkin bo&apos;lgan bilvosita zararlar uchun javobgar emas.
      </p>

      <h2>7. Shartlarga o&apos;zgartirish kiritish</h2>
      <p>
        Ushbu shartlar vaqti-vaqti bilan yangilanishi mumkin. Yangilangan shartlar ushbu sahifada e&apos;lon
        qilingan kundan boshlab kuchga kiradi.
      </p>
    </LegalLayout>
  );
}
