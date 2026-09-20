import type { Metadata } from "next";
import Link from "next/link";
import { MEHR_COLORS } from "@/lib/mehr/brand";
import { getMehrFlags } from "@/lib/mehr/flags";
import { MehrClosed } from "@/components/mehr/mehr-closed";

export const metadata: Metadata = {
  title: "MEHR 365+ haqida",
  description: "MEHR 365+ qanday ishlaydi: tekshiruv, ball, sertifikat va mas'uliyat.",
  alternates: { canonical: "/mehr365/haqida" },
};

export const dynamic = "force-dynamic";

/**
 * MEHR haqida.
 *
 * Matn FAQAT amalda mavjud xulqni tasvirlaydi. Rejadagi
 * imkoniyatlar "bor" deb yozilmaydi — odam ularni izlab
 * topmasa, butun sahifaga ishonchi yo'qoladi.
 */
export default async function AboutPage() {
  const flags = await getMehrFlags();
  if (!flags.publicEnabled) return <MehrClosed />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1
        className="font-display text-3xl font-bold tracking-tight sm:text-4xl"
        style={{ color: MEHR_COLORS.ink }}
      >
        MEHR 365+ haqida
      </h1>

      <p className="mt-4 text-lg leading-relaxed" style={{ color: MEHR_COLORS.inkSoft }}>
        MEHR 365+ — Liderlar.uz ensiklopediyasining ijtimoiy tashabbusi. Maqsad oddiy:
        qilingan ezgulik ishi ko&apos;rinadigan va tekshiriladigan bo&apos;lsin.
      </p>

      <Block title="Tekshiruv qanday ishlaydi">
        <p>
          Tadbir joyida tashkilotchi QR ko&apos;rsatadi. QR qisqa muddatda yangilanadi,
          shuning uchun uni oldindan tarqatib bo&apos;lmaydi. Ishtirokchi uni skanerlaydi va
          ro&apos;yxatga tushadi.
        </p>
        <p>
          Tadbirdan keyin tashkilotchi dalillarni — suratlar, tavsif va natijani —
          yuboradi. Dalilsiz ish tekshiruvga umuman kirmaydi.
        </p>
        <p>
          Administrator ishtirok, dalil va tashkilotchining avvalgi tarixini ko&apos;rib
          chiqadi. Rad etish yoki tuzatish so&apos;rovi sababsiz bo&apos;lmaydi.
        </p>
      </Block>

      <Block title="Ballar">
        <p>
          Ball tasdiqdan <strong>oldin</strong> berilmaydi. Tasdiqlangandan keyin u
          o&apos;zgarmas daftarga tushadi: yozuvni tahrirlab yoki o&apos;chirib
          bo&apos;lmaydi. Xato bo&apos;lsa, ustiga ko&apos;rinadigan tuzatuvchi yozuv
          qo&apos;shiladi — tarix yo&apos;qolmaydi.
        </p>
        <p>
          Ball miqdori rolga bog&apos;liq: ishtirokchi, hamtashkilotchi va tashkilotchi
          uchun turlicha. Aniq qiymatlar administrator tomonidan boshqariladi.
        </p>
      </Block>

      <Block title="Sertifikatlar">
        <p>
          Har bir tasdiqlangan ishtirok uchun sertifikat beriladi. Sertifikatdagi QR
          ommaviy tekshirish sahifasiga olib boradi — ya&apos;ni qog&apos;ozdagi hujjat
          ham har doim jonli holatga ishora qiladi.
        </p>
        <p>
          Bekor qilingan sertifikat yashirilmaydi: tekshirish sahifasi uni ochiq
          &laquo;bekor qilingan&raquo; deb ko&apos;rsatadi.
        </p>
      </Block>

      <Block title="Mas'uliyat">
        <p>
          <strong>Tashkilotchi</strong> tadbir haqiqiyligiga javob beradi. Soxta dalil
          rad etishga va faoliyat cheklanishiga olib keladi.
        </p>
        <p>
          <strong>Ishtirokchi</strong> o&apos;z ishtirokini QR orqali o&apos;zi
          tasdiqlaydi. Ro&apos;yxat qo&apos;lda yozilmaydi.
        </p>
      </Block>

      <Block title="Maxfiylik">
        <p>
          Ommaviy sahifada hudud va tadbir joyi nomi ko&apos;rsatiladi, aniq koordinata
          esa <strong>hech qachon</strong> chiqmaydi — u faqat check-in tekshiruvi uchun
          ishlatiladi.
        </p>
        <p>
          Telefon, elektron pochta va ichki tekshiruv yozishmalari ommaviy yo&apos;lga
          umuman chiqmaydi.
        </p>
      </Block>

      <Block title="Liderlar.uz bilan bog'liqlik">
        <p>
          MEHR 365+ alohida sayt emas — u Liderlar.uz ichidagi bo&apos;lim. Volontyorning
          sahifasi bosilganda uning mavjud ensiklopediya profili ochiladi; ikkinchi
          biografiya yaratilmaydi.
        </p>
        <Link
          href="/"
          className="mt-3 inline-block font-semibold"
          style={{ color: MEHR_COLORS.blue }}
        >
          Liderlar Ensiklopediyasiga qaytish →
        </Link>
      </Block>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-bold" style={{ color: MEHR_COLORS.ink }}>
        {title}
      </h2>
      <div
        className="mt-3 space-y-3 text-base leading-relaxed"
        style={{ color: MEHR_COLORS.inkSoft }}
      >
        {children}
      </div>
    </section>
  );
}
