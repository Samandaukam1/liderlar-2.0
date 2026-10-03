"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";
import { signIn } from "@/app/kirish/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

/**
 * Kirishdan keyingi manzil — FAQAT shu saytning ichki yo'li.
 *
 * `?next=https://boshqa-sayt` yoki `//boshqa-sayt` qabul qilinsa, kirish
 * sahifasi fishing havolasiga aylanardi: odam haqiqiy saytda parol
 * yozib, begona sahifaga tushardi.
 */
function safeNext(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return "/kabinet";
  }
  return value;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { push } = useToast();
  /*
   * Parol tiklangandan keyin login oldindan yoziladi: odam uni
   * eslamasligi mumkin (tiklash aynan shuning uchun so'ralgan).
   */
  const recovered = searchParams.get("tiklandi") === "1";
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: searchParams.get("login") ?? "" },
  });

  async function onSubmit(values: LoginInput) {
    const result = await signIn(values);
    if (result.ok) {
      router.push(safeNext(searchParams.get("next")));
      router.refresh();
    } else {
      push({ title: "Kirishda xatolik", description: result.error, variant: "error" });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {recovered && (
        <p role="status" className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
          Parolingiz yangilandi. Endi yangi parol bilan kiring.
        </p>
      )}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy">Login yoki email</label>
        {/*
          `type="text"` — ATAYLAB. `type="email"` bo'lsa, brauzer
          "asadbekazamov" ni yuborishdan oldin o'zi rad etardi va
          loginli foydalanuvchi tizimga umuman kira olmasdi.
        */}
        <Input
          {...register("identifier")}
          type="text"
          placeholder="asadbekazamov"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
        />
        {errors.identifier && (
          <p className="mt-1 text-xs text-coral">{errors.identifier.message}</p>
        )}
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy">Parol</label>
        <Input {...register("password")} type="password" placeholder="••••••••" autoComplete="current-password" />
        {errors.password && <p className="mt-1 text-xs text-coral">{errors.password.message}</p>}
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Kirilmoqda..." : "Kirish"}
      </Button>
    </form>
  );
}
