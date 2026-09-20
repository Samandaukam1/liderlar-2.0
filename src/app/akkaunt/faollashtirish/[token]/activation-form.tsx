"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import {
  activateWithNewAccount,
  activateWithExistingAccount,
  type ActivateResult,
} from "../actions";

/**
 * Faollashtirish formasi.
 *
 * IKKI YO'L:
 *
 *   1. Hisobi YO'Q — email va parol qo'yadi, yangi hisob ochiladi.
 *   2. Hisobi BOR — tizimga kirgan holda havolani ochadi va
 *      mavjud hisobi bog'lanadi. Ikkinchi hisob YARATILMAYDI.
 *
 * Ikkinchi yo'lda shaxs ikki tomondan tasdiqlanadi: odam
 * tizimga kirgan va havolani ushlab turibdi.
 */
export function ActivationForm({
  token,
  signedIn,
  signedInEmail,
}: {
  token: string;
  signedIn: boolean;
  signedInEmail: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  function finish(result: ActivateResult) {
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    setDone(result.candidateSlug);

    /*
     * Tokenli manzil brauzer tarixidan olib tashlanadi.
     *
     * Aks holda u "orqaga" tugmasi, tarix va referrer orqali
     * qolib ketardi — holbuki u bir martalik kalit edi.
     */
    router.replace("/kabinet");
  }

  if (done !== null) {
    return (
      <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-5 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" aria-hidden />
        <p className="mt-2 font-semibold text-emerald-800">Akkaunt faollashtirildi</p>
        <p className="mt-1 text-sm text-emerald-700">Shaxsiy kabinetingizga yo&apos;naltirilmoqda…</p>
      </div>
    );
  }

  if (signedIn) {
    return (
      <div>
        <div className="rounded-lg border border-brand-soft bg-ice/50 p-4 text-sm">
          <p className="text-ink">
            Siz{signedInEmail ? ` ${signedInEmail}` : ""} hisobi bilan tizimdasiz.
          </p>
          <p className="mt-1 text-xs text-ink-soft">
            Shu hisob ensiklopediyadagi profilingizga bog&apos;lanadi. Yangi hisob
            yaratilmaydi.
          </p>
        </div>

        {error && <p className="mt-3 text-sm font-semibold text-rose-600">{error}</p>}

        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => finish(await activateWithExistingAccount({ token })))
          }
          className="mt-4 w-full rounded-md bg-liderlar-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-electric-blue disabled:opacity-50"
        >
          {pending ? "Bog'lanmoqda…" : "Shu hisobni profilimga bog'lash"}
        </button>
      </div>
    );
  }

  const canSubmit =
    email.trim().length > 3 && password.length >= 8 && password === confirm && !pending;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) return;
        startTransition(async () =>
          finish(await activateWithNewAccount({ token, email: email.trim(), password })),
        );
      }}
    >
      <Field label="Email">
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          placeholder="siz@example.com"
          required
        />
      </Field>

      <Field label="Parol">
        <input
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
          placeholder="Kamida 8 belgi"
          minLength={8}
          required
        />
      </Field>

      <Field label="Parolni takrorlang">
        <input
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={inputClass}
          required
        />
      </Field>

      {confirm.length > 0 && password !== confirm && (
        <p className="mb-2 text-xs font-semibold text-rose-600">Parollar mos kelmadi.</p>
      )}

      {error && <p className="mb-2 text-sm font-semibold text-rose-600">{error}</p>}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-md bg-liderlar-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-electric-blue disabled:opacity-50"
      >
        {pending ? "Yaratilmoqda…" : "Akkauntni yaratish"}
      </button>

      <p className="mt-3 text-center text-xs text-ink-soft">
        Hisobingiz allaqachon bormi?{" "}
        <a href="/kirish" className="font-semibold text-liderlar-blue">
          Avval kiring
        </a>
        , so&apos;ng bu havolani qaytadan oching.
      </p>
    </form>
  );
}

const inputClass =
  "w-full rounded-md border border-brand-soft bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-liderlar-blue focus:outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block text-xs font-semibold text-navy">{label}</span>
      {children}
    </label>
  );
}
