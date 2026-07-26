import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/forms/login-form";

export const metadata: Metadata = {
  title: "Kirish",
  description: "Liderlar.uz platformasiga kirish.",
};

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-brand-soft bg-paper p-8 shadow-card">
        <h1 className="font-display text-2xl font-bold text-navy">Xush kelibsiz</h1>
        <p className="mt-2 text-sm text-ink-soft">Shaxsiy kabinetingizga kirish uchun tizimga kiring.</p>

        <div className="mt-6">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-sm text-ink-soft">
          Hisobingiz yo&apos;qmi?{" "}
          <Link href="/royxatdan-otish" className="font-semibold text-liderlar-blue">
            Ro&apos;yxatdan o&apos;ting
          </Link>
        </p>
      </div>
    </div>
  );
}
