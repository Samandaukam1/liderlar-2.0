"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Trash2, UploadCloud } from "lucide-react";
import { applicationSchema, type ApplicationFormValues } from "@/lib/validation/application";
import { Input, Textarea, Select, Checkbox } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type Option = { id: string; name: string };

export function ApplicationForm({ regions, directions }: { regions: Option[]; directions: Option[] }) {
  const { push } = useToast();
  const [submitted, setSubmitted] = React.useState(false);
  const [files, setFiles] = React.useState<File[]>([]);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
  });

  async function onSubmit(values: ApplicationFormValues) {
    const form = new FormData();
    form.set("payload", JSON.stringify(values));
    files.forEach((file) => form.append("files", file));

    try {
      const response = await fetch("/api/application/submit", { method: "POST", body: form });
      const result = (await response.json()) as { ok?: boolean; error?: string; warning?: string | null };
      if (response.ok && result.ok) {
        setSubmitted(true);
        if (result.warning) {
          push({ title: "Ariza qabul qilindi", description: result.warning, variant: "success" });
        }
      } else {
        push({ title: "Xatolik", description: result.error ?? "Qayta urinib ko'ring.", variant: "error" });
      }
    } catch {
      push({ title: "Ulanish xatosi", description: "Qayta urinib ko'ring.", variant: "error" });
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-brand-soft bg-mint/10 p-10 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-mint text-white">
          <CheckCircle2 className="h-8 w-8" aria-hidden />
        </span>
        <h2 className="font-display text-2xl font-bold text-navy">Arizangiz qabul qilindi!</h2>
        <p className="max-w-md text-ink-soft">
          Rahmat! Ariza tahririyat tomonidan ko&apos;rib chiqiladi va tasdiqlangach siz bilan bog&apos;lanamiz.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <section className="rounded-xl border border-brand-soft bg-paper p-6 shadow-card">
        <h2 className="font-display text-lg font-bold text-navy">Shaxsiy ma&apos;lumotlar</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy">Ism-familiya *</label>
            <Input {...register("fullName")} placeholder="Ism Familiya" />
            {errors.fullName && <p className="mt-1 text-xs text-coral">{errors.fullName.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy">Telefon raqam *</label>
            <Input {...register("phone")} placeholder="+998 90 123 45 67" />
            {errors.phone && <p className="mt-1 text-xs text-coral">{errors.phone.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy">Email</label>
            <Input {...register("email")} type="email" placeholder="email@example.com" />
            {errors.email && <p className="mt-1 text-xs text-coral">{errors.email.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy">Tug&apos;ilgan yil</label>
            <Select {...register("birthYear")} defaultValue="">
              <option value="">Tanlang</option>
              {Array.from({ length: 40 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
            {errors.birthYear && <p className="mt-1 text-xs text-coral">{errors.birthYear.message}</p>}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-brand-soft bg-paper p-6 shadow-card">
        <h2 className="font-display text-lg font-bold text-navy">Hudud va yo&apos;nalish</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy">Hudud</label>
            <Select {...register("regionId")} defaultValue="">
              <option value="">Tanlang</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy">Faoliyat yo&apos;nalishi</label>
            <Select {...register("directionId")} defaultValue="">
              <option value="">Tanlang</option>
              {directions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-brand-soft bg-paper p-6 shadow-card">
        <h2 className="font-display text-lg font-bold text-navy">Motivatsiya va portfolio</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy">Nima uchun Liderlar.uz ensiklopediyasiga qo&apos;shilmoqchisiz? *</label>
            <Textarea {...register("motivation")} rows={5} placeholder="O'zingiz, yutuqlaringiz va faoliyatingiz haqida qisqacha yozing..." />
            {errors.motivation && <p className="mt-1 text-xs text-coral">{errors.motivation.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy">Portfolio / ijtimoiy tarmoq havolalari</label>
            <Textarea {...register("portfolioLinks")} rows={3} placeholder="Har bir havolani yangi qatordan yozing" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy">Tasdiqlovchi fayllar</label>
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-brand-soft p-6 text-center hover:border-liderlar-blue">
              <UploadCloud className="h-7 w-7 text-liderlar-blue" aria-hidden />
              <span className="text-sm font-semibold text-navy">Surat yoki PDF tanlang</span>
              <span className="text-xs text-ink-soft">JPG, PNG, WEBP, PDF — har biri 20 MB gacha</span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                onChange={(event) =>
                  setFiles((current) => [...current, ...Array.from(event.target.files ?? [])])
                }
              />
            </label>
            {files.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {files.map((file, index) => (
                  <li
                    key={`${file.name}-${file.lastModified}-${index}`}
                    className="flex items-center justify-between rounded-md bg-navy/[0.03] px-3 py-2 text-sm"
                  >
                    <span className="truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => setFiles((current) => current.filter((_, i) => i !== index))}
                      className="text-coral"
                      aria-label={`${file.name} faylini olib tashlash`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <label className="flex items-start gap-3 text-sm text-ink-soft">
        <Checkbox {...register("consent")} className="mt-0.5" />
        Men taqdim etgan ma&apos;lumotlarning qayta ishlanishi va e&apos;lon qilinishiga roziman.
      </label>
      {errors.consent && <p className="text-xs text-coral">{errors.consent.message}</p>}

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? "Yuborilmoqda..." : "Arizani yuborish"}
      </Button>
    </form>
  );
}
