import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/components/forms/signup-form";

export const metadata: Metadata = {
  title: "Ro'yxatdan o'tish",
  description: "Liderlar.uz platformasida ro'yxatdan o'ting.",
};

export default function SignupPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-brand-soft bg-paper p-8 shadow-card">
        <h1 className="font-display text-2xl font-bold text-navy">Ro&apos;yxatdan o&apos;tish</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Hisob yaratib, ariza holatini kuzatib boring va (tasdiqlangan nomzod bo&apos;lsangiz) shaxsiy
          kabinetdan foydalaning.
        </p>

        <div className="mt-6">
          <SignupForm />
        </div>

        <p className="mt-6 text-center text-sm text-ink-soft">
          Hisobingiz bormi?{" "}
          <Link href="/kirish" className="font-semibold text-liderlar-blue">
            Kirish
          </Link>
        </p>
      </div>
    </div>
  );
}
