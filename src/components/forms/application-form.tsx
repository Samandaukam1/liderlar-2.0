"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import {
  AGE_RANGES,
  GENDER_OPTIONS,
  applicationSchema,
  type ApplicationFormValues,
} from "@/lib/validation/application";
import { Input, Checkbox } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-coral">{message}</p>;
}

/** Radio tanlov — jins va yosh oralig'i uchun bir xil ko'rinish. */
function ChoiceChip({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="cursor-pointer">
      <input type="radio" className="peer sr-only" {...props} />
      <span className="block rounded-full border border-brand-soft bg-paper px-4 py-2 text-sm font-medium text-navy transition peer-checked:border-liderlar-blue peer-checked:bg-liderlar-blue peer-checked:text-paper peer-focus-visible:ring-2 peer-focus-visible:ring-cyan/40">
        {label}
      </span>
    </label>
  );
}

export function ApplicationForm() {
  const { push } = useToast();
  const [submitted, setSubmitted] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
  });

  const fullName = register("fullName");
  const promoCode = register("promoCode");

  async function onSubmit(values: ApplicationFormValues) {
    try {
      const response = await fetch("/api/application/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = (await response.json()) as { ok?: boolean; error?: string };
      if (response.ok && result.ok) {
        setSubmitted(true);
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
          Rahmat! Ariza tahririyat tomonidan ko&apos;rib chiqiladi va tez orada siz bilan bog&apos;lanamiz.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className="space-y-5 rounded-xl border border-brand-soft bg-paper p-6 shadow-card">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy" htmlFor="fullName">
            Ism-familiya *
          </label>
          <Input
            id="fullName"
            {...fullName}
            onChange={(event) => {
              event.target.value = event.target.value.toUpperCase();
              return fullName.onChange(event);
            }}
            className="uppercase"
            autoComplete="name"
            placeholder="ALISHER NAVOIY"
          />
          <p className="mt-1 text-xs text-ink-soft">
            To&apos;liq, lotin alifbosida va bosh harflarda yozing.
          </p>
          <FieldError message={errors.fullName?.message} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy" htmlFor="phone">
            Telefon raqam *
          </label>
          <Input id="phone" {...register("phone")} type="tel" autoComplete="tel" placeholder="+998 90 123 45 67" />
          <p className="mt-1 text-xs text-ink-soft">Iltimos, ishlaydigan telefon raqam qoldiring.</p>
          <FieldError message={errors.phone?.message} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy" htmlFor="telegram">
            Telegram profili *
          </label>
          <Input id="telegram" {...register("telegram")} placeholder="@username yoki +998 90 123 45 67" />
          <p className="mt-1 text-xs text-ink-soft">
            Telegramga ulangan ochiq telefon raqam yoki Telegram username. Username bo&apos;lsa @ belgisi bilan
            yozing.
          </p>
          <FieldError message={errors.telegram?.message} />
        </div>

        <div>
          <span className="mb-2 block text-sm font-medium text-navy">Jinsi *</span>
          <div className="flex flex-wrap gap-2">
            {GENDER_OPTIONS.map((option) => (
              <ChoiceChip key={option.value} label={option.label} value={option.value} {...register("gender")} />
            ))}
          </div>
          <FieldError message={errors.gender?.message} />
        </div>

        <div>
          <span className="mb-2 block text-sm font-medium text-navy">Yoshi *</span>
          <div className="flex flex-wrap gap-2">
            {AGE_RANGES.map((range) => (
              <ChoiceChip key={range} label={range} value={range} {...register("ageRange")} />
            ))}
          </div>
          <FieldError message={errors.ageRange?.message} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy" htmlFor="promoCode">
            Promo kod
          </label>
          <Input
            id="promoCode"
            {...promoCode}
            onChange={(event) => {
              event.target.value = event.target.value.toUpperCase().replace(/\s+/g, "");
              return promoCode.onChange(event);
            }}
            className="uppercase"
            placeholder="Agar bo'lsa"
          />
          <FieldError message={errors.promoCode?.message} />
        </div>
      </section>

      <label className="flex items-start gap-3 text-sm text-ink-soft">
        <Checkbox {...register("consent")} className="mt-0.5" />
        Men taqdim etgan ma&apos;lumotlarning qayta ishlanishi va e&apos;lon qilinishiga roziman.
      </label>
      <FieldError message={errors.consent?.message} />

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? "Yuborilmoqda..." : "Arizani yuborish"}
      </Button>
    </form>
  );
}
