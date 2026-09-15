import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ApplicationForm } from "@/components/forms/application-form";
import { getRegions } from "@/lib/data/reference";

export const metadata: Metadata = {
  title: "Ariza topshirish",
  description: "Liderlar.uz ensiklopediyasiga qo'shilish uchun ariza topshiring.",
};

/**
 * Hududlar BAZADAN olinadi, kodda qotib qolmaydi.
 *
 * Admin panelda hudud qo'shilsa yoki nomi o'zgarsa, forma deploy'siz
 * yangilanadi. Ro'yxatni kodga yozib qo'yish ikkita manba yaratardi
 * va ular vaqt o'tib ajralib ketardi — katalog filtri bir nomni,
 * ariza formasi boshqasini ko'rsatardi.
 */
export const dynamic = "force-dynamic";

export default async function ApplicationPage() {
  let regions: Array<{ id: string; name: string }> = [];
  let regionsFailed = false;
  try {
    regions = (await getRegions()).map((region) => ({
      id: region.id as string,
      name: region.name as string,
    }));
  } catch (error) {
    console.error("Hududlar yuklanmadi:", error);
    regionsFailed = true;
  }

  /*
   * HUDUD MAJBURIY, ya'ni ro'yxatsiz to'g'ri ariza qabul qilib
   * bo'lmaydi. Shuning uchun forma ko'rsatilmaydi — yarim ishlaydigan
   * forma odam vaqtini oladi va oxirida baribir rad etiladi.
   *
   * Amalda bu holat kamdan-kam: ro'yxat arizani saqlaydigan o'sha
   * bazadan o'qiladi, ya'ni u yetib bo'lmasa yuborish ham ishlamasdi.
   */
  if (regionsFailed || regions.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <Breadcrumbs items={[{ label: "Ariza topshirish" }]} />
        <h1 className="mt-4 font-display text-3xl font-bold text-navy sm:text-4xl">
          Ariza topshirish
        </h1>
        <p className="mt-4 rounded-xl border border-brand-soft bg-paper px-4 py-3 text-ink-soft">
          Forma vaqtincha ochilmadi. Iltimos, birozdan so&apos;ng qayta urinib ko&apos;ring.
        </p>
      </div>
    );
  }

  return renderForm(regions);
}

function renderForm(regions: Array<{ id: string; name: string }>) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Ariza topshirish" }]} />
      <h1 className="mt-4 font-display text-3xl font-bold text-navy sm:text-4xl">Ariza topshirish</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Quyidagi qisqa formani to&apos;ldiring — tahririyat arizangizni ko&apos;rib chiqib, siz bilan telefon yoki
        Telegram orqali bog&apos;lanadi.
      </p>

      <div className="mt-8">
        <ApplicationForm regions={regions} />
      </div>
    </div>
  );
}
