"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { MailCheck } from "lucide-react";
import { signupSchema, type SignupInput } from "@/lib/validation/auth";
import { signUp } from "@/app/royxatdan-otish/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function SignupForm() {
  const router = useRouter();
  const { push } = useToast();
  const [emailSent, setEmailSent] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

  async function onSubmit(values: SignupInput) {
    const result = await signUp(values);
    if (!result.ok) {
      push({ title: "Ro'yxatdan o'tishda xatolik", description: result.error, variant: "error" });
      return;
    }
    if (result.needsEmailConfirmation) {
      setEmailSent(true);
    } else {
      router.push("/kabinet");
      router.refresh();
    }
  }

  if (emailSent) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-brand-soft bg-liderlar-blue/5 p-6 text-center">
        <MailCheck className="h-8 w-8 text-liderlar-blue" aria-hidden />
        <p className="font-semibold text-navy">Emailingizni tasdiqlang</p>
        <p className="text-sm text-ink-soft">Hisobingizni faollashtirish uchun emailingizga yuborilgan havolani bosing.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy">Ism-familiya</label>
        <Input {...register("fullName")} placeholder="Ism Familiya" autoComplete="name" />
        {errors.fullName && <p className="mt-1 text-xs text-coral">{errors.fullName.message}</p>}
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy">Email</label>
        <Input {...register("email")} type="email" placeholder="email@example.com" autoComplete="email" />
        {errors.email && <p className="mt-1 text-xs text-coral">{errors.email.message}</p>}
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy">Parol</label>
        <Input {...register("password")} type="password" placeholder="••••••••" autoComplete="new-password" />
        {errors.password && <p className="mt-1 text-xs text-coral">{errors.password.message}</p>}
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy">Parolni tasdiqlang</label>
        <Input {...register("confirmPassword")} type="password" placeholder="••••••••" autoComplete="new-password" />
        {errors.confirmPassword && <p className="mt-1 text-xs text-coral">{errors.confirmPassword.message}</p>}
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Yuborilmoqda..." : "Ro'yxatdan o'tish"}
      </Button>
    </form>
  );
}
