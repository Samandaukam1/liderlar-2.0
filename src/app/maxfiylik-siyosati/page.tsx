import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/legal-layout";
import { SITE_NAME } from "@/lib/constants";
import { getLegalPage } from "@/lib/data/legal";
import { formatDateUz } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Maxfiylik siyosati",
  description: `${SITE_NAME} platformasida foydalanuvchi ma'lumotlarini yig'ish va qayta ishlash tartibi.`,
};

export default async function PrivacyPolicyPage() {
  const page = await getLegalPage("privacy").catch(() => null);
  if (page && page.content.length > 100 && !page.content.includes("admin panel orqali")) {
    return (
      <LegalLayout title={page.title} updatedAt={formatDateUz(page.updated_at)}>
        <div className="whitespace-pre-wrap">{page.content}</div>
      </LegalLayout>
    );
  }

  return (
    <LegalLayout title="Maxfiylik siyosati" updatedAt="2026-07-24">
      <p>
        {SITE_NAME} foydalanuvchilarning shaxsiy ma&apos;lumotlarini himoya qilishni ustuvor vazifa deb
        biladi. Ushbu hujjat qanday ma&apos;lumotlar yig&apos;ilishi, ulardan qanday foydalanilishi va qanday
        himoyalanishini belgilaydi.
      </p>

      <h2>1. Yig&apos;iladigan ma&apos;lumotlar</h2>
      <ul>
        <li>Ro&apos;yxatdan o&apos;tishda taqdim etiladigan ma&apos;lumotlar: ism-familiya, telefon, email.</li>
        <li>Nomzod profili uchun taqdim etilgan biografik ma&apos;lumot, surat, yutuqlar va faoliyat tafsilotlari.</li>
        <li>Ariza va oylik yangilanish formalarida kiritilgan ma&apos;lumotlar hamda yuklangan fayllar.</li>
        <li>Saytdan foydalanish statistikasi: sahifa ko&apos;rishlar, qurilma va brauzer haqidagi texnik ma&apos;lumotlar (xeshlangan holda).</li>
        <li>Jaxongir AI bilan suhbat tarixi (agar foydalanuvchi ushbu xizmatdan foydalansa).</li>
      </ul>

      <h2>2. Ma&apos;lumotlardan foydalanish maqsadlari</h2>
      <ul>
        <li>Platforma funksionalligini ta&apos;minlash: profil yaratish, reyting hisoblash, bildirishnomalar yuborish.</li>
        <li>Ariza va nomzodlik jarayonini ko&apos;rib chiqish.</li>
        <li>Xizmat sifatini yaxshilash va statistik tahlil (agregatsiya qilingan, shaxsni aniqlab bo&apos;lmaydigan shaklda).</li>
        <li>Qonun talablariga muvofiq javobgarlikni ta&apos;minlash.</li>
      </ul>

      <h2>3. Ma&apos;lumotlarni saqlash va himoya qilish</h2>
      <p>
        Ma&apos;lumotlar Supabase infratuzilmasida, Row Level Security (RLS) siyosatlari bilan himoyalangan
        holda saqlanadi. Maxfiy fayllar (masalan, oylik yangilanish materiallari, ariza fayllari) faqat
        vaqtinchalik, imzolangan havolalar orqali va faqat vakolatli shaxslarga ko&apos;rinadi.
      </p>

      <h2>4. Cookie fayllari</h2>
      <p>
        Sayt sessiya boshqaruvi (kirish holati), anonim Jaxongir AI suhbatlari va sahifa ko&apos;rishlarini
        aniqlashtirish (takroriy hisoblashning oldini olish) uchun zarur cookie fayllaridan foydalanadi.
      </p>

      <h2>5. Uchinchi tomonlar bilan almashish</h2>
      <p>
        Ma&apos;lumotlar uchinchi shaxslarga sotilmaydi. Suhbat va so&apos;rovlarni qayta ishlash uchun
        OpenAI xizmatidan foydalaniladi — bunda faqat zarur kontekst yuboriladi, maxfiy kalitlar yoki
        boshqa foydalanuvchilarning shaxsiy ma&apos;lumotlari uzatilmaydi.
      </p>

      <h2>6. Foydalanuvchi huquqlari</h2>
      <ul>
        <li>O&apos;z ma&apos;lumotlaringizni ko&apos;rish, tahrirlash so&apos;rovini yuborish huquqi.</li>
        <li>Profilingizni o&apos;chirishni so&apos;rash huquqi.</li>
        <li>Ma&apos;lumotlaringiz qanday ishlatilishi haqida tushuntirish olish huquqi.</li>
      </ul>

      <h2>7. Bog&apos;lanish</h2>
      <p>
        Maxfiylik siyosati yuzasidan savollaringiz bo&apos;lsa, Platforma ma&apos;muriyatiga sayt orqali
        murojaat qilishingiz mumkin.
      </p>
    </LegalLayout>
  );
}
