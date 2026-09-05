import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/legal-layout";
import { SITE_NAME } from "@/lib/constants";
import { getLegalPage } from "@/lib/data/legal";
import { formatDateUz } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Ommaviy oferta",
  description: `${SITE_NAME} xizmatlaridan foydalanish yuzasidan ommaviy oferta shartlari.`,
};

export default async function PublicOfferPage() {
  const page = await getLegalPage("oferta").catch(() => null);
  if (page && page.content.length > 100 && !page.content.includes("admin panel orqali")) {
    return (
      <LegalLayout title={page.title} updatedAt={formatDateUz(page.updated_at)}>
        <div className="whitespace-pre-wrap">{page.content}</div>
      </LegalLayout>
    );
  }

  return (
    <LegalLayout title="Ommaviy oferta" updatedAt="2026-07-24">
      <p>
        Ushbu ommaviy oferta (keyingi o&apos;rinlarda — &laquo;Oferta&raquo;) {SITE_NAME} platformasi
        (keyingi o&apos;rinlarda — &laquo;Platforma&raquo;) tomonidan taqdim etiladigan xizmatlardan
        foydalanish shartlarini belgilaydi. Platformadan foydalanish orqali foydalanuvchi ushbu Oferta
        shartlarini to&apos;liq va so&apos;zsiz qabul qiladi.
      </p>

      <h2>1. Umumiy qoidalar</h2>
      <ol>
        <li>Platforma O&apos;zbekistonning faol, iqtidorli va yetakchi yoshlarini birlashtiruvchi raqamli ensiklopediya, reyting va media markazi sifatida faoliyat yuritadi.</li>
        <li>Oferta O&apos;zbekiston Respublikasi Fuqarolik kodeksining ommaviy oferta institutiga muvofiq tuziladi.</li>
        <li>Platforma ma&apos;muriyati Oferta shartlarini istalgan vaqtda bir tomonlama tartibda o&apos;zgartirish huquqiga ega, o&apos;zgarishlar ushbu sahifada e&apos;lon qilingan kundan boshlab kuchga kiradi.</li>
      </ol>

      <h2>2. Shartnoma predmeti</h2>
      <ol>
        <li>Platforma foydalanuvchilarga o&apos;z profilini yaratish, ariza topshirish, kontent (biografik ma&apos;lumot, yutuqlar, media) joylashtirish va reyting tizimida ishtirok etish imkoniyatini beradi.</li>
        <li>Nomzodlar haqidagi ma&apos;lumotlar faqat tahririyat tomonidan tasdiqlangandan so&apos;ng ommaviy profilga chiqariladi.</li>
      </ol>

      <h2>3. Tomonlarning huquq va majburiyatlari</h2>
      <ol>
        <li>Foydalanuvchi taqdim etgan barcha ma&apos;lumotlarning to&apos;g&apos;riligi uchun javobgardir.</li>
        <li>Platforma joylashtirilgan ma&apos;lumotlarni tahrirlash, ko&apos;rib chiqish va zarur holatda rad etish huquqini o&apos;zida saqlab qoladi.</li>
        <li>Foydalanuvchi Platformaga yuborilgan materiallarni qayta ishlash va e&apos;lon qilishga rozilik bildiradi (Maxfiylik siyosatiga muvofiq).</li>
      </ol>

      <h2>4. Javobgarlik</h2>
      <p>
        Platforma foydalanuvchilar tomonidan taqdim etilgan ma&apos;lumotlarning haqiqiyligi bo&apos;yicha
        oldindan tekshiruv o&apos;tkazadi, biroq har qanday nizoli holatlarda yakuniy javobgarlik ma&apos;lumot
        taqdim etgan shaxsga yuklanadi.
      </p>

      <h2>5. Nizolarni hal qilish</h2>
      <p>
        Oferta yuzasidan kelib chiqadigan barcha nizolar muzokaralar yo&apos;li bilan, kelishuvga
        erishilmagan taqdirda esa O&apos;zbekiston Respublikasi qonunchiligida belgilangan tartibda hal
        qilinadi.
      </p>

      <h2>6. Yakuniy qoidalar</h2>
      <p>
        Ushbu Oferta bilan bog&apos;liq savollar yuzasidan Platforma ma&apos;muriyatiga sayt orqali
        murojaat qilishingiz mumkin.
      </p>
    </LegalLayout>
  );
}
