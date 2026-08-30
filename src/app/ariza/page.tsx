import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ApplicationForm } from "@/components/forms/application-form";

export const metadata: Metadata = {
  title: "Ariza topshirish",
  description: "Liderlar.uz ensiklopediyasiga qo'shilish uchun ariza topshiring.",
};

export default function ApplicationPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Ariza topshirish" }]} />
      <h1 className="mt-4 font-display text-3xl font-bold text-navy sm:text-4xl">Ariza topshirish</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Quyidagi qisqa formani to&apos;ldiring — tahririyat arizangizni ko&apos;rib chiqib, siz bilan telefon yoki
        Telegram orqali bog&apos;lanadi.
      </p>

      <div className="mt-8">
        <ApplicationForm />
      </div>
    </div>
  );
}
