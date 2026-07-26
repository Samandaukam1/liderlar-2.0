"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";
import { signIn } from "@/app/kirish/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { push } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    const result = await signIn(values);
    if (result.ok) {
      router.push(searchParams.get("next") ?? "/kabinet");
      router.refresh();
    } else {
      push({ title: "Kirishda xatolik", description: result.error, variant: "error" });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy">Email</label>
        <Input {...register("email")} type="email" placeholder="email@example.com" autoComplete="email" />
        {errors.email && <p className="mt-1 text-xs text-coral">{errors.email.message}</p>}
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
